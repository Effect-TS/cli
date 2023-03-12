import * as Args from "@effect/cli/Args"
import * as BuiltInOption from "@effect/cli/BuiltInOption"
import * as CliConfig from "@effect/cli/CliConfig"
import * as Command from "@effect/cli/Command"
import * as CommandDirective from "@effect/cli/CommandDirective"
import * as HelpDoc from "@effect/cli/HelpDoc"
import * as Span from "@effect/cli/HelpDoc/Span"
import * as Options from "@effect/cli/Options"
import * as it from "@effect/cli/test/utils/extend"
import * as Grep from "@effect/cli/test/utils/grep"
import * as Tail from "@effect/cli/test/utils/tail"
import * as WC from "@effect/cli/test/utils/wc"
import * as ValidationError from "@effect/cli/ValidationError"
import { pipe } from "@effect/data/Function"
import * as List from "@effect/data/List"
import * as Effect from "@effect/io/Effect"
import { describe, expect } from "vitest"

// const log = (u: unknown) => console.dir(u, { depth: null, colors: true })

describe.concurrent("Command", () => {
  it.effect("validates a command with options followed by args", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const args1 = List.make("tail", "-n", "100", "foo.log")
      const args2 = List.make("grep", "--after", "2", "--before", "3", "fooBar")
      const result1 = yield* $(Command.parse(Tail.command, args1, config))
      const result2 = yield* $(Command.parse(Grep.command, args2, config))
      expect(result1).toEqual(CommandDirective.userDefined(List.nil(), [100, "foo.log"]))
      expect(result2).toEqual(CommandDirective.userDefined(List.nil(), [[2, 3], "fooBar"]))
    }))

  it.effect("provides auto-correct suggestions for misspelled options", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const args1 = List.make("grep", "--afte", "2", "--before", "3", "fooBar")
      const args2 = List.make("grep", "--after", "2", "--efore", "3", "fooBar")
      const args3 = List.make("grep", "--afte", "2", "--efore", "3", "fooBar")
      const result1 = yield* $(Effect.flip(Command.parse(Grep.command, args1, config)))
      const result2 = yield* $(Effect.flip(Command.parse(Grep.command, args2, config)))
      const result3 = yield* $(Effect.flip(Command.parse(Grep.command, args3, config)))
      expect(result1).toEqual(ValidationError.invalidValue(HelpDoc.p(Span.error(
        "The flag '--afte' is not recognized. Did you mean '--after'?"
      ))))
      expect(result2).toEqual(ValidationError.invalidValue(HelpDoc.p(Span.error(
        "The flag '--efore' is not recognized. Did you mean '--before'?"
      ))))
      expect(result3).toEqual(ValidationError.missingValue(HelpDoc.sequence(
        HelpDoc.p(Span.error("The flag '--afte' is not recognized. Did you mean '--after'?")),
        HelpDoc.p(Span.error("The flag '--efore' is not recognized. Did you mean '--before'?"))
      )))
    }))

  it.effect("shows an error if an option is missing", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const args = List.make("grep", "--a", "2", "--before", "3", "fooBar")
      const result = yield* $(Effect.flip(Command.parse(Grep.command, args, config)))
      expect(result).toEqual(ValidationError.missingValue(HelpDoc.p(Span.error(
        "Expected to find option: '--after'"
      ))))
    }))

  it.effect("should handle alternative commands", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const args = List.make("log")
      const command = pipe(
        Command.make("remote", Options.none, Args.none),
        Command.orElse(Command.make("log", Options.none, Args.none))
      )
      const result = yield* $(Command.parse(command, args, config))
      expect(result).toEqual(CommandDirective.userDefined(List.nil(), [void 0, void 0]))
    }))

  it.effect("should treat clustered boolean options as un-clustered options", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const args1 = List.make("wc", "-clw", "filename")
      const args2 = List.make("wc", "-c", "-l", "-w", "filename")
      const clustered = yield* $(
        Effect.map(
          Command.parse(WC.command, args1, config),
          CommandDirective.map((tuple) => [tuple[0], Array.from(tuple[1])])
        )
      )
      const unclustered = yield* $(
        Effect.map(
          Command.parse(WC.command, args2, config),
          CommandDirective.map((tuple) => [tuple[0], Array.from(tuple[1])])
        )
      )
      const expected = CommandDirective.userDefined(List.nil(), [[true, true, true, false], ["filename"]])
      expect(clustered).toEqual(expected)
      expect(unclustered).toEqual(expected)
    }))

  describe.concurrent("Subcommands - no options or arguments", () => {
    const git = pipe(
      Command.make("git", Options.none, Args.none),
      Command.subcommands([
        Command.make("remote", Options.none, Args.none),
        Command.make("log", Options.none, Args.none)
      ])
    )

    it.effect("matches the first subcommand without any surplus arguments", () =>
      Effect.gen(function*($) {
        const config = CliConfig.defaultConfig
        const args = List.make("git", "remote")
        const result = yield* $(Command.parse(git, args, config))
        expect(result).toEqual(CommandDirective.userDefined(List.nil(), [[void 0, void 0], [void 0, void 0]]))
      }))

    it.effect("matches the first subcommand with a surplus option", () =>
      Effect.gen(function*($) {
        const config = CliConfig.defaultConfig
        const args = List.make("git", "remote", "-v")
        const result = yield* $(Command.parse(git, args, config))
        expect(result).toEqual(CommandDirective.userDefined(List.of("-v"), [[void 0, void 0], [void 0, void 0]]))
      }))

    it.effect("matches the second subcommand without any surplus arguments", () =>
      Effect.gen(function*($) {
        const config = CliConfig.defaultConfig
        const args = List.make("git", "log")
        const result = yield* $(Command.parse(git, args, config))
        expect(result).toEqual(CommandDirective.userDefined(List.nil(), [[void 0, void 0], [void 0, void 0]]))
      }))
  })

  describe.concurrent("Subcommands - with options and arguments", () => {
    const rebaseOptions = pipe(
      Options.boolean("i"),
      Options.zip(Options.withDefault(Options.text("empty"), "drop"))
    )
    const rebaseArgs = Args.zip(Args.text(), Args.text())
    const git = pipe(
      Command.make("git", Options.none, Args.none),
      Command.subcommands([Command.make("rebase", rebaseOptions, rebaseArgs)])
    )

    it.effect("subcommand with required options and arguments", () =>
      Effect.gen(function*($) {
        const config = CliConfig.defaultConfig
        const args = List.make("git", "rebase", "-i", "upstream", "branch")
        const result = yield* $(Command.parse(git, args, config))
        expect(result).toEqual(CommandDirective.userDefined(
          List.nil(),
          [[void 0, void 0], [[true, "drop"], ["upstream", "branch"]]]
        ))
      }))

    it.effect("subcommand with required and optional options and arguments", () =>
      Effect.gen(function*($) {
        const config = CliConfig.defaultConfig
        const args = List.make("git", "rebase", "-i", "--empty", "ask", "upstream", "branch")
        const result = yield* $(Command.parse(git, args, config))
        expect(result).toEqual(CommandDirective.userDefined(List.nil(), [
          [undefined, undefined],
          [[true, "ask"], ["upstream", "branch"]]
        ]))
      }))

    it.effect("subcommand that is unknown", () =>
      Effect.gen(function*($) {
        const config = CliConfig.defaultConfig
        const args = List.make("git", "abc")
        const result = yield* $(Effect.flip(Command.parse(git, args, config)))
        expect(result).toEqual(ValidationError.commandMismatch(HelpDoc.p("Missing command name: 'rebase'")))
      }))

    it.effect("subcommand that is not present", () =>
      Effect.gen(function*($) {
        const config = CliConfig.defaultConfig
        const args = List.make("git")
        const result = yield* $(Effect.map(
          Command.parse(git, args, config),
          (directive) => CommandDirective.isBuiltIn(directive) && BuiltInOption.isShowHelp(directive.option)
        ))
        expect(result).toBe(true)
      }))
  })

  describe.concurrent("Subcommands - nested", () => {
    const command = pipe(
      Command.make("command", Options.none, Args.none),
      Command.subcommands([
        pipe(
          Command.make("sub", Options.none, Args.none),
          Command.subcommands([Command.make("subsub", Options.boolean("i"), Args.text())])
        )
      ])
    )

    it.effect("deeply nested subcommands with an option and argument", () =>
      Effect.gen(function*($) {
        const config = CliConfig.defaultConfig
        const args = List.make("command", "sub", "subsub", "-i", "text")
        const result = yield* $(Command.parse(command, args, config))
        expect(result).toEqual(CommandDirective.userDefined(List.nil(), [
          [undefined, undefined],
          [[undefined, undefined], [true, "text"]]
        ]))
      }))
  })
})
