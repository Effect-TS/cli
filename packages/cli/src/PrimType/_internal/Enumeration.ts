// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"

import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A primitive type representing a value selected from a set of allowed values.
 */
export class Enumeration<A> extends Base<A> {
  readonly _tag = "Enumeration"

  constructor(
    /**
     * A list of allowed parameter-value pairs.
     */
    readonly cases: Array<Tuple<[string, A]>>
  ) {
    super()
  }
}
