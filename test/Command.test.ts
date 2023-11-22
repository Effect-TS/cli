import * as Args from "@effect/cli/Args"
import * as BuiltInOptions from "@effect/cli/BuiltInOptions"
import * as CliConfig from "@effect/cli/CliConfig"
import * as Command from "@effect/cli/Command"
import * as CommandDirective from "@effect/cli/CommandDirective"
import * as HelpDoc from "@effect/cli/HelpDoc"
import * as Options from "@effect/cli/Options"
import * as Grep from "@effect/cli/test/utils/grep"
import * as Tail from "@effect/cli/test/utils/tail"
import * as WordCount from "@effect/cli/test/utils/wc"
import * as ValidationError from "@effect/cli/ValidationError"
import * as FileSystem from "@effect/platform-node/FileSystem"
import * as Terminal from "@effect/platform-node/Terminal"
import * as Doc from "@effect/printer/Doc"
import * as Render from "@effect/printer/Render"
import { Effect, Option, ReadonlyArray, String } from "effect"
import * as Layer from "effect/Layer"
import { describe, expect, it } from "vitest"

const MainLive = Layer.merge(FileSystem.layer, Terminal.layer)

const runEffect = <E, A>(
  self: Effect.Effect<FileSystem.FileSystem | Terminal.Terminal, E, A>
): Promise<A> => Effect.provide(self, MainLive).pipe(Effect.runPromise)

