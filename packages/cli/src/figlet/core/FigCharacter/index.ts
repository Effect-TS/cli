// ets_tracing: off

import { Case } from "@effect-ts/core/Case"
import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as E from "@effect-ts/core/Either"
import type { Equal } from "@effect-ts/core/Equal"
import * as Eq from "@effect-ts/core/Equal"
import { pipe } from "@effect-ts/core/Function"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import * as String from "@effect-ts/core/String"
import * as Structural from "@effect-ts/core/Structural"

import type { FigletResult } from "../../error/FigletException"
import { FigCharacterError, FigHeaderError } from "../../error/FigletException"
import type { FigHeader } from "../FigHeader"
import type { SubColumns } from "../SubElements/SubColumns"
import type { SubLines } from "../SubElements/SubLines"
import * as SL from "../SubElements/SubLines"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * The definition of a single Figlet character, part of a FigFont, which is
 * composed of `SubLines`.
 *
 * A `FigCharacter` cannot be instantiated directly. Instead, one must use one
 * of the provided constructors to perform validation of the defining lines
 * of the character.
 */
export class FigCharacter extends Case<{
  /**
   * The identifier code of the `FigFont` where this `FigCharacter` belongs.
   */
  readonly fontId: string
  /**
   * The name of the `FigCharacter`, which is the character that this
   * `FigCharacter` represents.
   */
  readonly name: string
  /**
   * The strings composing the lines of the `FigCharacter`.
   */
  readonly lines: SubLines
  /**
   * The character marking the end of a line in the definition of the
   * `FigCharacter`.
   */
  readonly endmark: string
  /**
   * The maximum width that the `FigCharacter` can have.
   */
  readonly width: number
  /**
   * The comment of the `FigCharacter` present only if it is not part of the
   * required characters.
   */
  readonly comment: Option<string>
  /**
   * The line in the file where the `FigCharacter` is defined.
   */
  readonly position: number
}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Creates a `FigCharacter` and validates the height and width of the specified
 * `lines`.
 *
 * @param fontId The identifier code of the `FigFont` where this `FigCharacter`
 * belongs.
 * @param maxWidth The maximum width that the `FigCharacter` can have.
 * @param height The height of the `FigCharacter` that must be respected.
 * @param name The name of the `FigCharacter`, which is the character that this
 * `FigCharacter` represents.
 * @param lines The strings composing the lines of the `FigCharacter`.
 * @param comment The comment of the `FigCharacter` present only if it is not
 * part of the required characters.
 * @param position
 * @returns A `FigletResult` containing the new `FigCharacter`, or a list of
 * `FigletException`s that occurred during parsing.
 */
export function make(
  fontId: string,
  maxWidth: number,
  height: number,
  name: string,
  lines: SubLines,
  comment: Option<string>,
  position: number
): FigletResult<FigCharacter> {
  const maxWidthV = validateMaxWidthArg(maxWidth)
  const nameV = validateName(name)
  const endmarkV = validateEndmark(name, position, lines)
  const cleanLinesV = E.chain_(endmarkV, (endmark) => cleanLines(endmark, lines))
  const argHeightV = validateHeightArg(height)
  const widthV = pipe(
    E.tuple(maxWidthV, cleanLinesV),
    E.chain(([maxWidth, lines]) => validateWidth(name, maxWidth, position, lines))
  )
  const heightV = pipe(
    E.tuple(argHeightV, cleanLinesV),
    E.chain(([height, lines]) => validateHeight(name, position, height, lines))
  )

  return pipe(
    heightV,
    E.chain(() =>
      pipe(
        E.struct({
          fontId: E.right(fontId),
          name: nameV,
          lines: cleanLinesV,
          endmark: endmarkV,
          width: widthV,
          comment: E.right(comment),
          position: E.right(position)
        }),
        E.map((_) => new FigCharacter(_))
      )
    )
  )
}

/**
 * Creates a `FigCharacter` using a `FigHeader` to validate the specified
 * `lines`.
 *
 * @param fontId The identifier code of the `FigFont` where this `FigCharacter`
 * belongs.
 * @param header The `FigHeader` that will be used to validate the `lines`.
 * @param name The name of the `FigCharacter`, which is the character that this
 * `FigCharacter` represents.
 * @param lines The strings composing the lines of the `FigCharacter`.
 * @param comment The comment of the `FigCharacter` present only if it is not
 * part of the required characters.
 * @param position
 * @returns A `FigletResult` containing the new `FigCharacter`, or a list of
 * `FigletException`s that occurred during parsing.
 */
export function makeFromHeader(
  fontId: string,
  header: FigHeader,
  name: string,
  lines: SubLines,
  comment: Option<string>,
  position: number
): FigletResult<FigCharacter> {
  return make(fontId, header.maxLength, header.height, name, lines, comment, position)
}

// -----------------------------------------------------------------------------
// Destructors
// -----------------------------------------------------------------------------

