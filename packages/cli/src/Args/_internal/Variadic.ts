// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Option } from "@effect-ts/core/Option"

import type { Args } from "./Base"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a variable number of command-line arguments.
 */
export class Variadic<A> extends Base<Array<A>> {
  readonly _tag = "Variadic"

  constructor(
    /**
     * The command-line argument which can be repeated.
     */
    readonly value: Args<A>,
    /**
     * The minimum number of allowed repetitions of the command-line argument.
     */
    readonly min: Option<number>,
    /**
     * The maximum number of allowed repetitions of the command-line argument.
     */
    readonly max: Option<number>
  ) {
    super()
  }
}
