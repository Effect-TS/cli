// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import * as O from "@effect-ts/core/Option"

import * as BuiltIns from "../../BuiltInOption"
import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { CommandDirective } from "../../CommandDirective"
import * as Directive from "../../CommandDirective"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { UsageSynopsis } from "../../UsageSynopsis"
import * as Synopsis from "../../UsageSynopsis"
import type { ValidationError } from "../../Validation"
import * as Validation from "../../Validation"
import type { Command } from "../definition"
import { Map } from "./Map"
import { OrElse } from "./OrElse"
import { Single } from "./Single"

export class Subcommands<A, B> implements Command<Tuple<[A, B]>> {
  constructor(readonly parent: Command<A>, readonly child: Command<B>) {}

  get names(): Set<string> {
    return this.parent.names
  }

  get helpDoc(): HelpDoc {
    return Help.blocksT(
      this.parent.helpDoc,
      Help.h1("SUBCOMMANDS"),
      this.subcommandsDescription(this.child)
    )
  }

  get synopsis(): UsageSynopsis {
    return Synopsis.concat_(this.parent.synopsis, this.child.synopsis)
  }

  parse(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<ValidationError, CommandDirective<Tuple<[A, B]>>> {
    return T.catchSome_(
      T.chain_(this.parent.parse(args, config), (directive) => {
        switch (directive._tag) {
          case "BuiltIn": {
            if (directive.option._tag === "ShowHelp") {
              return T.succeed(
                Directive.builtIn(new BuiltIns.ShowHelp({ helpDoc: this.helpDoc }))
              )
            } else {
              return T.succeed(Directive.builtIn(directive.option))
            }
          }
          case "UserDefined": {
            if (A.isNonEmpty(directive.leftover)) {
              return T.map_(
                this.child.parse(directive.leftover, config),
                Directive.map((b) => Tp.tuple(directive.value, b))
              )
            } else {
              return T.fail(
                Validation.missingSubcommandError(Help.p(`Missing subcommand.`))
              )
            }
          }
        }
      }),
      () =>
        A.isEmpty(args)
          ? O.some(
              T.succeed(
                Directive.builtIn(new BuiltIns.ShowHelp({ helpDoc: this.helpDoc }))
              )
            )
          : O.none
    )
  }

  subcommandsDescription<C>(command: Command<C>): HelpDoc {
    if (command instanceof Single) {
      return Help.p(
        Help.spansT(
          Help.text(command.name),
          Help.text(" \t "),
          this.getHelpDescription(command.description)
        )
      )
    }
    if (command instanceof Map) {
      return this.subcommandsDescription(command.command)
    }
    if (command instanceof OrElse) {
      return Help.enumeration([
        this.subcommandsDescription(command.left),
        this.subcommandsDescription(command.right)
      ])
    }
    return Help.empty
  }

  private getHelpDescription(helpDoc: HelpDoc): HelpDoc {
    switch (helpDoc._tag) {
      case "Header":
        return helpDoc.value
      case "Paragraph":
        return helpDoc.value
      default:
        return Help.space
    }
  }
}
