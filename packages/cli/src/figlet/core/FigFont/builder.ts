// ets_tracing: off

import { Case } from "@effect-ts/core/Case"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as Map from "@effect-ts/core/Collections/Immutable/Map"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as Set from "@effect-ts/core/Collections/Immutable/Set"
import * as E from "@effect-ts/core/Either"
import * as Equal from "@effect-ts/core/Equal"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import * as Ord from "@effect-ts/core/Ord"
import * as crypto from "crypto"
import * as path from "path"

import type { FigletResult } from "../../error/FigletException"
import {
  Applicative as FigletExceptionApplicative,
  FigCharacterError,
  FigFontError
} from "../../error/FigletException"
import type { FigCharacter } from "../FigCharacter"
import * as FC from "../FigCharacter"
import * as HorizontalLayout from "../FigFontParameters/HorizontalLayout"
import * as PrintDirection from "../FigFontParameters/PrintDirection"
import * as VerticalLayout from "../FigFontParameters/VerticalLayout"
import { FigFontSettings } from "../FigFontSettings"
import type { FigHeader } from "../FigHeader"
import * as FH from "../FigHeader"
import * as SL from "../SubElements/SubLines"
import { FigFont } from "./definition"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export class CharBuilderState extends Case<{
  readonly name: string
  readonly lines: Chunk<string>
  readonly comment: Option<string>
  readonly position: number
}> {}

export class FontBuilderState extends Case<{
  readonly file: string
  readonly hash: string
  readonly header: Option<FigHeader>
  readonly commentLines: Chunk<string>
  readonly loadedNames: Set.Set<string>
  readonly loadedChars: Chunk<CharBuilderState>
  readonly loadedCharLines: Chunk<string>
  readonly processTaggedFonts: boolean
}> {}

// -----------------------------------------------------------------------------
// Builders
// -----------------------------------------------------------------------------

/**
 * The list of all required characters that all `FigFont`s must define.
 */
export const requiredCharacters: Chunk<string> = C.map_(
  C.concat_(C.range(32, 126), C.from([196, 214, 220, 223, 228, 246, 252])),
  String.fromCharCode
)

/**
 * Processes a line calling the appropriate action based on the current state.
 */
export function processLine(
  state: FontBuilderState,
  line: string,
  index: number
): FigletResult<FontBuilderState> {
  if (index === 0) {
    return buildHeader(state, line)
  }

  const commentLines = O.fold_(
    state.header,
    () => {
      throw new Error(`Attempting to access font header that does not exist`)
    },
    (_) => _.commentLines
  )

  if (index <= commentLines) {
    return buildComment(state, line)
  }

  if (state.processTaggedFonts) {
    return buildTaggedCharacter(state, line, index)
  }

  return buildCharacter(state, line, index)
}

/**
 * Build the `FigFont` by parsing the `FontBuilderState`.
 */
export function buildFont(fontState: FontBuilderState): FigletResult<FigFont> {
  if (C.size(fontState.loadedCharLines) !== 0) {
    return E.left(
      NA.single(
        new FigCharacterError({
          message: "Incomplete character definition at the end of the file"
        })
      )
    )
  }

  if (O.isNone(fontState.header)) {
    return E.left(
      NA.single(
        new FigCharacterError({
          message: `Cannot build character without specifying a FigHeader`
        })
      )
    )
  }

  const header = fontState.header.value
  const nameV = E.right(path.parse(fontState.file).name)
  const fileV = E.right(fontState.file)
  const hashV = E.right(fontState.hash)
  const commentV = E.right(C.join_(fontState.commentLines, "\n"))
  const settingsV = E.map_(
    E.struct({
      hLayout: HorizontalLayout.fromHeader(header),
      vLayout: VerticalLayout.fromHeader(header),
      printDirection: PrintDirection.fromHeader(header)
    }),
    (_) => new FigFontSettings(_)
  )
  const charsV = E.map_(
    E.chain_(
      E.chain_(
        C.forEachF(FigletExceptionApplicative)((charState: CharBuilderState) =>
          buildChar(fontState, charState)
        )(fontState.loadedChars),
        validateRequiredCharacters
      ),
      (chars) => {
        const loadedTaggedCount = C.size(chars) - C.size(requiredCharacters)
        const codetagCount = O.getOrElse_(header.codeTagCount, () => loadedTaggedCount)

        if (loadedTaggedCount === codetagCount) {
          return E.right(chars)
        }

        return E.left(
          NA.single(
            new FigFontError({
              message:
                `The number of loaded tagged fonts (${loadedTaggedCount}) ` +
                `does not correspond with the value indicated in the header ` +
                `(${codetagCount})`
            })
          )
        )
      }
    ),
    (chars) => Map.make(C.map_(chars, (char) => [char.name, char]))
  )

  return E.map_(
    E.struct({
      id: hashV,
      name: nameV,
      file: fileV,
      header: E.right(header),
      comment: commentV,
      settings: settingsV,
      characters: charsV
    }),
    (_) => new FigFont(_)
  )
}

