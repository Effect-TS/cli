// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import * as S from "@effect-ts/core/Collections/Immutable/Set"
import * as T from "@effect-ts/core/Effect"
import type { Either } from "@effect-ts/core/Either"
import * as E from "@effect-ts/core/Either"
import * as Equal from "@effect-ts/core/Equal"
import { identity, pipe } from "@effect-ts/core/Function"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import * as Ord from "@effect-ts/core/Ord"
import * as String from "@effect-ts/core/String"
import type { Tuple } from "@effect-ts/system/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/system/Collections/Immutable/Tuple"
import { matchTag_ } from "@effect-ts/system/Utils"

import type { Args } from "../Args"
import * as Arguments from "../Args"
import * as BuiltIns from "../BuiltInOption"
import type { CliConfig } from "../CliConfig"
import * as Config from "../CliConfig"
import type { CommandDirective } from "../CommandDirective"
import * as Directive from "../CommandDirective"
import type { Completion } from "../Completion"
import type { HelpDoc } from "../Help"
import * as Help from "../Help"
import type { Options } from "../Options"
import * as Opts from "../Options"
import type { Reducable } from "../Reducable"
import * as Reduce from "../Reducable"
import type { ShellType } from "../ShellType"
import type { UsageSynopsis } from "../UsageSynopsis"
import * as Synopsis from "../UsageSynopsis"
import type { ValidationError } from "../Validation"
import * as Validation from "../Validation"
import { Map } from "./_internal/Map"
import { OrElse } from "./_internal/OrElse"
import { Single } from "./_internal/Single"
import { Subcommands } from "./_internal/Subcommands"
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
export function make<OptionsType = void, ArgsType = void>(
  name: string,
  options: Options<OptionsType> = Opts.none as Options<OptionsType>,
  args: Args<ArgsType> = Arguments.none as Args<ArgsType>,
  helpDoc: HelpDoc = Help.empty,
  completions: Array<Completion<Command<Reducable<OptionsType, ArgsType>>>> = A.empty
): Command<Reducable<OptionsType, ArgsType>> {
  return pipe(
    new Single(name, helpDoc, options, args, completions),
    map(Reduce.fromTuple)
  )
}

// -----------------------------------------------------------------------------
// Combinators
// -----------------------------------------------------------------------------

/**
 * Add a `HelpDoc` to a `Command`.
 */
export function withHelp_<A>(self: Command<A>, help: string | HelpDoc): Command<A> {
  const helpDoc = typeof help === "string" ? Help.text(help) : help
  return matchTag_(instruction(self), {
    Map: (_) => new Map(withHelp_(_.command, helpDoc), _.map),
    // If the left and right already have a HelpDoc, it will be overwritten
    // by this function. Perhaps not the best idea...
    OrElse: (_) => new OrElse(withHelp_(_.left, helpDoc), withHelp_(_.right, helpDoc)),
    Single: (_) => new Single(_.name, helpDoc, _.options, _.args, _.completions),
    Subcommands: (_) => new Subcommands(withHelp_(_.parent, helpDoc), _.child)
  }) as Command<A>
}

/**
 * Registers a custom shell completion function with a `Command`.
 *
 * @param self The command to which the custom completion function will be added.
 * @param completion The completion function to register.
 */
export function withCustomCompletion_<A>(
  self: Command<A>,
  completion: Completion<Command<A>>
): Command<A> {
  return matchTag_(instruction(self), {
    Map: (_) => new Map(withCustomCompletion_(_.command, completion), _.map),
    OrElse: (_) =>
      new OrElse(
        withCustomCompletion_(_.left, completion),
        withCustomCompletion_(_.right, completion)
      ),
    Single: (_) =>
      new Single(_.name, _.help, _.options, _.args, A.snoc_(_.completions, completion)),
    Subcommands: (_) =>
      new Subcommands(
        withCustomCompletion_(_.parent, completion),
        withCustomCompletion_(_.child, completion)
      )
  }) as Command<A>
}

/**
 * Registers a custom shell completion function with a `Command`.
 *
 * **Note**: registering a custom shell completion function for a command will
 * override the default completions for the command.
 *
 * @ets_data_first withCustomCompletion_
 * @param completion The completion function to register.
 */
export function withCustomCompletion<A>(completion: Completion<Command<A>>) {
  return (self: Command<A>): Command<A> => withCustomCompletion_(self, completion)
}

