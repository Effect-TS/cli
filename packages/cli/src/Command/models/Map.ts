// ets_tracing: off

import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import type { Array } from "@effect-ts/system/Collections/Immutable/Array"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { CommandDirective } from "../../CommandDirective"
import * as Directive from "../../CommandDirective"
import type { HelpDoc } from "../../Help"
import type { UsageSynopsis } from "../../UsageSynopsis"
import type { ValidationError } from "../../Validation"
import type { Command } from "../definition"

/**
 * Represents the mapping of a value parsed by a command from one type to
 * another.
 */
export class Map<A, B> implements Command<B> {
  constructor(readonly command: Command<A>, readonly map: (a: A) => B) {}

  get names(): Set<string> {
    return this.command.names
  }

  get helpDoc(): HelpDoc {
    return this.command.helpDoc
  }

  get synopsis(): UsageSynopsis {
    return this.command.synopsis
  }

  parse(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<ValidationError, CommandDirective<B>> {
    return T.map_(this.command.parse(args, config), Directive.map(this.map))
  }
}