/**
 * Validates that all required characters are present for a given `FigFont`.
 */
function validateRequiredCharacters(
  characters: Chunk<FigCharacter>
): FigletResult<Chunk<FigCharacter>> {
  const loadedCharset = Set.fromArray(Equal.string)(
    C.toArray(C.map_(characters, (_) => _.name))
  )
  const missing = Set.toArray(Ord.string)(
    Set.difference_(Equal.string)(
      Set.fromArray(Equal.string)(C.toArray(requiredCharacters)),
      loadedCharset
    )
  )

  if (A.isNonEmpty(missing)) {
    return E.left([
      new FigCharacterError({
        message:
          "Missing required character definitions for the following " +
          `Figlet characters: ${A.join_(missing, ", ")}`
      })
    ])
  }

  return E.right(characters)
}

/**
 * Build the `FigFont` by parsing the character builder state.
 */
function buildChar(
  fontState: FontBuilderState,
  charState: CharBuilderState
): FigletResult<FigCharacter> {
  return O.fold_(
    fontState.header,
    () =>
      E.left(
        NA.single(
          new FigCharacterError({
            message: `Cannot build character without specifying a FigHeader`
          })
        )
      ),
    (header) =>
      FC.makeFromHeader(
        fontState.hash,
        header,
        charState.name,
        new SL.SubLines({ value: charState.lines }),
        charState.comment,
        charState.position
      )
  )
}

/**
 * Build the Figlet font header.
 */
function buildHeader(
  state: FontBuilderState,
  line: string
): FigletResult<FontBuilderState> {
  return E.chain_(FH.fromLine(line), (header) =>
    E.right(state.copy({ header: O.some(header) }))
  )
}

/**
 * Build the Figlet font comment section.
 */
function buildComment(
  state: FontBuilderState,
  line: string
): FigletResult<FontBuilderState> {
  return E.right(
    state.copy({
      commentLines: C.append_(state.commentLines, line)
    })
  )
}

/**
 * Builds a `FigCharacter` using the given state and the current line.
 */
function buildCharacter(
  state: FontBuilderState,
  line: string,
  index: number
): FigletResult<FontBuilderState> {
  if (O.isNone(state.header)) {
    return E.left(
      NA.single(
        new FigCharacterError({
          message: `Cannot build character without specifying a FigHeader`
        })
      )
    )
  }

  const header = state.header.value
  const loadedCharLines = C.append_(state.loadedCharLines, line)
  const hash = crypto
    .createHash("md5")
    .update(state.hash + crypto.createHash("md5").update(line).digest("hex"))
    .digest("hex")

  if (C.size(state.loadedCharLines) + 1 < header.height) {
    return E.right(state.copy({ loadedCharLines, hash }))
  }

  const startLine = index - C.size(state.loadedCharLines)
  const charNum = (startLine - header.commentLines - 1) / header.height
  const charBuilder = new CharBuilderState({
    name: C.unsafeGet_(requiredCharacters, charNum),
    lines: C.append_(state.loadedCharLines, line),
    comment: O.none,
    position: startLine
  })

  return E.right(
    state.copy({
      hash,
      loadedCharLines: C.empty<string>(),
      loadedNames: Set.insert_(Equal.string)(state.loadedNames, charBuilder.name),
      loadedChars: C.append_(state.loadedChars, charBuilder),
      processTaggedFonts: C.size(state.loadedChars) + 1 >= C.size(requiredCharacters)
    })
  )
}

