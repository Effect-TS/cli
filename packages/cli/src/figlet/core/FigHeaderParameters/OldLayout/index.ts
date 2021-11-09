// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as E from "@effect-ts/core/Either"
import type { Equal } from "@effect-ts/core/Equal"
import { pipe } from "@effect-ts/core/Function"
import { makeEqual } from "@effect-ts/system/Equal"

import type { FigletResult } from "../../../error/FigletException"
import { FigHeaderError } from "../../../error/FigletException"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * The `OldLayout` parameter contained within a `FigHeader`.
 *
 * The value of an `OldLayout` is the numeric value of the `OldLayout`
 * contained in the Figlet font header.
 */
export type OldLayout =
  | FullWidth
  | HorizontalFitting
  | EqualCharacterSmushing
  | UnderscoreSmushing
  | HierarchySmushing
  | OppositePairSmushing
  | BigXSmushing
  | HardblankSmushing

export class FullWidth extends Tagged("FullWidth")<{}> {
  value = -1
}

export class HorizontalFitting extends Tagged("HorizontalFitting")<{}> {
  value = 0
}

export class EqualCharacterSmushing extends Tagged("EqualCharacterSmushing")<{}> {
  value = 1
}

export class UnderscoreSmushing extends Tagged("UnderscoreSmushing")<{}> {
  value = 2
}

export class HierarchySmushing extends Tagged("HierarchySmushing")<{}> {
  value = 4
}

export class OppositePairSmushing extends Tagged("OppositePairSmushing")<{}> {
  value = 8
}

export class BigXSmushing extends Tagged("BigXSmushing")<{}> {
  value = 16
}

export class HardblankSmushing extends Tagged("HardblankSmushing")<{}> {
  value = 32
}

export const values: Chunk<OldLayout> = C.from([
  new FullWidth(),
  new HorizontalFitting(),
  new EqualCharacterSmushing(),
  new UnderscoreSmushing(),
  new HierarchySmushing(),
  new OppositePairSmushing(),
  new BigXSmushing(),
  new HardblankSmushing()
])

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Obtains the list of requested settings starting from the provided value.
 *
 * @param requestedSettings The number representing the `OldLayout`.
 * @return The `OldLayout` that corresponds to the given numeric value.
 */
export function fromValue(requestedSettings: number): FigletResult<Chunk<OldLayout>> {
  if (requestedSettings < -1 || requestedSettings > 63) {
    return E.left([
      new FigHeaderError({
        message: `OldLayout needs a value between 1 and 63, inclusive, received "${requestedSettings}"`
      })
    ])
  }

  if (requestedSettings === -1) {
    return E.right(C.single(new FullWidth()))
  }

  if (requestedSettings === 0) {
    return E.right(C.single(new HorizontalFitting()))
  }

  const result = pipe(
    values,
    C.filter((setting) => setting.value !== 0),
    C.chain((setting) =>
      (requestedSettings & setting.value) === setting.value
        ? C.single(setting)
        : C.empty<OldLayout>()
    )
  )

  return E.right(result)
}

// -----------------------------------------------------------------------------
// Instances
// -----------------------------------------------------------------------------

export const equalOldLayout: Equal<OldLayout> = makeEqual(
  (x, y) => x._tag === y._tag && x.value === y.value
)
