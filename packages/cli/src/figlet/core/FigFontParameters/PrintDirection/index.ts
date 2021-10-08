// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as E from "@effect-ts/core/Either"
import type { Equal } from "@effect-ts/core/Equal"
import * as Eq from "@effect-ts/core/Equal"
import * as O from "@effect-ts/core/Option"
import * as Structural from "@effect-ts/core/Structural"

import type { FigletResult } from "../../../error/FigletException"
import { FigHeaderError } from "../../../error/FigletException"
import type { FigHeader } from "../../FigHeader"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * The `PrintDirection` parameter contained within a `FigHeader`.
 *
 * The `PrintDirection` is represented by a numeric value:
 * - `0` represents `LeftToRight`
 * - `1` represents `RightToLeft`
 */
export type PrintDirection = LeftToRight | RightToLeft

/**
 * Represents a left-to-right print direction.
 */
export class LeftToRight extends Tagged("LeftToRight")<{}> {
  value = 0
}

/**
 * Represents a right-to-left print direction.
 */
export class RightToLeft extends Tagged("RightToLeft")<{}> {
  value = 1
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const values: Chunk<PrintDirection> = C.from([
  new LeftToRight(),
  new RightToLeft()
])

/**
 * Obtains the printing direction starting from the provided value.
 *
 * @param value The number representing the `PrintDirection`.
 * @returns The `PrintDirection` that corresponds to the given numeric value.
 */
export function fromValue(value: number): FigletResult<PrintDirection> {
  if (value === 0) {
    return E.right(new LeftToRight())
  } else if (value === 1) {
    return E.right(new RightToLeft())
  } else {
    return E.left([
      new FigHeaderError({
        message: `Could not parse value "${value}" to a PrintDirection`
      })
    ])
  }
}

/**
 * Interprets the header settings and returns the selected `PrintDirection`.
 *
 * @param header The `FigHeader` where the print direction is defined.
 * @returns A `FigletResult` containing the `PrintDirection`.
 */
export function fromHeader(header: FigHeader): FigletResult<PrintDirection> {
  return O.fold_(header.printDirection, () => E.right(new LeftToRight()), E.right)
}

// -----------------------------------------------------------------------------
// Instances
// -----------------------------------------------------------------------------

export const equalPrintDirection: Equal<PrintDirection> = Eq.makeEqual((x, y) =>
  x[Structural.equalsSym](y)
)
