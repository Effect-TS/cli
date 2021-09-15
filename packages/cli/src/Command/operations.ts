// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Either } from "@effect-ts/core/Either"
import * as E from "@effect-ts/core/Either"
import type { Tuple } from "@effect-ts/system/Collections/Immutable/Tuple"

import type { Args } from "../Args"
import type { HelpDoc } from "../Help"
import * as Help from "../Help"
import type { Options } from "../Options"
import type { Command } from "./definition"
import { Map, OrElse, Single, Subcommands } from "./models"

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
  return new Single(name, helpDoc, options, args)
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
    () => new Subcommands(self, subcommand),
    (head, tail) =>
      new Subcommands(self, A.reduce_(tail, orElse_(subcommand, head), orElse_))
  )
}

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

export function map_<A, B>(self: Command<A>, f: (a: A) => B): Command<B> {
  return new Map(self, f)
}

/**
 * @ets_data_first map_
 */
export function map<A, B>(f: (a: A) => B) {
  return (self: Command<A>): Command<B> => map_(self, f)
}

export function orElse_<A>(self: Command<A>, that: Command<A>): Command<A> {
  return new OrElse(self, that)
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
 * @ets_data_first
 */
export function orElseEither<B>(that: Command<B>) {
  return <A>(self: Command<A>): Command<Either<A, B>> => orElseEither_(self, that)
}
