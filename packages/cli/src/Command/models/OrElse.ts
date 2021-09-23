// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import * as S from "@effect-ts/core/Collections/Immutable/Set"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import * as Equal from "@effect-ts/core/Equal"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { CommandDirective } from "../../CommandDirective"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { UsageSynopsis } from "../../UsageSynopsis"
import * as Synopsis from "../../UsageSynopsis"
import type { ValidationError } from "../../Validation"
import type { Command } from "../definition"

/**
 * Represents alternative execution of commands.
 *
 * In the event that the `left` command cannot be parsed successfully, the
 * command-line application will attempt to parse the `right` command from
 * the provided arguments.
 */
export class OrElse<A> implements Command<A> {
  constructor(readonly left: Command<A>, readonly right: Command<A>) {}

  get names(): Set<string> {
    return S.union_(Equal.string)(this.left.names, this.right.names)
  }

  get helpDoc(): HelpDoc {
    return Help.sequence_(this.left.helpDoc, this.right.helpDoc)
  }

  get synopsis(): UsageSynopsis {
    return new Synopsis.Mixed()
  }

  parse(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<ValidationError, CommandDirective<A>> {
    return T.orElse_(this.left.parse(args, config), () =>
      this.right.parse(args, config)
    )
  }
}
