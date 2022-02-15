// ets_tracing: off

import type { Command } from "./Base.js"
import { Base } from "./Base.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents the mapping of a value parsed by a command from one type to
 * another.
 */
export class Map<A, B> extends Base<B> {
  readonly _tag = "Map"

  constructor(
    /**
     * The command-line argument.
     */
    readonly command: Command<A>,
    /**
     * The mapping function to be applied to the value of the command.
     */
    readonly map: (a: A) => B
  ) {
    super()
  }
}