describe("Command", () => {
  describe("Standard Commands", () => {
    it("should validate a command with options followed by arguments", () =>
      Effect.gen(function*(_) {
        const args1 = ReadonlyArray.make("tail", "-n", "100", "foo.log")
        const args2 = ReadonlyArray.make("grep", "--after", "2", "--before", "3", "fooBar")
        const result1 = yield* _(Command.parse(Tail.command, args1, CliConfig.defaultConfig))
        const result2 = yield* _(Command.parse(Grep.command, args2, CliConfig.defaultConfig))
        const expected1 = { name: "tail", options: 100, args: "foo.log" }
        const expected2 = { name: "grep", options: [2, 3], args: "fooBar" }
        expect(result1).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected1))
        expect(result2).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected2))
      }).pipe(runEffect))

    it("should provide auto-correct suggestions for misspelled options", () =>
      Effect.gen(function*(_) {
        const args1 = ReadonlyArray.make("grep", "--afte", "2", "--before", "3", "fooBar")
        const args2 = ReadonlyArray.make("grep", "--after", "2", "--efore", "3", "fooBar")
        const args3 = ReadonlyArray.make("grep", "--afte", "2", "--efore", "3", "fooBar")
        const result1 = yield* _(
          Effect.flip(Command.parse(Grep.command, args1, CliConfig.defaultConfig))
        )
        const result2 = yield* _(
          Effect.flip(Command.parse(Grep.command, args2, CliConfig.defaultConfig))
        )
        const result3 = yield* _(
          Effect.flip(Command.parse(Grep.command, args3, CliConfig.defaultConfig))
        )
        expect(result1).toEqual(ValidationError.correctedFlag(HelpDoc.p(
          "The flag '--afte' is not recognized. Did you mean '--after'?"
        )))
        expect(result2).toEqual(ValidationError.correctedFlag(HelpDoc.p(
          "The flag '--efore' is not recognized. Did you mean '--before'?"
        )))
        expect(result3).toEqual(ValidationError.correctedFlag(HelpDoc.p(
          "The flag '--afte' is not recognized. Did you mean '--after'?"
        )))
      }).pipe(runEffect))

    it("should return an error if an option is missing", () =>
      Effect.gen(function*(_) {
        const args = ReadonlyArray.make("grep", "--a", "2", "--before", "3", "fooBar")
        const result = yield* _(
          Effect.flip(Command.parse(Grep.command, args, CliConfig.defaultConfig))
        )
        expect(result).toEqual(ValidationError.missingValue(HelpDoc.sequence(
          HelpDoc.p("Expected to find option: '--after'"),
          HelpDoc.p("Expected to find option: '--before'")
        )))
      }).pipe(runEffect))
  })

  describe("Alternative Commands", () => {
    it("should handle alternative commands", () =>
      Effect.gen(function*(_) {
        const args = ReadonlyArray.of("log")
        const command = Command.make("remote").pipe(Command.orElse(Command.make("log")))
        const result = yield* _(Command.parse(command, args, CliConfig.defaultConfig))
        const expected = { name: "log", options: void 0, args: void 0 }
        expect(result).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected))
      }).pipe(runEffect))
  })

  describe("Commands with Clustered Options", () => {
    it("should treat clustered boolean options as un-clustered options", () =>
      Effect.gen(function*(_) {
        const args1 = ReadonlyArray.make("wc", "-clw", "filename")
        const args2 = ReadonlyArray.make("wc", "-c", "-l", "-w", "filename")
        const result1 = yield* _(Command.parse(WordCount.command, args1, CliConfig.defaultConfig))
        const result2 = yield* _(Command.parse(WordCount.command, args2, CliConfig.defaultConfig))
        const expected = { name: "wc", options: [true, true, true, true], args: ["filename"] }
        expect(result1).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected))
        expect(result2).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected))
      }).pipe(runEffect))

    it("should not uncluster wrong clusters", () =>
      Effect.gen(function*(_) {
        const args = ReadonlyArray.make("wc", "-clk")
        const result = yield* _(Command.parse(WordCount.command, args, CliConfig.defaultConfig))
        const expected = { name: "wc", options: [false, false, false, true], args: ["-clk"] }
        expect(result).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected))
      }).pipe(runEffect))

    it("should not alter '-'", () =>
      Effect.gen(function*(_) {
        const args = ReadonlyArray.make("wc", "-")
        const result = yield* _(Command.parse(WordCount.command, args, CliConfig.defaultConfig))
        const expected = { name: "wc", options: [false, false, false, true], args: ["-"] }
        expect(result).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected))
      }).pipe(runEffect))
  })

  describe("Subcommands without Options or Arguments", () => {
    const options = Options.boolean("verbose").pipe(Options.withAlias("v"))

    const git = Command.make("git", { options }).pipe(Command.withSubcommands([
      Command.make("remote"),
      Command.make("log")
    ]))

    it("should match the top-level command if no subcommands are specified", () =>
      Effect.gen(function*(_) {
        const args = ReadonlyArray.make("git", "-v")
        const result = yield* _(Command.parse(git, args, CliConfig.defaultConfig))
        const expected = { name: "git", options: true, args: void 0, subcommand: Option.none() }
        expect(result).toEqual(CommandDirective.userDefined([], expected))
      }).pipe(runEffect))

    it("should match the first subcommand without any surplus arguments", () =>
      Effect.gen(function*(_) {
        const args = ReadonlyArray.make("git", "remote")
        const result = yield* _(Command.parse(git, args, CliConfig.defaultConfig))
        const expected = {
          name: "git",
          options: false,
          args: void 0,
          subcommand: Option.some({ name: "remote", options: void 0, args: void 0 })
        }
        expect(result).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected))
      }).pipe(runEffect))

    it("matches the first subcommand with a surplus option", () =>
      Effect.gen(function*(_) {
        const args = ReadonlyArray.make("git", "remote", "-v")
        const result = yield* _(Command.parse(git, args, CliConfig.defaultConfig))
        const expected = {
          name: "git",
          options: false,
          args: void 0,
          subcommand: Option.some({ name: "remote", options: void 0, args: void 0 })
        }
        expect(result).toEqual(CommandDirective.userDefined(ReadonlyArray.of("-v"), expected))
      }).pipe(runEffect))

    it("matches the second subcommand without any surplus arguments", () =>
      Effect.gen(function*(_) {
        const args = ReadonlyArray.make("git", "log")
        const result = yield* _(Command.parse(git, args, CliConfig.defaultConfig))
        const expected = {
          name: "git",
          options: false,
          args: void 0,
          subcommand: Option.some({ name: "log", options: void 0, args: void 0 })
        }
        expect(result).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected))
      }).pipe(runEffect))

    it("should return an error message for an unknown subcommand", () =>
      Effect.gen(function*(_) {
        const args = ReadonlyArray.make("git", "abc")
        const result = yield* _(Effect.flip(Command.parse(git, args, CliConfig.defaultConfig)))
        expect(result).toEqual(ValidationError.commandMismatch(HelpDoc.p(
          "Invalid subcommand for git - use one of 'log', 'remote'"
        )))
      }).pipe(runEffect))
  })

  describe("Subcommands with Options and Arguments", () => {
    const options = Options.all([
      Options.boolean("i"),
      Options.text("empty").pipe(Options.withDefault("drop"))
    ])

    const args = Args.all([Args.text(), Args.text()])

    const git = Command.make("git").pipe(Command.withSubcommands([
      Command.make("rebase", { options, args })
    ]))

    it("should parse a subcommand with required options and arguments", () =>
      Effect.gen(function*(_) {
        const args = ReadonlyArray.make("git", "rebase", "-i", "upstream", "branch")
        const result = yield* _(Command.parse(git, args, CliConfig.defaultConfig))
        const expected = {
          name: "git",
          options: void 0,
          args: void 0,
          subcommand: Option.some({
            name: "rebase",
            options: [true, "drop"],
            args: ["upstream", "branch"]
          })
        }
        expect(result).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected))
      }).pipe(runEffect))

    it("should parse a subcommand with required and optional options and arguments", () =>
      Effect.gen(function*(_) {
        const args = ReadonlyArray.make(
          "git",
          "rebase",
          "-i",
          "--empty",
          "ask",
          "upstream",
          "branch"
        )
        const result = yield* _(Command.parse(git, args, CliConfig.defaultConfig))
        const expected = {
          name: "git",
          options: void 0,
          args: void 0,
          subcommand: Option.some({
            name: "rebase",
            options: [true, "ask"],
            args: ["upstream", "branch"]
          })
        }
        expect(result).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected))
      }).pipe(runEffect))
  })

  describe("Nested Subcommands", () => {
    const command = Command.make("command").pipe(Command.withSubcommands([
      Command.make("sub").pipe(Command.withSubcommands([
        Command.make("subsub", { options: Options.boolean("i"), args: Args.text() })
      ]))
    ]))

    it("should properly parse deeply nested subcommands with options and arguments", () =>
      Effect.gen(function*(_) {
        const args = ReadonlyArray.make("command", "sub", "subsub", "-i", "text")
        const result = yield* _(Command.parse(command, args, CliConfig.defaultConfig))
        const expected = {
          name: "command",
          options: void 0,
          args: void 0,
          subcommand: Option.some({
            name: "sub",
            options: void 0,
            args: void 0,
            subcommand: Option.some({
              name: "subsub",
              options: true,
              args: "text"
            })
          })
        }
        expect(result).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected))
      }).pipe(runEffect))
  })

  describe("Help Documentation", () => {
    it("should allow adding help documentation to a command", () =>
      Effect.gen(function*(_) {
        const cmd = Command.make("tldr").pipe(Command.withDescription("this is some help"))
        const args = ReadonlyArray.of("tldr")
        const result = yield* _(Command.parse(cmd, args, CliConfig.defaultConfig))
        const expectedValue = { name: "tldr", options: void 0, args: void 0 }
        const expectedDoc = HelpDoc.sequence(
          HelpDoc.h1("DESCRIPTION"),
          HelpDoc.p("this is some help")
        )
        expect(result).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expectedValue))
        expect(Command.getHelp(cmd)).toEqual(expectedDoc)
      }).pipe(runEffect))

    it("should allow adding help documentation to subcommands", () => {
      const cmd = Command.make("command").pipe(Command.withSubcommands([
        Command.make("sub").pipe(Command.withDescription("this is some help"))
      ]))
      const expected = HelpDoc.sequence(HelpDoc.h1("DESCRIPTION"), HelpDoc.p("this is some help"))
      expect(Command.getHelp(cmd)).not.toEqual(expected)
    })

    it("should correctly display help documentation for a command", () => {
      const child3 = Command.make("child3").pipe(Command.withDescription("help 3"))
      const child2 = Command.make("child2").pipe(
        Command.withDescription("help 2"),
        Command.orElse(child3)
      )
      const child1 = Command.make("child1").pipe(
        Command.withSubcommands([child2]),
        Command.withDescription("help 1")
      )
      const parent = Command.make("parent").pipe(Command.withSubcommands([child1]))
      const result = Render.prettyDefault(
        Doc.unAnnotate(HelpDoc.toAnsiDoc(Command.getHelp(parent)))
      )
      expect(result).toBe(String.stripMargin(
        `|COMMANDS
         |
         |  - child1         help 1
         |
         |  - child2 child1  help 2
         |
         |  - child3 child1  help 3
         |`
      ))
    })
  })

  describe("Built-In Options Processing", () => {
    const command = Command.make("command", { options: Options.text("a") })
    const params1 = ReadonlyArray.make("command", "--help")
    const params2 = ReadonlyArray.make("command", "-h")
    const params3 = ReadonlyArray.make("command", "--wizard")
    const params4 = ReadonlyArray.make("command", "--completions", "sh")
    const params5 = ReadonlyArray.make("command", "-a", "--help")
    const params6 = ReadonlyArray.make("command", "--help", "--wizard", "-b")
    const params7 = ReadonlyArray.make("command", "-hdf", "--help")
    const params8 = ReadonlyArray.make("command", "-af", "asdgf", "--wizard")

    const directiveType = <A>(directive: CommandDirective.CommandDirective<A>): string => {
      if (CommandDirective.isBuiltIn(directive)) {
        if (BuiltInOptions.isShowHelp(directive.option)) {
          return "help"
        }
        if (BuiltInOptions.isShowWizard(directive.option)) {
          return "wizard"
        }
        if (BuiltInOptions.isShowCompletions(directive.option)) {
          return "completions"
        }
      }
      return "user"
    }

    it("should trigger built-in options if they are alone", () =>
      Effect.gen(function*(_) {
        const result1 = yield* _(
          Command.parse(command, params1, CliConfig.defaultConfig),
          Effect.map(directiveType)
        )
        const result2 = yield* _(
          Command.parse(command, params2, CliConfig.defaultConfig),
          Effect.map(directiveType)
        )
        const result3 = yield* _(
          Command.parse(command, params3, CliConfig.defaultConfig),
          Effect.map(directiveType)
        )
        const result4 = yield* _(
          Command.parse(command, params4, CliConfig.defaultConfig),
          Effect.map(directiveType)
        )
        expect(result1).toBe("help")
        expect(result2).toBe("help")
        expect(result3).toBe("wizard")
        expect(result4).toBe("completions")
      }).pipe(runEffect))

    it("should not trigger help if an option matches", () =>
      Effect.gen(function*(_) {
        const result = yield* _(
          Command.parse(command, params5, CliConfig.defaultConfig),
          Effect.map(directiveType)
        )
        expect(result).toBe("user")
      }).pipe(runEffect))

    it("should trigger help even if not alone", () =>
      Effect.gen(function*(_) {
        const result1 = yield* _(
          Command.parse(command, params6, CliConfig.defaultConfig),
          Effect.map(directiveType)
        )
        const result2 = yield* _(
          Command.parse(command, params7, CliConfig.defaultConfig),
          Effect.map(directiveType)
        )
        expect(result1).toBe("help")
        expect(result2).toBe("help")
      }).pipe(runEffect))

    it("should trigger wizard even if not alone", () =>
      Effect.gen(function*(_) {
        const result = yield* _(
          Command.parse(command, params8, CliConfig.defaultConfig),
          Effect.map(directiveType)
        )
        expect(result).toBe("wizard")
      }).pipe(runEffect))
  })

  describe("End of Command Options Symbol", () => {
    const command = Command.make("cmd", {
      options: Options.all([
        Options.optional(Options.text("something")),
        Options.boolean("verbose").pipe(Options.withAlias("v"))
      ]),
      args: Args.repeated(Args.text())
    })

    it("should properly handle the end of command options symbol", () =>
      Effect.gen(function*(_) {
        const args1 = ReadonlyArray.make("cmd", "-v", "--something", "abc", "something")
        const args2 = ReadonlyArray.make("cmd", "-v", "--", "--something", "abc", "something")
        const args3 = ReadonlyArray.make("cmd", "--", "-v", "--something", "abc", "something")
        const result1 = yield* _(Command.parse(command, args1, CliConfig.defaultConfig))
        const result2 = yield* _(Command.parse(command, args2, CliConfig.defaultConfig))
        const result3 = yield* _(Command.parse(command, args3, CliConfig.defaultConfig))
        const expected1 = {
          name: "cmd",
          options: [Option.some("abc"), true],
          args: ReadonlyArray.of("something")
        }
        const expected2 = {
          name: "cmd",
          options: [Option.none(), true],
          args: ReadonlyArray.make("--something", "abc", "something")
        }
        const expected3 = {
          name: "cmd",
          options: [Option.none(), false],
          args: ReadonlyArray.make("-v", "--something", "abc", "something")
        }
        expect(result1).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected1))
        expect(result2).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected2))
        expect(result3).toEqual(CommandDirective.userDefined(ReadonlyArray.empty(), expected3))
      }).pipe(runEffect))
  })
})
