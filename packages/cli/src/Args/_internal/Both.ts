// ets_tracing: off

import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"

import type { Args } from "./Base.js"
import { Base } from "./Base.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a sequence of two arguments.
 *
 * The `head` `Args` will be validated first, followed by the `tail` `Args`.
 */
export class Both<A, B> extends Base<Tuple<[A, B]>> {
  readonly _tag = "Both"

  constructor(
    /**
     * The first command-line argument to validate.
     */
    readonly head: Args<A>,
    /**
     * The second command-line argument to validate.
     */
    readonly tail: Args<B>
  ) {
    super()
  }
}
