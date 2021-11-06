// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as Set from "@effect-ts/core/Collections/Immutable/Set"
import type { Effect } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import * as Equal from "@effect-ts/core/Equal"
import * as IO from "@effect-ts/core/IO"
import * as Ord from "@effect-ts/core/Ord"

import type { BuiltInOption } from "../BuiltInOption"
import type { CliConfig } from "../CliConfig"
import * as Config from "../CliConfig"
import type { Command } from "../Command"
import * as Cmd from "../Command"
import * as FigletClient from "../figlet/client/FigletClient"
import * as FontFileReader from "../figlet/client/FontFileReader"
import * as OptionsBuilder from "../figlet/client/OptionsBuilder"
import type { FigletException } from "../figlet/error/FigletException"
import type { HelpDoc } from "../Help"
import * as Help from "../Help"
import type { HasConsole } from "../Internal/Console"
import { Console, defaultConsole, putStrLn } from "../Internal/Console"
import * as Synopsis from "../UsageSynopsis"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export interface CliApp<A> {
  readonly name: string
  readonly version: string
  readonly command: Command<A>
  readonly summary: HelpDoc
  readonly footer: HelpDoc
  readonly config: CliConfig
  readonly console: Console
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export function make<A>(configs: {
  name: string
  version: string
  summary: HelpDoc
  command: Command<A>
  footer?: HelpDoc
  config?: CliConfig
  console?: Console
}): CliApp<A> {
  return {
    footer: Help.empty,
    config: Config.defaultConfig,
    console: defaultConsole,
    ...configs
  }
}

// -----------------------------------------------------------------------------
// Combinators
// -----------------------------------------------------------------------------

export function config_<A>(self: CliApp<A>, config: CliConfig): CliApp<A> {
  return { ...self, config }
}

/**
 * @ets_data_first config_
 */
export function config(config: CliConfig) {
  return <A>(self: CliApp<A>): CliApp<A> => config_(self, config)
}

export function footer_<A>(self: CliApp<A>, footer: HelpDoc): CliApp<A> {
  return { ...self, footer }
}

/**
 * @ets_data_first footer_
 */
export function footer(footer: HelpDoc) {
  return <A>(self: CliApp<A>): CliApp<A> => footer_(self, footer)
}

export function summary_<A>(self: CliApp<A>, summary: HelpDoc): CliApp<A> {
  return { ...self, summary: Help.concat_(self.summary, summary) }
}

/**
 * @ets_data_first summary_
 */
export function summary(summary: HelpDoc) {
  return <A>(self: CliApp<A>): CliApp<A> => summary_(self, summary)
}

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

export function printDocs_(
  self: HelpDoc,
  mode: Help.RenderMode = Help.plainMode()
): T.RIO<HasConsole, void> {
  return putStrLn(Help.render_(self, mode))
}

/**
 * @ets_data_first printDocs_
 */
export function printDocs(mode: Help.RenderMode = Help.plainMode()) {
  return (self: HelpDoc): T.RIO<HasConsole, void> => printDocs_(self, mode)
}

export function executeBuiltIn_<A>(
  self: CliApp<A>,
  builtInOption: BuiltInOption
): Effect<HasConsole, NonEmptyArray<FigletException>, void> {
  return T.gen(function* (_) {
    switch (builtInOption._tag) {
      case "ShowHelp": {
        const names = Cmd.names(self.command)

        const fancyName = yield* _(
          T.map_(
            T.provideSomeLayer_(
              OptionsBuilder.print(
                OptionsBuilder.withInternalFont_(
                  OptionsBuilder.text_(
                    OptionsBuilder.builder(),
                    names.size >= 1 ? Set.toArray_(names, Ord.string)[0] : self.name
                  ),
                  "slant"
                )
              ),
              FontFileReader.LiveFontFileReader[">>>"](FigletClient.LiveFigletClient)
            ),
            (name) => Help.code(name)
          )
        )

        const header = Help.blocksT(
          Help.spansT(
            Help.strong(`${self.name} (v${self.version})`),
            Help.text(" - "),
            self.summary
          ),
          fancyName,
          Help.empty
        )

        const synopsis = Help.blocksT(
          Help.h1("SYNOPSIS"),
          Help.p(Synopsis.render(Cmd.synopsis(self.command)), 4),
          Help.empty
        )

        const help = Help.blocksT(header, synopsis, builtInOption.helpDoc, self.footer)

        return yield* _(putStrLn(Help.render_(help, Help.plainMode(80))))
      }
      case "ShowCompletions": {
        return yield* _(
          putStrLn(
            A.join_(
              Set.toArray_(
                Set.map_(Equal.string)(builtInOption.completions, A.join(" ")),
                Ord.string
              ),
              "\n"
            )
          )
        )
      }
    }
  })
}

/**
 * @ets_data_first executeBuiltIn_
 */
export function executeBuiltIn(builtInOption: BuiltInOption) {
  return <A>(
    self: CliApp<A>
  ): Effect<HasConsole, NonEmptyArray<FigletException>, void> =>
    executeBuiltIn_(self, builtInOption)
}

export function run_<R, E, A>(
  self: CliApp<A>,
  args: Array<string>,
  execute: (a: A) => Effect<R & HasConsole, E, void>
): Effect<R, E | NonEmptyArray<FigletException>, void> {
  return T.foldM_(
    Cmd.parse_(
      self.command,
      A.concat_(prefixCommandName(self.command), args),
      self.config
    ),
    (e) => T.provideLayer_(printDocs_(e.help), L.pure(Console)(self.console)),
    (directive) => {
      switch (directive._tag) {
        case "BuiltIn":
          return T.provideLayer_<
            unknown,
            never,
            HasConsole,
            E | NonEmptyArray<FigletException>,
            void
          >(executeBuiltIn_(self, directive.option), L.pure(Console)(self.console))
        case "UserDefined":
          return T.provideSomeLayer_<
            R,
            E | NonEmptyArray<FigletException>,
            void,
            unknown,
            never,
            HasConsole
          >(execute(directive.value), L.pure(Console)(self.console))
      }
    }
  )
}

/**
 * @ets_data_first run_
 */
export function run<R, E, A>(
  args: Array<string>,
  execute: (a: A) => Effect<R & HasConsole, E, void>
) {
  return (self: CliApp<A>): Effect<R, E | NonEmptyArray<FigletException>, void> =>
    run_(self, args, execute)
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function prefixCommandNameRec<A>(command: Command<A>): IO.IO<Array<string>> {
  return IO.gen(function* (_) {
    if (command instanceof Cmd.Single) {
      return A.single(command.name)
    }
    if (command instanceof Cmd.Map) {
      return yield* _(prefixCommandNameRec(command.command))
    }
    if (command instanceof Cmd.OrElse) {
      return A.empty
    }
    if (command instanceof Cmd.Subcommands) {
      return yield* _(prefixCommandNameRec(command.parent))
    }
    throw new Error("bug, an invalid command was specified")
  })
}

/**
 * Prepends the command's name as a first argument to the provided list of
 * arguments, if necessary, in case the `CliApp`'s command is expected to
 * consume it.
 *
 * This allows for more flexibility when calling a `CliApp`'s command.
 */
function prefixCommandName<A>(command: Command<A>): Array<string> {
  return IO.run(prefixCommandNameRec(command))
}