export function columns(self: FigCharacter): SubColumns {
  return SL.toSubcolumns(self.lines)
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

/**
 * Removes the endmarks from the lines of the character.
 */
function cleanLines(endmark: string, lines: SubLines): FigletResult<SubLines> {
  const regex = endmark.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "{1,2}$"
  const find = new RegExp(regex, "g")
  return pipe(lines, SL.map(String.replace(find, "")), E.right)
}

/**
 * Validates the name of a `FigCharacter`.
 */
function validateName(name: string): FigletResult<string> {
  return name !== "\uffff"
    ? E.right(name)
    : E.left([new FigCharacterError({ message: `Name "-1" is invalid` })])
}

/**
 * Validates the maximum width argument provided when creating a `FigCharacter`.
 */
function validateMaxWidthArg(maxWidth: number): FigletResult<number> {
  return E.fromPredicate_(
    maxWidth,
    (w) => w > 0,
    (w) => [
      new FigHeaderError({
        message: `Value of "maxLength" must be positive, received: ${w}`
      })
    ]
  )
}

/**
 */
function validateHeightArg(height: number): FigletResult<number> {
  return E.fromPredicate_(
    height,
    (h) => h > 0,
    (h) => [
      new FigHeaderError({
        message: `Value of "height" must be positive, received: ${h}`
      })
    ]
  )
}

/**
 * Validates the endmark for all lines.
 */
function validateEndmark(
  name: string,
  position: number,
  lines: SubLines
): FigletResult<string> {
  const linesTerminations = pipe(
    C.toArray(lines.value),
    A.chain((line) =>
      pipe(
        String.match_(line, /(.)\1?$/),
        O.getOrElse(() => A.emptyOf<string>()),
        A.head,
        O.fold(() => A.emptyOf<string>(), A.single)
      )
    ),
    A.map(String.trim)
  )

  const extractedEndmarksV: FigletResult<Array<string>> = linesTerminations.every(
    (l) => l.length > 0 && l.length <= 2
  )
    ? E.right(A.uniq(Eq.string)(A.chain_(linesTerminations, String.split(""))))
    : E.left(
        NA.single(
          new FigCharacterError({
            message:
              "Cannot determine endmark. There are lines with no termination or " +
              `more than 2-characters termination on character "${name}" defined ` +
              `at line ${position + 1}: (${linesTerminations.join(", ")})`
          })
        )
      )

  const chosenEndmarkV: FigletResult<Option<string>> = E.chain_(
    extractedEndmarksV,
    (extractedEndmarks) =>
      extractedEndmarks.length === 1
        ? E.right(A.head(extractedEndmarks))
        : E.left([
            new FigCharacterError({
              message:
                `Multiple endmarks found for character "${name}" defined at ` +
                `line ${position + 1}, only one endmark character is allowed: ` +
                `(${linesTerminations.join(", ")})`
            })
          ])
  )

  return E.chain_(
    chosenEndmarkV,
    O.fold(
      () =>
        E.left(
          NA.single(
            new FigCharacterError({
              message:
                `Can't determine endmark for character "${name}" defined at ` +
                `line ${position + 1}`
            })
          )
        ),
      (a) => E.right(a)
    )
  )
}

function validateWidth(
  name: string,
  maxLength: number,
  position: number,
  cleanLines: SubLines
): FigletResult<number> {
  const allLinesWidth = A.uniq(Eq.number)(
    A.map_(C.toArray(cleanLines.value), (_) => _.length)
  )

  if (maxLength <= 0) {
    return E.left(
      NA.single(
        new FigCharacterError({
          message: `The argument "maxLength" must be greater than zero, received: ${maxLength}`
        })
      )
    )
  }

  return pipe(
    A.head(allLinesWidth),
    O.filter(() => allLinesWidth.length === 1),
    O.fold(
      () =>
        E.left(
          NA.single(
            new FigCharacterError({
              message:
                `Lines for character "${name}" defined at line ${position + 1} ` +
                `are of different width: ${SL.showSubLines.show(cleanLines)}`
            })
          )
        ),
      (width) =>
        width <= maxLength
          ? E.right(width)
          : E.left(
              NA.single(
                new FigCharacterError({
                  message: `Maximum character width exceeded at line ${position + 1}`
                })
              )
            )
    )
  )
}

function validateHeight(
  name: string,
  position: number,
  height: number,
  cleanLines: SubLines
): FigletResult<number> {
  if (height <= 0) {
    return E.left(
      NA.single(
        new FigCharacterError({
          message: `The argument "height" must be greater than zero, received: ${height}`
        })
      )
    )
  }

  if (cleanLines.value.length === height) {
    return E.right(height)
  }

  return E.left(
    NA.single(
      new FigCharacterError({
        message:
          `The character "${name}" defined at line ${position + 1} doesn't ` +
          `respect the specified height of ${height}`
      })
    )
  )
}

// -----------------------------------------------------------------------------
// Instances
// -----------------------------------------------------------------------------

export const equalFigCharacter: Equal<FigCharacter> = Eq.makeEqual((x, y) =>
  x[Structural.equalsSym](y)
)