/**
 * Add a `HelpDoc` to a `Command`.
 *
 * @ets_data_first withHelp_
 */
export function withHelp(help: string | HelpDoc) {
  return <A>(self: Command<A>): Command<A> => withHelp_(self, help)
}

export function subcommands_<A, B>(
  self: Command<A>,
  subcommand: Command<B>,
  ...subcommands: Array<Command<B>>
): Command<Reducable<A, B>> {
  return A.foldLeft_(
    subcommands,
    () => pipe(new Subcommands(self, subcommand), map(Reduce.fromTuple)),
    (head, tail) =>
      pipe(
        new Subcommands(self, A.reduce_(tail, orElse_(subcommand, head), orElse_)),
        map(Reduce.fromTuple)
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
  return <A>(self: Command<A>): Command<Reducable<A, B>> =>
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
    Single: (_) => {
      const descriptionSection = Help.isEmpty(_.help)
        ? Help.empty
        : Help.sequence_(Help.h1("DESCRIPTION"), Help.p(_.help, 4))

      const argsHelp = Arguments.helpDoc(_.args)
      const argumentsSection = Help.isEmpty(argsHelp)
        ? Help.empty
        : Help.sequence_(Help.h1("ARGUMENTS"), argsHelp)

      const optsHelp = Opts.helpDoc(_.options)
      const optionsSection = Help.isEmpty(optsHelp)
        ? Help.empty
        : Help.sequence_(Help.h1("OPTIONS"), optsHelp)

      return Help.spansT(descriptionSection, argumentsSection, optionsSection)
    },
    Subcommands: (_) =>
      Help.blocksT(
        helpDoc(_.parent),
        Help.h1("SUBCOMMANDS"),
        subcommandsDescription_(_.child)
      )
  })
}

/**
 * Return the `UsageSynopsis` for a command.
 */
