// ets_tracing: off

import { Case } from "@effect-ts/core/Case"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import { pipe } from "@effect-ts/core/Function"
import * as Identity from "@effect-ts/core/Identity"
import * as Ord from "@effect-ts/core/Ord"
import type { Show } from "@effect-ts/core/Show"
import { makeShow } from "@effect-ts/core/Show"

import type { FigCharacter } from "../FigCharacter"
import * as FC from "../FigCharacter"
import type { FigFont } from "../FigFont"
import * as FF from "../FigFont"
import type { SubColumns } from "../SubElements/SubColumns"
import * as SC from "../SubElements/SubColumns"
import type { SubLines } from "../SubElements/SubLines"
import * as SL from "../SubElements/SubLines"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A `Figure` is a string rendered using a specific `FigFont`, and is made up
 * of multiple `FigCharacter`s.
 *
 * A `Figure` cannot be instantiated directly. Instead, one must use the
 * constructor definitions to perform validation of the header.
 */
export class Figure extends Case<{
  readonly font: FigFont
  readonly value: string
  readonly columns: Chunk<SubColumns>
}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Creates an empty `Figure` using the specified `FigFont`.
 *
 * @param font The `FigFont` that the `Figure` uses.
 * @returns An empty `Figure` that uses the given `FigFont`.
 */
export function empty(font: FigFont): Figure {
  return fromFigCharacter(FF.zero(font), font)
}

/**
 * Creates a `Figure` that contains a single character given as `FigCharacter`.
 *
 * @param char The first character of the `Figure`.
 * @param font The `FigFont` that the `Figure` uses.
 * @returns A `Figure` containing one character that uses the given `FigFont`.
 */
export function fromFigCharacter(char: FigCharacter, font: FigFont): Figure {
  return new Figure({ font, value: char.name, columns: C.single(FC.columns(char)) })
}

/**
 * Creates a `Figure` that contains a single character.
 *
 * @param char The first character of the `Figure`.
 * @param font The `FigFont` that the `Figure` uses.
 * @returns A `Figure` containing one character that uses the given `FigFont`.
 */
export function fromCharacter(char: string, font: FigFont): Figure {
  return new Figure({
    font,
    value: char,
    columns: C.single(FC.columns(FF.char_(font, char)))
  })
}

// -----------------------------------------------------------------------------
// Destructors
// -----------------------------------------------------------------------------

function hardblank(self: Figure): string {
  return self.font.header.hardblank
}

/**
 * The `Figure` represented as a collection of lines.
 */
export function lines(self: Figure): Chunk<SubLines> {
  return C.map_(self.columns, SC.toSubLines)
}

/**
 * The `Figure` represented as a list of lines stripped of their hardblanks.
 */
export function cleanLines(self: Figure): Chunk<SubLines> {
  return C.map_(lines(self), SL.replace(hardblank(self), " "))
}

/**
 * The columns representing the rendered `Figure` stripped of their hardblanks.
 */
export function cleanColumns(self: Figure): Chunk<SubColumns> {
  return C.map_(self.columns, SC.replace(hardblank(self), " "))
}

/**
 * Gets the maximum width of the `Figure`.
 */
export function width(self: Figure): number {
  const f = Ord.max(Ord.number)
  return pipe(
    lines(self),
    C.chain((line) => C.map_(line.value, (_) => _.length)),
    C.reduce(0, f)
  )
}

/**
 * Print the figure to a string.
 */
export function print(self: Figure): string {
  return pipe(
    cleanLines(self),
    C.foldMap(Identity.string)((_) => C.join_(_.value, "\n"))
  )
}

// -----------------------------------------------------------------------------
// Instances
// -----------------------------------------------------------------------------

export const showFigure: Show<Figure> = makeShow((self) => {
  return pipe(
    cleanLines(self),
    C.map((_) => C.join_(_.value, "\n")),
    C.join("\n")
  )
})
