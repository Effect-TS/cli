// ets_tracing: off

import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"

import type { Options } from "./Base"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a sequence of two options.
 *
 * The `head` option will be validated first, followed by the `tail` option.
 */
export class Both<A, B> extends Base<Tuple<[A, B]>> {
  readonly _tag = "Both"

  constructor(
    /**
     * The first command-line argument to validate.
     */
    readonly head: Options<A>,
    /**
     * The second command-line argument to validate.
     */
    readonly tail: Options<B>
  ) {
    super()
  }
}