export function synopsis<A>(self: Command<A>): UsageSynopsis {
  return matchTag_(instruction(self), {
    Map: (_) => synopsis(_.command),
    OrElse: (_) => Synopsis.mixed,
    Single: (_) =>
      Synopsis.concatsT(
        Synopsis.named(_.name, O.none),
        Opts.synopsis(_.options),
        Arguments.synopsis(_.args)
      ),
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
    Map: (_) => pipe(parse_(_.command, args, config), T.map(Directive.map(_.map))),
    OrElse: (_) =>
      T.catchSome_(parse_(_.left, args, config), (err) =>
        Validation.isCommandMismatch(err)
          ? O.some(parse_(_.right, args, config))
          : O.none
      ),
    Single: (_) =>
      pipe(
        parseBuiltInArgs(_, args, config),
        T.orElse(() => userDefined_(_, args, config))
      ),
    Subcommands: (subcommand) =>
      pipe(
        parse_(subcommand.parent, args, config),
        T.chain(
          T.matchTag({
            BuiltIn: (_) =>
              _.option._tag === "ShowHelp"
                ? pipe(
                    parse_(subcommand.child, args.slice(1), config),
                    T.orElse(() =>
                      T.succeed(
                        Directive.builtIn(BuiltIns.showHelp(helpDoc(subcommand)))
                      )
                    ),
                    T.chain((help) =>
                      help._tag === "BuiltIn" && help.option._tag === "ShowHelp"
                        ? T.succeed(help.option.helpDoc)
                        : T.fail(Validation.invalidArgument(Help.empty))
                    ),
                    T.map((help) => Directive.builtIn(BuiltIns.showHelp(help)))
                  )
                : T.succeed(Directive.builtIn(_.option)),
            UserDefined: (_) =>
              A.isNonEmpty(_.leftover)
                ? T.map_(
                    parse_(subcommand.child, _.leftover, config),
                    Directive.map((b) => Tp.tuple(_.value, b))
                  )
                : T.succeed(Directive.builtIn(BuiltIns.showHelp(helpDoc(subcommand))))
          })
        ),
        T.catchSome(() =>
          A.isEmpty(args)
            ? O.some(
                T.succeed(
                  Directive.builtIn(
                    new BuiltIns.ShowHelp({
                      helpDoc: helpDoc(subcommand)
                    })
                  )
                )
              )
            : O.none
        )
      )
  }) as T.IO<ValidationError, CommandDirective<A>>
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

/**
 * Generate shell completions for the specified `Command`.
 *
 * @param self The command to generate completions for.
 * @param args The command-line arguments to parse.
 * @param shellType The shell to generate completions for.
 */
export function completions_<A>(
  self: Command<A>,
  args: NonEmptyArray<string>,
  shellType: ShellType
): T.UIO<Set<string>> {
  return pipe(
    instruction(self),
    T.matchTag({
      Map: (_) => completions_(_.command, args, shellType),
      OrElse: (_) => {
        /**
         * The options of a command already present in the provided arguments
         * should be preferred
         */
        const leftName = A.head(S.toArray_(names(_.left), Ord.string))
        if (O.isSome(leftName) && A.elem_(Equal.string)(args, leftName.value)) {
          return completions_(_.left, args, shellType)
        }
        const rightName = A.head(S.toArray_(names(_.right), Ord.string))
        if (O.isSome(rightName) && A.elem_(Equal.string)(args, rightName.value)) {
          return completions_(_.right, args, shellType)
        }
        return pipe(
          T.tuplePar(
            completions_(_.left, args, shellType),
            completions_(_.right, args, shellType)
          ),
          T.map(([leftCompletions, rightCompletions]) =>
            S.union_(Equal.string)(leftCompletions, rightCompletions)
          )
        )
      },
      Single: (_) =>
        pipe(
          T.do,
          T.let("currentTerm", () => NA.last(args)),
          T.bind("commandCompletions", ({ currentTerm }) =>
            /**
             * Avoid adding the command name to the completions set if:
             *  1. The current term looks like an option
             *  2. The current term matches the command's name
             *  3. The passed arguments already include the command's name
             */
            currentTerm.startsWith("-") ||
            _.name === currentTerm ||
            args.includes(_.name)
              ? T.succeed<Set<string>>(S.empty)
              : A.isNonEmpty(_.completions)
              ? pipe(
                  _.completions,
                  T.forEach((f) => f(_, args, shellType)),
                  T.map(C.foldMap(S.getUnionIdentity(Equal.string))(identity as any))
                )
              : T.succeed(getCommandCompletions(_, shellType))
          ),
          T.bind("optionsCompletions", ({ commandCompletions, currentTerm }) =>
            /**
             * Only add option completions if the following checks pass:
             *  1. The current term looks like an option OR the current term is
             *     empty and there are no completions registered yet
             *  2. The command must be present in the argument list
             */
            (currentTerm.startsWith("-") ||
              (currentTerm === " " && commandCompletions.size === 0)) &&
            args.includes(_.name)
              ? Opts.completions_(_.options, args, shellType)
              : T.succeed<Set<string>>(S.empty)
          ),
          T.map(({ commandCompletions, optionsCompletions }) =>
            S.union_(Equal.string)(commandCompletions, optionsCompletions)
          )
        ) as T.UIO<Set<string>>,
      Subcommands: (_) =>
        pipe(
          T.tuplePar(
            completions_(_.parent, args, shellType),
            completions_(_.child, args, shellType)
          ),
          T.map(([parentCompletions, childCompletions]) =>
            S.union_(Equal.string)(parentCompletions, childCompletions)
          )
        )
    })
  )
}

/**
 * Generate shell completions for the specified `Command`.
 *
 * @ets_data_first completions_
 * @param self The command to generate completions for.
 * @param args The command-line arguments to parse.
 * @param shellType The shell to generate completions for.
 */
export function completions(args: NonEmptyArray<string>, shellType: ShellType) {
  return <A>(self: Command<A>): T.UIO<Set<string>> =>
    completions_(self, args, shellType)
}

export function builtInOptions<OptionsType, ArgsType>(
  self: Single<OptionsType, ArgsType>
): Options<Option<BuiltIns.BuiltInOption>> {
  return BuiltIns.withHelp(helpDoc(self))
}

export function builtIn_<OptionsType, ArgsType>(
  self: Single<OptionsType, ArgsType>,
  args: Array<string>,
  config: CliConfig = Config.defaultConfig
): T.IO<O.Option<HelpDoc>, CommandDirective<Tuple<[OptionsType, ArgsType]>>> {
  return pipe(
    Opts.validate_(builtInOptions(self), args, config),
    T.bimap((e) => e.help, Tp.get(1)),
    T.some,
    T.map(Directive.builtIn)
  )
}

/**
 * @ets_data_first builtIn_
 */
export function builtIn(args: Array<string>, config: CliConfig = Config.defaultConfig) {
  return <OptionsType, ArgsType>(
    self: Single<OptionsType, ArgsType>
  ): T.IO<O.Option<HelpDoc>, CommandDirective<Tuple<[OptionsType, ArgsType]>>> =>
    builtIn_(self, args, config)
}

export function userDefined_<OptionsType, ArgsType>(
  self: Single<OptionsType, ArgsType>,
  args: Array<string>,
  config: CliConfig = Config.defaultConfig
): T.IO<ValidationError, CommandDirective<Tuple<[OptionsType, ArgsType]>>> {
  return pipe(
    A.foldLeft_<string, T.IO<ValidationError, Array<string>>>(
      args,
      () =>
        T.fail(
          Validation.commandMismatch(Help.p(`Missing command name: ${self.name}`))
        ),
      (head, tail) => {
        if (
          Config.normalizeCase_(config, head) ===
          Config.normalizeCase_(config, self.name)
        ) {
          return T.succeed(tail)
        } else {
          return T.fail(
            Validation.commandMismatch(Help.p(`Unexpected command name: ${head}`))
          )
        }
      }
    ),
    T.chain((args2) =>
      pipe(
        Opts.validate_(self.options, uncluster(args2), config),
        T.chain(({ tuple: [args1, opts1] }) =>
          pipe(
            Arguments.validate_(self.args, args1, config),
            T.bimap(Validation.invalidArgument, ({ tuple: [args2, opts2] }) =>
              Directive.userDefined(args2, Tp.tuple(opts1, opts2))
            )
          )
        )
      )
    )
  )
}

/**
 * @ets_data_first userDefined_
 */
export function userDefined(
  args: Array<string>,
  config: CliConfig = Config.defaultConfig
) {
  return <OptionsType, ArgsType>(
    self: Single<OptionsType, ArgsType>
  ): T.IO<ValidationError, CommandDirective<Tuple<[OptionsType, ArgsType]>>> =>
    userDefined_(self, args, config)
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

const clusteredOptionRegex = /^-{1}([^-]{2,}|$)/

function isClustered(arg: string): boolean {
  return clusteredOptionRegex.test(arg.trim())
}

function uncluster(args: Array<string>): Array<string> {
  return A.chain_(args, (arg) => {
    return isClustered(arg)
      ? A.map_(arg.substring(1).split(""), (c) => `-${c}`)
      : A.single(arg)
  })
}

function parseBuiltInArgs<OptionsType, ArgsType>(
  self: Single<OptionsType, ArgsType>,
  args: Array<string>,
  config: CliConfig
): T.IO<Option<HelpDoc>, CommandDirective<Tuple<[OptionsType, ArgsType]>>> {
  const hasArg = pipe(
    A.head(args),
    O.exists(
      (_) =>
        Config.normalizeCase_(config, _) === Config.normalizeCase_(config, self.name)
    )
  )
  return hasArg ? builtIn_(self, args, config) : T.fail(O.none)
}

function getSubcommandsHelpDescription(helpDoc: HelpDoc): HelpDoc {
  switch (helpDoc._tag) {
    case "Header":
      return helpDoc.value
    case "Paragraph":
      return helpDoc.value
    default:
      return Help.space
  }
}

function subcommandsDescription_<A>(self: Command<A>): HelpDoc {
  return matchTag_(
    instruction(self),
    {
      Single: (_) =>
        Help.p(
          Help.spansT(
            Help.text(_.name),
            Help.text(" \t "),
            getSubcommandsHelpDescription(_.help)
          )
        ),
      Map: (_) => subcommandsDescription_(_.command),
      OrElse: (_) =>
        Help.enumeration([
          subcommandsDescription_(_.left),
          subcommandsDescription_(_.right)
        ])
    },
    () => Help.empty
  )
}

function getCommandCompletions<OptionsType, ArgsType>(
  command: Single<OptionsType, ArgsType>,
  shellType: ShellType
): Set<string> {
  return matchTag_(shellType, {
    Bash: () => S.singleton(command.name),
    ZShell: () => {
      const commandName = command.name
      const commandDesc = pipe(
        Help.render_(command.help, Help.plainMode(80)),
        String.replace(/\n|\r\n/g, " ")
      )
      return S.singleton(`${commandName}:${commandDesc}`.trim())
    }
  })
}
