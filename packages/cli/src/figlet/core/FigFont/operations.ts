// ets_tracing: off

import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as Map from "@effect-ts/core/Collections/Immutable/Map"
import * as Set from "@effect-ts/core/Collections/Immutable/Set"
import * as E from "@effect-ts/core/Either"
import * as O from "@effect-ts/core/Option"

import type { FigletResult } from "../../error/FigletException"
import type { FigCharacter } from "../FigCharacter"
import * as FC from "../FigCharacter"
import * as SL from "../SubElements/SubLines"
import { buildFont, FontBuilderState, processLine } from "./builder"
import type { FigFont } from "./definition"

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

/**
 * Creates a new `FigFont` by parsing an input collection of lines representing
 * a Figlet font file.
 *
 * @param file The file that contains the `FigFont` definition.
 * @param lines A `Chunk` that contains all the lines representing an Figlet
 * font file that defines the `FigFont`.
 * @return A `FigletResult` containing the new `FigFont`, or a list of errors
 * accumulated during creation of the `FigFont`.
 */
export function fromFile(file: string, lines: Chunk<string>): FigletResult<FigFont> {
  return E.chain_(
    C.reduce_(
      C.zipWithIndex(lines),
      E.right(
        new FontBuilderState({
          file,
          header: O.none,
          commentLines: C.empty(),
          loadedNames: Set.empty,
          loadedChars: C.empty(),
          loadedCharLines: C.empty<string>(),
          processTaggedFonts: false,
          hash: ""
        })
      ) as FigletResult<FontBuilderState>,
      (state, { tuple: [line, index] }) =>
        E.isLeft(state) ? state : processLine(state.right, line, index)
    ),
    buildFont
  )
}

/**
 * The empty character (as in the Unicode character `"\u0000"`).
 */
export function zero(self: FigFont): FigCharacter {
  return new FC.FigCharacter({
    fontId: self.id,
    name: "\u0000",
    lines: SL.zero(self.header.height),
    endmark: "@",
    width: 0,
    comment: O.none,
    position: -1
  })
}

/**
 * Returns a `FigCharacter` representation of the given char.
 *
 * If the requested character is not present, the `FigCharacter` `"0"` (as in
 * Unicode character `"\u0000"`) will be returned instead.
 *
 * @param char The character to process into a `FigCharacter`.
 * @returns The `FigCharacter` that represent the given input character.
 */
export function char_(self: FigFont, char: string): FigCharacter {
  return O.getOrElse_(Map.lookup_(self.characters, char), () => zero(self))
}

/**
 * Returns a `FigCharacter` representation of the given char.
 *
 * If the requested character is not present, the `FigCharacter` `"0"` (as in
 * Unicode character `"\u0000"`) will be returned instead.
 *
 * @ets_data_first char_
 * @param char The character to process into a `FigCharacter`.
 * @returns The `FigCharacter` that represent the given input character.
 */
export function char(char: string) {
  return (self: FigFont): FigCharacter => char_(self, char)
}

/**
 * Retrieves the `FigFont` representation of a character as a string.
 *
 * @param char The character to process into a `FigCharacter` and render.
 * @returns The string representation of the `FigCharacter` that represents
 * the specified input character.
 */
export function process_(self: FigFont, char: string): Chunk<string> {
  return SL.replace_(char_(self, char).lines, self.header.hardblank, " ").value
}

/**
 * Retrieves the `FigFont` representation of a character as a string.
 *
 * @ets_data_first process_
 * @param char The character to process into a `FigCharacter` and render.
 * @returns The string representation of the `FigCharacter` that represents
 * the specified input character.
 */
export function process(char: string) {
  return (self: FigFont): Chunk<string> => process_(self, char)
}
