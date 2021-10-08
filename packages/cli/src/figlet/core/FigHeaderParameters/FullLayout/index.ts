// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as E from "@effect-ts/core/Either"
import type { Equal } from "@effect-ts/core/Equal"
import { makeEqual } from "@effect-ts/core/Equal"
import * as O from "@effect-ts/core/Option"

import type { FigletResult } from "../../../error/FigletException"
import { FigHeaderError } from "../../../error/FigletException"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * The `FullLayout` parameter contained within a `FigHeader`.
 *
 * The `value` of a `FullLayout` is the numeric value of the `FullLayout`
 * contained in the Figlet font header.
 */
export type FullLayout =
  | EqualCharacterHorizontalSmushing
  | UnderscoreHorizontalSmushing
  | HierarchyHorizontalSmushing
  | OppositePairHorizontalSmushing
  | BigXHorizontalSmushing
  | HardblankHorizontalSmushing
  | HorizontalFitting
  | HorizontalSmushing
  | EqualCharacterVerticalSmushing
  | UnderscoreVerticalSmushing
  | HierarchyVerticalSmushing
  | HorizontalLineVerticalSmushing
  | VerticalLineSupersmushing
  | VerticalFitting
  | VerticalSmushing

export class EqualCharacterHorizontalSmushing extends Tagged(
  "EqualCharacterHorizontalSmushing"
)<{}> {
  value = 1
}

export class UnderscoreHorizontalSmushing extends Tagged(
  "UnderscoreHorizontalSmushing"
)<{}> {
  value = 2
}

export class HierarchyHorizontalSmushing extends Tagged(
  "HierarchyHorizontalSmushing"
)<{}> {
  value = 4
}

export class OppositePairHorizontalSmushing extends Tagged(
  "OppositePairHorizontalSmushing"
)<{}> {
  value = 8
}

export class BigXHorizontalSmushing extends Tagged("BigXHorizontalSmushing")<{}> {
  value = 16
}

export class HardblankHorizontalSmushing extends Tagged(
  "HardblankHorizontalSmushing"
)<{}> {
  value = 32
}

export class HorizontalFitting extends Tagged("HorizontalFitting")<{}> {
  value = 64
}

export class HorizontalSmushing extends Tagged("HorizontalSmushing")<{}> {
  value = 128
}

export class EqualCharacterVerticalSmushing extends Tagged(
  "EqualCharacterVerticalSmushing"
)<{}> {
  value = 256
}

export class UnderscoreVerticalSmushing extends Tagged(
  "UnderscoreVerticalSmushing"
)<{}> {
  value = 512
}

export class HierarchyVerticalSmushing extends Tagged("HierarchyVerticalSmushing")<{}> {
  value = 1024
}

export class HorizontalLineVerticalSmushing extends Tagged(
  "HorizontalLineVerticalSmushing"
)<{}> {
  value = 2048
}

export class VerticalLineSupersmushing extends Tagged("VerticalLineSupersmushing")<{}> {
  value = 4096
}

export class VerticalFitting extends Tagged("VerticalFitting")<{}> {
  value = 8192
}

export class VerticalSmushing extends Tagged("VerticalSmushing")<{}> {
  value = 16384
}

export const values = C.from([
  new EqualCharacterHorizontalSmushing(),
  new UnderscoreHorizontalSmushing(),
  new HierarchyHorizontalSmushing(),
  new OppositePairHorizontalSmushing(),
  new BigXHorizontalSmushing(),
  new HardblankHorizontalSmushing(),
  new HorizontalFitting(),
  new HorizontalSmushing(),
  new EqualCharacterVerticalSmushing(),
  new UnderscoreVerticalSmushing(),
  new HierarchyVerticalSmushing(),
  new HorizontalLineVerticalSmushing(),
  new VerticalLineSupersmushing(),
  new VerticalFitting(),
  new VerticalSmushing()
])

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Obtains the list of requested settings starting from the provided value.
 *
 * @param requestedSettings The number representing the `FullLayout`
 * @return The `FullLayout` that corresponds to the given numeric value.
 */
export function fromValue(requestedSettings: number): FigletResult<Chunk<FullLayout>> {
  if (requestedSettings < 0 || requestedSettings > 32767) {
    return E.left([
      new FigHeaderError({
        message: `FullLayout needs a value between 0 and 32767, inclusive, but received "${requestedSettings}"`
      })
    ])
  }

  const result = C.filterMap_(values, (setting) =>
    (setting.value & requestedSettings) !== 0 ? O.some(setting) : O.none
  )

  return E.right(result)
}

/**
 * The settings that correspond to horizontal smushing.
 */
export const horizontalSmushingRules: Chunk<FullLayout> = C.from([
  new EqualCharacterHorizontalSmushing(),
  new UnderscoreHorizontalSmushing(),
  new HierarchyHorizontalSmushing(),
  new OppositePairHorizontalSmushing(),
  new BigXHorizontalSmushing(),
  new HardblankHorizontalSmushing()
])

/**
 * The settings that correspond to vertical smushing.
 */
export const verticalSmushingRules: Chunk<FullLayout> = C.from([
  new EqualCharacterVerticalSmushing(),
  new UnderscoreVerticalSmushing(),
  new HierarchyVerticalSmushing(),
  new HorizontalLineVerticalSmushing(),
  new VerticalLineSupersmushing()
])

// -----------------------------------------------------------------------------
// Instances
// -----------------------------------------------------------------------------

export const equalFullLayout: Equal<FullLayout> = makeEqual(
  (x, y) => x._tag === y._tag && x.value === y.value
)
