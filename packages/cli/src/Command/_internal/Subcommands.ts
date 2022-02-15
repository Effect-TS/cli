// ets_tracing: off

import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"

import type { Command } from "./Base.js"
import { Base } from "./Base.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a single command.
 */
export class Subcommands<A, B> extends Base<Tuple<[A, B]>> {
  readonly _tag = "Subcommands"

  constructor(
    /**
     * The parent command.
     */
    readonly parent: Command<A>,
    /**
     * The child command.
     */
    readonly child: Command<B>
  ) {
    super()
  }
}
