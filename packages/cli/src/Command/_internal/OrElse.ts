// ets_tracing: off

import type { Command } from "./Base"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents alternative execution of commands.
 *
 * In the event that the `left` command cannot be parsed successfully, the
 * command-line application will attempt to parse the `right` command from
 * the provided arguments.
 */
export class OrElse<A> extends Base<A> {
  readonly _tag = "OrElse"

  constructor(
    /**
     * The first command to attempt.
     */
    readonly left: Command<A>,
    /**
     * The second command to attempt.
     */
    readonly right: Command<A>
  ) {
    super()
  }
}
