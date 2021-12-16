// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as Set from "@effect-ts/core/Collections/Immutable/Set"
import type { Effect } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
// import * as Equal from "@effect-ts/core/Equal"
import { pipe } from "@effect-ts/core/Function"
import * as IO from "@effect-ts/core/IO"
import * as O from "@effect-ts/core/Option"
import * as Ord from "@effect-ts/core/Ord"
import * as FigletClient from "@effect-ts/figlet/FigletClient"
import type { FigletException } from "@effect-ts/figlet/FigletException"
import * as FontFileReader from "@effect-ts/figlet/FontFileReader"
import * as OptionsBuilder from "@effect-ts/figlet/OptionsBuilder"
import { matchTag_ } from "@effect-ts/system/Utils"

import type { BuiltInOption } from "../BuiltInOption"
import type { CliConfig } from "../CliConfig"
import * as Config from "../CliConfig"
import type { Command } from "../Command"
import * as Cmd from "../Command"
import * as CompletionScript from "../CompletionScript"
import type { HelpDoc } from "../Help"
import * as Help from "../Help"
import type { HasConsole } from "../Internal/Console"
import { Console, makeConsole, putStrLn } from "../Internal/Console"
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
  command: Command<A>
  summary?: HelpDoc
  footer?: HelpDoc
  config?: CliConfig
  console?: Console
}): CliApp<A> {
  return {
    name: configs.name,
    version: configs.version,
    command: configs.command,
    summary: configs.summary || Help.empty,
    footer: configs.footer || Help.empty,
    config: configs.config || Config.defaultConfig,
    console: configs.console || makeConsole()
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
  const names = Cmd.names(self.command)
  const programName = pipe(
    names,
    Set.toArray(Ord.string),
    A.head,
    O.getOrElse(() => self.name)
  )
  return matchTag_(builtInOption, {
    ShowHelp: (_) =>
      pipe(
        T.do,
        T.bind("banner", () =>
          pipe(
            OptionsBuilder.builder(),
            OptionsBuilder.text(name),
            OptionsBuilder.withInternalFont(self.config.bannerFont),
            OptionsBuilder.renderToString,
            T.map((name) => Help.p(Help.code(name))),
            T.provideSomeLayer(
              FontFileReader.LiveFontFileReader[">>>"](FigletClient.LiveFigletClient)
            ),
            T.orDie
          )
        ),
        T.let("header", ({ banner }) =>
          Help.blocksT(
            Help.spansT(
              Help.strong(`${self.name} (v${self.version})`),
              Help.text(" - "),
              self.summary
            ),
            banner
          )
        ),
        T.let("synopsis", () =>
          Help.blocksT(
            Help.h1("SYNOPSIS"),
            Help.p(Synopsis.render(Cmd.synopsis(self.command)), 4)
          )
        ),
        T.chain(({ header, synopsis }) =>
          pipe(
            Help.blocksT(header, synopsis, _.helpDoc, self.footer),
            Help.render(Help.plainMode(80)),
            putStrLn
          )
        )
      ),
    ShowCompletionScript: (_) => {
      const completionScript = CompletionScript.make(
        _.pathToExecutable,
        programName,
        _.shellType
      )
      return putStrLn(completionScript)
    },
    ShowCompletions: (_) =>
      pipe(
        NA.fromArray(_.args.split(" ")),
        O.fold(
          () => T.unit,
          (args) => {
            const currentTerm = NA.last(args)
            const completions = Cmd.completions(
              self.command,
              args,
              currentTerm,
              _.shellType
            )
            return putStrLn(A.join_(Set.toArray_(completions, Ord.string), " "))
          }
        )
      )
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
  const argsWithCmd = A.concat_(prefixCommandName(self.command), args)
  return pipe(
    Cmd.parse_(self.command, argsWithCmd, self.config),
    T.foldM(
      (e) =>
        pipe(printDocs_(e.help), T.provideLayer(L.fromValue(Console)(self.console))),
      (directive) =>
        matchTag_(directive, {
          BuiltIn: (_) =>
            pipe(
              executeBuiltIn_(self, _.option),
              T.provideLayer(L.fromValue(Console)(self.console))
            ),
          UserDefined: (_) =>
            pipe(
              execute(_.value),
              T.provideSomeLayer(L.fromValue(Console)(self.console))
            )
        }) as Effect<R, E | NonEmptyArray<FigletException>, void>
    )
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
    return yield* _(
      matchTag_(Cmd.instruction(command), {
        Map: (_) => prefixCommandNameRec(_.command),
        OrElse: (_) => IO.succeed(A.empty),
        Single: (_) => IO.succeed(A.single(_.name)),
        Subcommands: (_) => prefixCommandNameRec(_.parent)
      })
    )
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
