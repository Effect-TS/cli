// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as T from "@effect-ts/core/Effect"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { CommandDirective } from "../../CommandDirective"
import * as Directive from "../../CommandDirective"
import type { ValidationError } from "../../Validation"
import type { Command } from "./Base"
import { Base } from "./Base"

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

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export function parse_<A, B>(
  self: Map<A, B>,
  args: Array<string>,
  cont: (
    a: Command<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<ValidationError, CommandDirective<any>>,
  config: CliConfig = Config.defaultConfig
): T.IO<ValidationError, CommandDirective<B>> {
  return T.map_(cont(self.command, args, config), Directive.map(self.map))
}

/**
 * @ets_data_first parse_
 */
export function parse(
  args: Array<string>,
  cont: (
    a: Command<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<ValidationError, CommandDirective<any>>,
  config: CliConfig = Config.defaultConfig
) {
  return <A, B>(self: Map<A, B>): T.IO<ValidationError, CommandDirective<B>> =>
    parse_(self, args, cont, config)
}
