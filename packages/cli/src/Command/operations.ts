// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import * as S from "@effect-ts/core/Collections/Immutable/Set"
import type * as T from "@effect-ts/core/Effect"
import type { Either } from "@effect-ts/core/Either"
import * as E from "@effect-ts/core/Either"
import * as Equal from "@effect-ts/core/Equal"
import type { Tuple } from "@effect-ts/system/Collections/Immutable/Tuple"
import { matchTag_ } from "@effect-ts/system/Utils"

import type { Args } from "../Args"
import type { CliConfig } from "../CliConfig"
import * as Config from "../CliConfig"
import type { CommandDirective } from "../CommandDirective"
import type { HelpDoc } from "../Help"
import * as Help from "../Help"
import type { Options } from "../Options"
import type { UsageSynopsis } from "../UsageSynopsis"
import * as Synopsis from "../UsageSynopsis"
import type { ValidationError } from "../Validation"
import * as Map from "./_internal/Map"
import * as OrElse from "./_internal/OrElse"
import * as Single from "./_internal/Single"
import * as Subcommands from "./_internal/Subcommands"
import type { Command, Instruction } from "./definition"

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Create a command.
 *
 * @param name The name of the command.
 * @param options The command-line options that can be passed to the command.
 * @param args The command-line arguments that can be passed to the command.
 * @param helpDoc The description for the command.
 */
export function command<OptionsType, ArgsType>(
  name: string,
  options: Options<OptionsType>,
  args: Args<ArgsType>,
  helpDoc: HelpDoc = Help.empty
): Command<Tuple<[OptionsType, ArgsType]>> {
  return new Single.Single(name, helpDoc, options, args)
}

// -----------------------------------------------------------------------------
// Combinators
// -----------------------------------------------------------------------------

export function subcommands_<A, B>(
  self: Command<A>,
  subcommand: Command<B>,
  ...subcommands: Array<Command<B>>
): Command<Tuple<[A, B]>> {
  return A.foldLeft_(
    subcommands,
    () => new Subcommands.Subcommands(self, subcommand),
    (head, tail) =>
      new Subcommands.Subcommands(
        self,
        A.reduce_(tail, orElse_(subcommand, head), orElse_)
      )
  )
}

/**
 * @ets_data_first subcommands_
 */
export function subcommands<B>(
  subcommand: Command<B>,
  ...subcommands: Array<Command<B>>
) {
  return <A>(self: Command<A>): Command<Tuple<[A, B]>> =>
    subcommands_(self, subcommand, ...subcommands)
}

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

/**
 * @ets_tagtimize identity
 */
export function instruction<A>(self: Command<A>): Instruction {
  // @ts-expect-error
  return self
}

export function map_<A, B>(self: Command<A>, f: (a: A) => B): Command<B> {
  return new Map.Map(self, f)
}

/**
 * @ets_data_first map_
 */
export function map<A, B>(f: (a: A) => B) {
  return (self: Command<A>): Command<B> => map_(self, f)
}

export function orElse_<A>(self: Command<A>, that: Command<A>): Command<A> {
  return new OrElse.OrElse(self, that)
}

/**
 * @ets_data_first orElse_
 */
export function orElse<A>(that: Command<A>) {
  return (self: Command<A>): Command<A> => orElse_(self, that)
}

export function orElseEither_<A, B>(
  self: Command<A>,
  that: Command<B>
): Command<Either<A, B>> {
  return orElse_<Either<A, B>>(map_(self, E.left), map_(that, E.right))
}

/**
 * @ets_data_first orElseEither_
 */
export function orElseEither<B>(that: Command<B>) {
  return <A>(self: Command<A>): Command<Either<A, B>> => orElseEither_(self, that)
}

/**
 * Return the names that can be use to invoke a command from the command-line.
 */
export function names<A>(self: Command<A>): Set<string> {
  return matchTag_(instruction(self), {
    Map: (_) => names(_.command),
    OrElse: (_) => S.union_(Equal.string)(names(_.left), names(_.right)),
    Single: (_) => S.singleton(_.name),
    Subcommands: (_) => names(_.parent)
  })
}

/**
 * Return the `HelpDoc` for a command.
 */
export function helpDoc<A>(self: Command<A>): HelpDoc {
  return matchTag_(instruction(self), {
    Map: (_) => helpDoc(_.command),
    OrElse: (_) => Help.sequence_(helpDoc(_.left), helpDoc(_.right)),
    Single: (_) => Single.helpDoc(_),
    Subcommands: (_) => Subcommands.helpDoc_(_, helpDoc)
  })
}

/**
 * Return the `UsageSynopsis` for a command.
 */
export function synopsis<A>(self: Command<A>): UsageSynopsis {
  return matchTag_(instruction(self), {
    Map: (_) => synopsis(_.command),
    OrElse: (_) => Synopsis.mixed,
    Single: (_) => Single.synopsis(_),
    Subcommands: (_) => Synopsis.concat_(synopsis(_.parent), synopsis(_.child))
  })
}

/**
 * Parses the command from the provided command-line arguments.
 *
 * @param self The command to attempt.
 * @param args The command-line arguments to parse.
 * @param config The `CliConfig` to use for validation.
 */
export function parse_<A>(
  self: Command<A>,
  args: Array<string>,
  config: CliConfig = Config.defaultConfig
): T.IO<ValidationError, CommandDirective<A>> {
  return matchTag_(instruction(self), {
    Map: (_) => Map.parse_(_, args, parse_, config),
    OrElse: (_) => OrElse.parse_(_, args, parse_, config),
    Single: (_) => Single.parse_(_, args, config),
    Subcommands: (_) => Subcommands.parse_(_, args, parse_, helpDoc)
  })
}

/**
 * Parses the command from the provided command-line arguments.
 *
 * @ets_data_first parse_
 * @param args The command-line arguments to parse.
 * @param config The `CliConfig` to use for validation.
 */
export function parse(args: Array<string>, config: CliConfig = Config.defaultConfig) {
  return <A>(self: Command<A>): T.IO<ValidationError, CommandDirective<A>> =>
    parse_(self, args, config)
}
