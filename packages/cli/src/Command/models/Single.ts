// ets_tracing: off

import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import * as S from "@effect-ts/core/Collections/Immutable/Set"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import { not } from "@effect-ts/core/Function"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

import type { Args } from "../../Args"
import type { BuiltInOption } from "../../BuiltInOption"
import * as BuiltIns from "../../BuiltInOption"
import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { CommandDirective } from "../../CommandDirective"
import * as Directive from "../../CommandDirective"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { Options } from "../../Options"
import * as Opts from "../../Options"
import type { ShellType } from "../../ShellType"
import type { UsageSynopsis } from "../../UsageSynopsis"
import * as Synopsis from "../../UsageSynopsis"
import type { ValidationError } from "../../Validation"
import * as Validation from "../../Validation"
import type { Command } from "../definition"

/**
 * Represents a single command.
 */
export class Single<OptionsType, ArgsType>
  implements Command<Tuple<[OptionsType, ArgsType]>>
{
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
  ) {}

  get names(): Set<string> {
    return S.singleton(this.name)
  }

  get helpDoc(): HelpDoc {
    const opts = Help.isEmpty(this.options.helpDoc)
      ? BuiltIns.builtInOptions
      : Opts.zip_(this.options, BuiltIns.builtInOptions)

    const descriptionSection = Help.isEmpty(this.description)
      ? Help.empty
      : Help.sequence_(Help.h1("DESCRIPTION"), this.description)

    const argumentsSection = Help.isEmpty(this.args.helpDoc)
      ? Help.empty
      : Help.sequence_(Help.h1("ARGUMENTS"), this.args.helpDoc)

    const optionsSection = Help.isEmpty(opts.helpDoc)
      ? Help.empty
      : Help.sequence_(Help.h1("OPTIONS"), opts.helpDoc)

    return Help.blocks(
      A.filter_(
        [descriptionSection, argumentsSection, optionsSection],
        not(Help.isEmpty)
      )
    )
  }

  get synopsis(): UsageSynopsis {
    return Synopsis.concatsT(
      Synopsis.named(this.name, O.none),
      this.options.synopsis,
      this.args.synopsis
    )
  }

  get builtInOptions(): Options<Option<BuiltInOption>> {
    return BuiltIns.builtInOptionsFrom(this.helpDoc, this.completions)
  }

  completions(shellType: ShellType): Set<Array<string>> {
    throw new Error("Method not implemented!")
  }

  parse(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<ValidationError, CommandDirective<Tuple<[OptionsType, ArgsType]>>> {
    return T.orElse_(this.builtIn(args, config), () => this.userDefined(args, config))
  }

  builtIn(
    args: Array<string>,
    config: CliConfig
  ): IO<O.Option<HelpDoc>, CommandDirective<Tuple<[OptionsType, ArgsType]>>> {
    return T.map_(
      T.some(
        T.bimap_(
          this.builtInOptions.validate(args, config),
          (e) => e.error,
          (tuple) => Tp.get_(tuple, 1)
        )
      ),
      Directive.builtIn
    )
  }

  userDefined(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<ValidationError, CommandDirective<Tuple<[OptionsType, ArgsType]>>> {
    return T.chain_(
      A.foldLeft_(
        args,
        () =>
          T.fail(
            Validation.commandMismatchError(
              Help.p(`Missing command name: ${this.name}`)
            )
          ),
        (head, tail) => {
          if (
            Config.normalizeCase_(config, head) ===
            Config.normalizeCase_(config, this.name)
          ) {
            return T.succeed(tail)
          } else {
            return T.fail(
              Validation.commandMismatchError(
                Help.p(`Unexpected command name: ${head}`)
              )
            )
          }
        }
      ),
      (args2) =>
        T.chain_(this.options.validate(args2, config), ({ tuple: [args1, opts1] }) => {
          return T.map_(
            T.mapError_(this.args.validate(args1, config), (helpDoc) =>
              Validation.invalidArgumentError(helpDoc)
            ),
            ({ tuple: [args2, opts2] }) =>
              Directive.userDefined(args2, Tp.tuple(opts1, opts2))
          )
        })
    )
  }
}
