import type * as BuiltInOption from "@effect/cli/BuiltInOption"
import type * as CliApp from "@effect/cli/CliApp"
import type * as Command from "@effect/cli/Command"
import type * as HelpDoc from "@effect/cli/HelpDoc"
import type * as Span from "@effect/cli/HelpDoc/Span"
import * as cliConfig from "@effect/cli/internal_effect_untraced/cliConfig"
import * as command from "@effect/cli/internal_effect_untraced/command"
import * as commandDirective from "@effect/cli/internal_effect_untraced/commandDirective"
import * as _console from "@effect/cli/internal_effect_untraced/console"
import * as doc from "@effect/cli/internal_effect_untraced/helpDoc"
import * as span from "@effect/cli/internal_effect_untraced/helpDoc/span"
import * as _usage from "@effect/cli/internal_effect_untraced/usage"
import * as validationError from "@effect/cli/internal_effect_untraced/validationError"
import type * as ValidationError from "@effect/cli/ValidationError"
import { dual, pipe } from "@effect/data/Function"
import * as List from "@effect/data/List"
import * as Option from "@effect/data/Option"
import * as Effect from "@effect/io/Effect"

const defaultConfig = {
  summary: span.empty,
  footer: doc.empty
}

/** @internal */
export const make = <A>(config: {
  name: string
  version: string
  command: Command.Command<A>
  summary?: Span.Span
  footer?: HelpDoc.HelpDoc
}): CliApp.CliApp<A> => Object.assign({}, defaultConfig, config)

/** @internal */
export const run = dual<
  <R, E, A>(
    args: List.List<string>,
    f: (a: A) => Effect.Effect<R | CliApp.CliApp.Context, E, void>
  ) => (self: CliApp.CliApp<A>) => Effect.Effect<R | CliApp.CliApp.Context, E | ValidationError.ValidationError, void>,
  <R, E, A>(
    self: CliApp.CliApp<A>,
    args: List.List<string>,
    f: (a: A) => Effect.Effect<R | CliApp.CliApp.Context, E, void>
  ) => Effect.Effect<R | CliApp.CliApp.Context, E | ValidationError.ValidationError, void>
>(3, (self, args, f) =>
  Effect.serviceWithEffect(cliConfig.Tag, (config) =>
    Effect.matchEffect(
      command.parse(self.command, List.concat(prefixCommand(self.command), args), config),
      (error) =>
        Effect.zipRight(
          printDocs(error),
          Effect.fail(error)
        ),
      (directive) =>
        commandDirective.isUserDefined(directive)
          ? f(directive.value)
          : Effect.catchSome(
            runBuiltIn(directive.option, self),
            (error) =>
              validationError.isValidationError(error) ?
                Option.some(Effect.zipRight(printDocs(error), Effect.fail(error))) :
                Option.none()
          )
    )))

const prefixCommandMap: {
  [K in command.Instruction["_tag"]]: (self: Extract<command.Instruction, { _tag: K }>) => List.List<string>
} = {
  Single: (self) => List.of(self.name),
  Map: (self) => prefixCommandMap[self.command._tag](self.command as any),
  OrElse: () => List.nil(),
  Subcommands: (self) => prefixCommandMap[self.parent._tag](self.parent as any)
}

const prefixCommand = <A>(self: Command.Command<A>): List.List<string> =>
  prefixCommandMap[(self as command.Instruction)._tag](self as any)

const runBuiltInMap: {
  [K in BuiltInOption.BuiltInOption["_tag"]]: (
    self: Extract<BuiltInOption.BuiltInOption, { _tag: K }>,
    cliApp: CliApp.CliApp<any>
  ) => Effect.Effect<CliApp.CliApp.Context, never, void>
} = {
  ShowCompletions: () =>
    Effect.sync(() => {
      //   case ShowCompletions(index, _) =>
      //     envs.flatMap { envMap =>
      //       val compWords = envMap.collect {
      //         case (idx, word) if idx.startsWith("COMP_WORD_") =>
      //           (idx.drop("COMP_WORD_".length).toInt, word)
      //       }.toList.sortBy(_._1).map(_._2)

      //       Completion
      //         .complete(compWords, index, self.command, self.config)
      //         .flatMap { completions =>
      //           ZIO.foreachDiscard(completions)(word => printLine(word))
      //         }
      //     }
      console.log("Showing Completions")
    }),
  ShowCompletionScript: () =>
    Effect.sync(() => {
      //   case ShowCompletionScript(path, shellType) =>
      //     printLine(
      //       CompletionScript(path, if (self.command.names.nonEmpty) self.command.names else Set(self.name), shellType)
      //     )
      console.log("Showing Completion Script")
    }),
  ShowHelp: (self, cliApp) => {
    const banner = doc.h1(span.code(cliApp.name))
    const header = doc.p(span.concat(span.text(`${cliApp.name} v${cliApp.version} -- `), cliApp.summary))
    const usage = doc.sequence(
      doc.h1("USAGE"),
      doc.p(span.concat(span.text("$ "), doc.getSpan(_usage.helpDoc(self.usage))))
    )
    // TODO: add rendering of built-in options such as help
    const helpDoc = pipe(
      banner,
      doc.sequence(header),
      doc.sequence(usage),
      doc.sequence(self.helpDoc),
      doc.sequence(cliApp.footer)
    )
    const helpText = doc.toAnsiText(helpDoc)
    return Effect.serviceWithEffect(_console.Tag, (console) => console.printLine(helpText))
  },
  Wizard: () =>
    Effect.sync(() => {
      //     val subcommands = command.getSubcommands
      //     for {
      //       subcommandName <- if (subcommands.size == 1) ZIO.succeed(subcommands.keys.head)
      //                         else
      //                           (print("Command" + subcommands.keys.mkString("(", "|", "): ")) *> readLine).orDie
      //       subcommand <-
      //         ZIO
      //           .fromOption(subcommands.get(subcommandName))
      //           .orElseFail(ValidationError(ValidationErrorType.InvalidValue, HelpDoc.p("Invalid subcommand")))
      //       args   <- subcommand.generateArgs
      //       _      <- Console.printLine(s"Executing command: ${(prefix(self.command) ++ args).mkString(" ")}")
      //       result <- self.run(args)
      //     } yield result
      console.log("Running Wizard")
    })
}

const runBuiltIn = <A>(
  self: BuiltInOption.BuiltInOption,
  cliApp: CliApp.CliApp<A>
): Effect.Effect<CliApp.CliApp.Context, never, void> => runBuiltInMap[self._tag](self as any, cliApp)

const printDocs = (error: ValidationError.ValidationError) =>
  Effect.serviceWithEffect(_console.Tag, (console) => console.printLine(doc.toAnsiText(error.error)))
