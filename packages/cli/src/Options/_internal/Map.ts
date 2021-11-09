// ets_tracing: off

import type { Either } from "@effect-ts/core/Either"

import type { ValidationError } from "../../Validation"
import type { Options } from "./Base"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents the mapping of the value of an option from one type to
 * another.
 */
export class Map<A, B> extends Base<B> {
  readonly _tag = "Map"

  constructor(
    /**
     * The command-line option.
     */
    readonly value: Options<A>,
    /**
     * The mapping function to be applied to the value of the command-line
     * option.
     */
    readonly map: (a: A) => Either<ValidationError, B>
  ) {
    super()
  }
}
