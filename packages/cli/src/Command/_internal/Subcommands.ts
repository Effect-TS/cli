// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import * as O from "@effect-ts/core/Option"
import { matchTag_ } from "@effect-ts/system/Utils"

import * as BuiltIns from "../../BuiltInOption"
import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { CommandDirective } from "../../CommandDirective"
import * as Directive from "../../CommandDirective"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { ValidationError } from "../../Validation"
import * as Validation from "../../Validation"
import { instruction } from "../operations"
import type { Command } from "./Base"
import { Base } from "./Base"

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

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export function helpDoc_<A, B>(
  self: Subcommands<A, B>,
  cont: (a: Command<any>) => HelpDoc
): HelpDoc {
  return Help.blocksT(
    cont(self.parent),
    Help.h1("SUBCOMMANDS"),
    subcommandsDescription_(self, self.child)
  )
}

/**
 * @ets_data_first helpDoc_
 */
export function helpDoc(cont: (a: Command<any>) => HelpDoc) {
  return <A, B>(self: Subcommands<A, B>): HelpDoc => helpDoc_(self, cont)
}

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export function parse_<A, B>(
  self: Subcommands<A, B>,
  args: Array<string>,
  cont: (
    a: Command<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<ValidationError, CommandDirective<any>>,
  helpDoc: (a: Command<any>) => HelpDoc,
  config: CliConfig = Config.defaultConfig
): T.IO<ValidationError, CommandDirective<Tuple<[A, B]>>> {
  return T.catchSome_(
    T.chain_(
      cont(self.parent, args, config),
      T.matchTag({
        BuiltIn: (_) =>
          _.option._tag === "ShowHelp"
            ? T.map_(
                T.chain_(
                  T.orElse_(cont(self.child, args.slice(1), config), () =>
                    T.succeed(Directive.builtIn(BuiltIns.showHelp(helpDoc(self))))
                  ),
                  (help) =>
                    help._tag === "BuiltIn" && help.option._tag === "ShowHelp"
                      ? T.succeed(help.option.helpDoc)
                      : T.fail(Validation.invalidArgument(Help.empty))
                ),
                (help) => Directive.builtIn(BuiltIns.showHelp(help))
              )
            : T.succeed(Directive.builtIn(_.option)),
        UserDefined: (_) =>
          A.isNonEmpty(_.leftover)
            ? T.map_(
                cont(self.child, _.leftover, config),
                Directive.map((b) => Tp.tuple(_.value, b))
              )
            : T.succeed(Directive.builtIn(BuiltIns.showHelp(helpDoc(self))))
      })
    ),
    () =>
      A.isEmpty(args)
        ? O.some(
            T.succeed(
              Directive.builtIn(
                new BuiltIns.ShowHelp({
                  helpDoc: helpDoc_(self, helpDoc)
                })
              )
            )
          )
        : O.none
  )
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
  helpDoc: (a: Command<any>) => HelpDoc,
  config: CliConfig = Config.defaultConfig
) {
  return <A, B>(
    self: Subcommands<A, B>
  ): T.IO<ValidationError, CommandDirective<Tuple<[A, B]>>> =>
    parse_(self, args, cont, helpDoc, config)
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

export function subcommandsDescription_<A, B, C>(
  self: Subcommands<A, B>,
  command: Command<C>
): HelpDoc {
  return matchTag_(
    instruction(self),
    {
      Single: (_) =>
        Help.p(
          Help.spansT(Help.text(_.name), Help.text(" \t "), getHelpDescription(_.help))
        ),
      Map: (_) => subcommandsDescription_(self, _.command),
      OrElse: (_) =>
        Help.enumeration([
          subcommandsDescription_(self, _.left),
          subcommandsDescription_(self, _.right)
        ])
    },
    () => Help.empty
  )
}

/**
 * @ets_data_first subcommandsDescription_
 */
export function subcommandsDescription<C>(command: Command<C>) {
  return <A, B>(self: Subcommands<A, B>): HelpDoc =>
    subcommandsDescription_(self, command)
}

function getHelpDescription(helpDoc: HelpDoc): HelpDoc {
  switch (helpDoc._tag) {
    case "Header":
      return helpDoc.value
    case "Paragraph":
      return helpDoc.value
    default:
      return Help.space
  }
}
