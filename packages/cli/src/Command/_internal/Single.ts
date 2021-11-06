// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import { not } from "@effect-ts/core/Function"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

import type { Args } from "../../Args"
import * as Arguments from "../../Args"
import * as BuiltIns from "../../BuiltInOption"
import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { CommandDirective } from "../../CommandDirective"
import * as Directive from "../../CommandDirective"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { Options } from "../../Options"
import * as Opts from "../../Options"
import type { UsageSynopsis } from "../../UsageSynopsis"
import * as Synopsis from "../../UsageSynopsis"
import type { ValidationError } from "../../Validation"
import * as Validation from "../../Validation"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a single command.
 */
export class Single<OptionsType, ArgsType> extends Base<
  Tuple<[OptionsType, ArgsType]>
> {
  readonly _tag = "Single"

  constructor(
    /**
     * The name of the command.
     */
    readonly name: string,
    /**
     * The description for the command.
     */
    readonly description: HelpDoc,
    /**
     * The command-line options that can be passed to the command.
     */
    readonly options: Options<OptionsType>,
    /**
     * The command-line arguments that can be passed to the command.
     */
    readonly args: Args<ArgsType>
  ) {
    super()
  }
}

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export function helpDoc<OptionsType, ArgsType>(
  self: Single<OptionsType, ArgsType>
): HelpDoc {
  const opts = Help.isEmpty(Opts.helpDoc(self.options))
    ? BuiltIns.builtInOptions
    : Opts.zip_(self.options, BuiltIns.builtInOptions)

  const descriptionSection = Help.isEmpty(self.description)
    ? Help.empty
    : Help.sequence_(Help.h1("DESCRIPTION"), self.description)

  const argsHelp = Arguments.helpDoc(self.args)
  const argumentsSection = Help.isEmpty(argsHelp)
    ? Help.empty
    : Help.sequence_(Help.h1("ARGUMENTS"), argsHelp)

  const optionsSection = Help.isEmpty(Opts.helpDoc(opts as Options<any>))
    ? Help.empty
    : Help.sequence_(Help.h1("OPTIONS"), Opts.helpDoc(opts as Options<any>))

  return Help.blocks(
    A.filter_([descriptionSection, argumentsSection, optionsSection], not(Help.isEmpty))
  )
}

// -----------------------------------------------------------------------------
// UsageSynopsis
// -----------------------------------------------------------------------------

export function synopsis<OptionsType, ArgsType>(
  self: Single<OptionsType, ArgsType>
): UsageSynopsis {
  return Synopsis.concatsT(
    Synopsis.named(self.name, O.none),
    Opts.synopsis(self.options),
    Arguments.synopsis(self.args)
  )
}

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export function parse_<OptionsType, ArgsType>(
  self: Single<OptionsType, ArgsType>,
  args: Array<string>,
  config: CliConfig = Config.defaultConfig
): T.IO<ValidationError, CommandDirective<Tuple<[OptionsType, ArgsType]>>> {
  return T.orElse_(builtIn_(self, args, config), () => userDefined_(self, args, config))
}

/**
 * @ets_data_first parse_
 */
export function parse(args: Array<string>, config: CliConfig = Config.defaultConfig) {
  return <OptionsType, ArgsType>(
    self: Single<OptionsType, ArgsType>
  ): T.IO<ValidationError, CommandDirective<Tuple<[OptionsType, ArgsType]>>> =>
    parse_(self, args, config)
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

export function completions<OptionsType, ArgsType>(
  self: Single<OptionsType, ArgsType>
): () => Set<Array<string>> {
  return () => {
    throw new Error("Not implemented!")
  }
}

export function builtInOptions<OptionsType, ArgsType>(
  self: Single<OptionsType, ArgsType>
): Options<Option<BuiltIns.BuiltInOption>> {
  return BuiltIns.builtInOptionsFrom(helpDoc(self), completions(self))
}

export function builtIn_<OptionsType, ArgsType>(
  self: Single<OptionsType, ArgsType>,
  args: Array<string>,
  config: CliConfig = Config.defaultConfig
): T.IO<O.Option<HelpDoc>, CommandDirective<Tuple<[OptionsType, ArgsType]>>> {
  return T.map_(
    T.some(
      T.bimap_(
        Opts.validate_(builtInOptions(self), args, config),
        (e) => e.error,
        ({ tuple: [_, builtInOption] }) => builtInOption
      )
    ),
    Directive.builtIn
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
  return T.chain_(
    A.foldLeft_(
      args,
      () =>
        T.fail(
          Validation.commandMismatchError(Help.p(`Missing command name: ${self.name}`))
        ),
      (head, tail) => {
        if (
          Config.normalizeCase_(config, head) ===
          Config.normalizeCase_(config, self.name)
        ) {
          return T.succeed(tail)
        } else {
          return T.fail(
            Validation.commandMismatchError(Help.p(`Unexpected command name: ${head}`))
          )
        }
      }
    ),
    (args2) =>
      T.chain_(
        Opts.validate_(self.options, args2, config),
        ({ tuple: [args1, opts1] }) => {
          return T.map_(
            T.mapError_(Arguments.validate_(self.args, args1, config), (helpDoc) =>
              Validation.invalidArgumentError(helpDoc)
            ),
            ({ tuple: [args2, opts2] }) =>
              Directive.userDefined(args2, Tp.tuple(opts1, opts2))
          )
        }
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
