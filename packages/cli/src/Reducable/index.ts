// ets_tracing: off

import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type Reducable<A, B> = A extends void ? B : B extends void ? A : Tuple<[A, B]>

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

export function fromTuple<A, B>({ tuple: [a, b] }: Tuple<[A, B]>): Reducable<A, B> {
  // @ts-expect-error
  return typeof a === "undefined" ? b : typeof b === "undefined" ? a : Tp.tuple(a, b)
}