/**
 * Builds a tagged `FigCharacter` using the given state and the current line.
 */
function buildTaggedCharacter(
  state: FontBuilderState,
  line: string,
  index: number
): FigletResult<FontBuilderState> {
  if (O.isNone(state.header)) {
    return E.left(
      NA.single(
        new FigCharacterError({
          message: `Cannot build character without specifying a FigHeader`
        })
      )
    )
  }

  const header = state.header.value
  const hash = crypto
    .createHash("md5")
    .update(state.hash + crypto.createHash("md5").update(line).digest("hex"))
    .digest("hex")

  if (state.loadedCharLines.length + 1 < header.height + 1) {
    const loadedCharLines = C.append_(state.loadedCharLines, line)
    return E.right(state.copy({ loadedCharLines, hash }))
  }

  const tagLineIndex = index - C.size(state.loadedCharLines)
  const nameV = parseTagName(C.head(state.loadedCharLines), tagLineIndex)
  const commentV = parseTagComment(C.head(state.loadedCharLines))
  const loadedCharLines = C.append_(C.drop_(state.loadedCharLines, 1), line)

  return E.map_(
    E.struct({
      name: nameV,
      lines: E.right(loadedCharLines),
      comment: commentV,
      position: E.right(tagLineIndex)
    }),
    (_) => {
      const charBuilder = new CharBuilderState(_)

      return state.copy({
        hash,
        loadedCharLines: C.empty<string>(),
        loadedNames: Set.insert_(Equal.string)(state.loadedNames, charBuilder.name),
        loadedChars: C.append_(state.loadedChars, charBuilder)
      })
    }
  )
}

/**
 * Parses the line of a tag to extract the name.
 */
function parseTagName(
  tagLine: Option<string>,
  tagLineIndex: number
): FigletResult<string> {
  if (O.isNone(tagLine)) {
    return E.left(
      NA.single(
        new FigCharacterError({ message: "Cannot parse tag name from empty tag line" })
      )
    )
  }

  const splitFontTag = C.from(tagLine.value.replace(/\s+/, "###").split("###"))

  return E.chain_(
    E.fromOption_(C.get_(splitFontTag, 0), () =>
      NA.single(
        new FigCharacterError({
          message:
            `Missing character code in the tag at line ${tagLineIndex + 1}: ` +
            `${tagLine}`
        })
      )
    ),
    (code) => parseCharCode(tagLineIndex, code)
  )
}

/**
 * Parses the line of a tag to extract the comment.
 */
function parseTagComment(tagLine: Option<string>): FigletResult<Option<string>> {
  if (O.isNone(tagLine)) {
    return E.left(
      NA.single(
        new FigCharacterError({ message: "Cannot parse tag name from empty tag line" })
      )
    )
  }

  const splitFontTag = C.from(tagLine.value.replace(/\s+/, "###").split("###"))

  return E.map_(E.right(O.getOrElse_(C.get_(splitFontTag, 1), () => "")), O.some)
}

/**
 * Parses a character code into a character.
 */
function parseCharCode(index: number, code: string): FigletResult<string> {
  if (/^-?\d+$/.test(code)) {
    return E.right(Number.parseInt(code, 10).toString())
  }
  if (/^-?0x[0-9a-f]+$/.test(code.toLocaleLowerCase())) {
    return E.right(Number.parseInt(code.replace(/0x/g, ""), 16).toString())
  }
  if (/^-?0\d+$/.test(code)) {
    return E.right(Number.parseInt(code, 8).toString())
  }
  return E.left(
    NA.single(
      new FigCharacterError({
        message:
          `Could not convert character code "${code}" defined at ` +
          `line ${index + 1} to integer`
      })
    )
  )
}
