// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as T from "@effect-ts/core/Effect"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { CommandDirective } from "../../CommandDirective"
import type { ValidationError } from "../../Validation"
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

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export function parseOrElse_<A>(
  self: OrElse<A>,
  args: Array<string>,
  cont: (
    a: Command<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<ValidationError, CommandDirective<any>>,
  config: CliConfig = Config.defaultConfig
): T.IO<ValidationError, CommandDirective<A>> {
  return T.orElse_(cont(self.left, args, config), () => cont(self.right, args, config))
}

export function parseOrElse(
  args: Array<string>,
  cont: (
    a: Command<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<ValidationError, CommandDirective<any>>,
  config: CliConfig = Config.defaultConfig
) {
  return <A>(self: OrElse<A>): T.IO<ValidationError, CommandDirective<A>> =>
    parseOrElse_(self, args, cont, config)
}
