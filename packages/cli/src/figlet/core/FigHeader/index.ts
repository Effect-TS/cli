// ets_tracing: off

import { Case } from "@effect-ts/core/Case"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as E from "@effect-ts/core/Either"
import type { Equal } from "@effect-ts/core/Equal"
import * as Eq from "@effect-ts/core/Equal"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import * as Structural from "@effect-ts/core/Structural"

import type { FigletResult } from "../../error/FigletException"
import { FigHeaderError } from "../../error/FigletException"
import * as PrintDirection from "../FigFontParameters/PrintDirection"
import * as FullLayout from "../FigHeaderParameters/FullLayout"
import * as OldLayout from "../FigHeaderParameters/OldLayout"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A Figlet font file header that contains raw configuration settings for the
 * Figlet font.
 *
 * A `FigHeader` cannot be instantiated directly. Instead, one must use the
 * constructor definitions to perform validation of the header.
 *
 * ```text
 * An example header line might look like the following:
 *
 *         flf2a$ 6 5 20 15 3 0 143 229    NOTE: The first five characters in
 *           |  | | | |  |  | |  |   |     the entire file must be "flf2a".
 *          /  /  | | |  |  | |  |   \
 * Signature  /  /  | |  |  | |   \   Codetag_Count
 *   Hardblank  /  /  |  |  |  \   Full_Layout*
 *        Height  /   |  |   \  Print_Direction
 *        Baseline   /    \   Comment_Lines
 *         Max_Length      Old_Layout*
 * ```
 * See http://www.jave.de/docs/figfont.txt for more information.
 */
export class FigHeader extends Case<{
  /**
   * The first five characters of the header, always `"flf2a"`.
   */
  readonly signature: string
  /**
   * Which sub-character is used to represent hardblanks in the `FigCharacter`
   * data (usually `"$"`).
   */
  readonly hardblank: string
  /**
   * The height of every `FigCharacter`.
   */
  readonly height: number
  /**
   * The number of lines from the baseline of a `FigCharacter` to the top of
   * the tallest `FigCharacter`.
   */
  readonly baseline: number
  /**
   * The maximum length of any line describing a `FigCharacter`.
   */
  readonly maxLength: number
  /**
   * Describes information about the horizontal layout, but does not include
   * all of the information desired by the most recent Figlet font drivers.
   */
  readonly oldLayout: Chunk<OldLayout.OldLayout>
  /**
   * How many lines of comments there are before the character definitions
   * begin.
   */
  readonly commentLines: number
  /**
   * Which direction the font is to be printed by default.
   */
  readonly printDirection: Option<PrintDirection.PrintDirection>
  /**
   * Describes ALL information about horizontal and vertical layout.
   */
  readonly fullLayout: Option<Chunk<FullLayout.FullLayout>>
  /**
   * The number of code-tagged (non-required) `FigCharacter`s.
   */
  readonly codeTagCount: Option<number>
}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

const SIGNATURE_INDEX = 0
const HEIGHT_INDEX = 1
const BASELINE_INDEX = 2
const MAXLENGTH_INDEX = 3
const OLDLAYOUT_INDEX = 4
const COMMENTLINES_INDEX = 5
const PRINTDIRECTION_INDEX = 6
const FULLLAYOUT_INDEX = 7
const CODETAGCOUNT_INDEX = 8

/**
 * Creates a new `FigHeader` from a the string representing the Figlet font
 * header.
 *
 * @param line The string containing the full header of the Figlet font file.
 * @return A `FigletResult` containing the new `FigHeader`, or a list of the
 * errors that occurred during parsing of the header line.
 */
export function fromLine(line: string): FigletResult<FigHeader> {
  const splitLine = C.from(line.split(" "))

  if (splitLine.length < 6) {
    return E.left([
      new FigHeaderError({
        message:
          `Wrong number of parameters in the Figlet font header. ` +
          `Expected at least 6 parameters but found ${splitLine.length}.`
      })
    ])
  }

  const [signatureText, hardblankText] = C.splitAt_(
    C.from(C.unsafeGet_(splitLine, SIGNATURE_INDEX).split("")),
    5
  )

  return E.map_(
    E.struct({
      signature: validateSignature(C.join_(signatureText, "")),
      hardblank: validateHardblank(C.join_(hardblankText, "")),
      height: validateHeight(C.unsafeGet_(splitLine, HEIGHT_INDEX)),
      baseline: validateBaseline(C.unsafeGet_(splitLine, BASELINE_INDEX)),
      maxLength: validateMaxLength(C.unsafeGet_(splitLine, MAXLENGTH_INDEX)),
      oldLayout: validateOldLayout(C.unsafeGet_(splitLine, OLDLAYOUT_INDEX)),
      commentLines: validateCommentLines(C.unsafeGet_(splitLine, COMMENTLINES_INDEX)),
      printDirection: validatePrintDirection(C.get_(splitLine, PRINTDIRECTION_INDEX)),
      fullLayout: validateFullLayout(C.get_(splitLine, FULLLAYOUT_INDEX)),
      codeTagCount: validateCodetagCount(C.get_(splitLine, CODETAGCOUNT_INDEX))
    }),
    (_) => new FigHeader(_)
  )
}

