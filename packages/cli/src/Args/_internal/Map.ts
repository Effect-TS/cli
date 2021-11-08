// ets_tracing: off

import type { Either } from "@effect-ts/core/Either"

import type { HelpDoc } from "../../Help"
import type { Args } from "./Base"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents the mapping of the value of a command-line argument from one
 * type to another.
 */
export class Map<A, B> extends Base<B> {
  readonly _tag = "Map"

  constructor(
    /**
     * The command-line argument.
     */
    readonly value: Args<A>,
    /**
     * The mapping function to be applied to the value of the command-line
     * argument.
     */
    readonly map: (a: A) => Either<HelpDoc, B>
  ) {
    super()
  }
}