// -----------------------------------------------------------------------------
// Destructors
// -----------------------------------------------------------------------------

export function toSingleLine(self: FigHeader): string {
  const oldLayoutNum = C.reduce_(self.oldLayout, 0, (b, a) => b + a.value)
  const printDirectionNum = O.getOrElse_(
    O.map_(self.printDirection, (x) => ` ${x.value}`),
    () => ""
  )
  const fullLayoutNum = O.getOrElse_(
    O.map_(self.fullLayout, (x) => ` ${C.reduce_(x, 0, (b, a) => b + a.value)}`),
    () => ""
  )
  const codetagCountNum = O.getOrElse_(
    O.map_(self.codeTagCount, (x) => ` ${x}`),
    () => ""
  )
  return (
    `${self.signature}${self.hardblank} ` +
    `${self.height} ${self.baseline} ${self.maxLength} ${oldLayoutNum} ` +
    `${self.commentLines}${printDirectionNum}${fullLayoutNum}${codetagCountNum}`
  )
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

function headerFieldToInteger(s: string, field: string): FigletResult<number> {
  const n = Number.parseFloat(s)
  return Number.isNaN(n) || !Number.isInteger(n)
    ? E.left([
        new FigHeaderError({
          message: `Unable to parse header field "${field}" to integer, received: "${s}"`
        })
      ])
    : E.right(n)
}

function headerFieldToPositiveInteger(s: string, field: string): FigletResult<number> {
  return E.chain_(
    headerFieldToInteger(s, field),
    E.fromPredicate(
      (n) => n > 0,
      (n) => [
        new FigHeaderError({
          message: `Header field "${field}" must be positive, received: "${n}"`
        })
      ]
    )
  )
}

function headerFieldToNonNegativeInteger(
  s: string,
  field: string
): FigletResult<number> {
  return E.chain_(
    headerFieldToInteger(s, field),
    E.fromPredicate(
      (n) => n >= 0,
      (n) => [
        new FigHeaderError({
          message: `Header field "${field}" must be non-negative, received: "${n}"`
        })
      ]
    )
  )
}

function validateSignature(signature: string): FigletResult<string> {
  return E.fromPredicate_(
    signature,
    (s) => s === "flf2a",
    (s) => [
      new FigHeaderError({
        message: `Incorrect Figlet font signature, received "${s}"`
      })
    ]
  )
}

function validateHardblank(hardblank: string): FigletResult<string> {
  return E.fromPredicate_(
    hardblank,
    (s) => s.length === 1,
    (s) => [
      new FigHeaderError({
        message:
          'Header field "hardblank" must only be a single character, ' +
          `received "${s}"`
      })
    ]
  )
}

function validateHeight(height: string): FigletResult<number> {
  return headerFieldToPositiveInteger(height, "height")
}

function validateBaseline(baseline: string): FigletResult<number> {
  return headerFieldToPositiveInteger(baseline, "baseline")
}

function validateMaxLength(maxLength: string): FigletResult<number> {
  return headerFieldToPositiveInteger(maxLength, "maxLength")
}

function validateOldLayout(
  oldLayout: string
): FigletResult<Chunk<OldLayout.OldLayout>> {
  return E.chain_(headerFieldToInteger(oldLayout, "oldLayout"), OldLayout.fromValue)
}

function validateCommentLines(commentLines: string): FigletResult<number> {
  return headerFieldToNonNegativeInteger(commentLines, "commentLines")
}

function validatePrintDirection(
  printDirection: Option<string>
): FigletResult<Option<PrintDirection.PrintDirection>> {
  return O.forEachF(E.Applicative)((value: string) =>
    E.chain_(
      headerFieldToNonNegativeInteger(value, "printDirection"),
      PrintDirection.fromValue
    )
  )(printDirection)
}

function validateFullLayout(
  fullLayout: Option<string>
): FigletResult<Option<Chunk<FullLayout.FullLayout>>> {
  return O.forEachF(E.Applicative)((value: string) =>
    E.chain_(headerFieldToInteger(value, "fullLayout"), FullLayout.fromValue)
  )(fullLayout)
}

function validateCodetagCount(
  codetagCount: Option<string>
): FigletResult<Option<number>> {
  return O.forEachF(E.Applicative)((value: string) =>
    headerFieldToNonNegativeInteger(value, "codetagCount")
  )(codetagCount)
}

// -----------------------------------------------------------------------------
// Instances
// -----------------------------------------------------------------------------

export const equalFigHeader: Equal<FigHeader> = Eq.makeEqual((x, y) =>
  x[Structural.equalsSym](y)
)
