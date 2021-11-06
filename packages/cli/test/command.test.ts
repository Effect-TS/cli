import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import { pipe } from "@effect-ts/core/Function"
import { matchTag } from "@effect-ts/core/Utils"
import * as TE from "@effect-ts/jest/Test"

import * as Args from "../src/Args"
import * as Command from "../src/Command"
import * as CommandDirective from "../src/CommandDirective"
import * as Help from "../src/Help"
import * as Options from "../src/Options"
import * as Validation from "../src/Validation"

// -----------------------------------------------------------------------------
// Tail
// -----------------------------------------------------------------------------

const nFlag = Options.integer("n")

const tailOptions = nFlag

const tailArgs = Args.namedText("file")

const tailCommand = Command.command("tail", tailOptions, tailArgs)

// -----------------------------------------------------------------------------
// Word Count
// -----------------------------------------------------------------------------

const bytesFlag = Options.boolean("c")
const linesFlag = Options.boolean("l")
const wordsFlag = Options.boolean("w")
const charFlag = Options.boolean("m", false)

export const wcOptions = Options.tuple(bytesFlag, linesFlag, wordsFlag, charFlag)

const wcArgs = Args.repeat(Args.namedText("files"))

export const wcCommand = Command.command("wc", wcOptions, wcArgs)

// -----------------------------------------------------------------------------
// Ag
// -----------------------------------------------------------------------------

const afterFlag = pipe(Options.integer("after"), Options.alias("A"))

const beforeFlag = pipe(Options.integer("before"), Options.alias("B"))

const agOptions = Options.tuple(afterFlag, beforeFlag)

const agArgs = Args.text

const agCommand = Command.command("grep", agOptions, agArgs)

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("Command", () => {
  const { it } = TE.runtime()

  it("should validate a command with options followed by args", () =>
    T.gen(function* (_) {
      expect(
        yield* _(Command.parse_(tailCommand, ["tail", "-n", "100", "foo.log"]))
      ).toEqual(CommandDirective.userDefined(A.empty, Tp.tuple(100, "foo.log")))
      expect(
        yield* _(
          Command.parse_(agCommand, ["grep", "--after", "2", "--before", "3", "fooBar"])
        )
      ).toEqual(CommandDirective.userDefined(A.empty, Tp.tuple([2, 3], "fooBar")))
    }))

  it("should provide correct suggestions for misspelled options", () =>
    T.gen(function* (_) {
      const r1 = yield* _(
        T.result(
          Command.parse_(agCommand, ["grep", "--afte", "2", "--before", "3", "fooBar"])
        )
      )
      const r2 = yield* _(
        T.result(
          Command.parse_(agCommand, ["grep", "--after", "2", "--efore", "3", "fooBar"])
        )
      )
      const r3 = yield* _(
        T.result(
          Command.parse_(agCommand, ["grep", "--afte", "2", "--efore", "3", "fooBar"])
        )
      )

      expect(Ex.untraced(r1)).toEqual(
        Ex.fail(
          Validation.missingValue(
            Help.p(
              Help.error("The flag '--afte' is not recognized. Did you mean '--after'?")
            )
          )
        )
      )
      expect(Ex.untraced(r2)).toEqual(
        Ex.fail(
          Validation.missingValue(
            Help.p(
              Help.error(
                "The flag '--efore' is not recognized. Did you mean '--before'?"
              )
            )
          )
        )
      )
      expect(Ex.untraced(r3)).toEqual(
        Ex.fail(
          Validation.missingValue(
            Help.sequence_(
              Help.p(
                Help.error(
                  "The flag '--efore' is not recognized. Did you mean '--before'?"
                )
              ),
              Help.p(
                Help.error(
                  "The flag '--afte' is not recognized. Did you mean '--after'?"
                )
              )
            )
          )
        )
      )
    }))

  it("should show an error if an option is missing", () =>
    T.gen(function* (_) {
      const result = yield* _(
        T.result(
          Command.parse_(agCommand, ["grep", "--a", "2", "--before", "3", "fooBar"])
        )
      )

      expect(Ex.untraced(result)).toEqual(
        Ex.fail(
          Validation.missingValue(
            Help.p(Help.error("Expected to find '--after' option."))
          )
        )
      )
    }))

  it("should handle commands joined by orElse", () =>
    T.gen(function* (_) {
      const orElseCommand = pipe(
        Command.command("remote", Options.none, Args.none),
        Command.orElse(Command.command("log", Options.none, Args.none))
      )

      const result = yield* _(Command.parse_(orElseCommand, ["log"]))

      expect(result).toEqual(
        CommandDirective.userDefined(A.empty, Tp.tuple(undefined, undefined))
      )
    }))

  describe("Subcommands without Options or Arguments", () => {
    const git = pipe(
      Command.command("git", Options.none, Args.none),
      Command.subcommands(
        Command.command("remote", Options.none, Args.none),
        Command.command("log", Options.none, Args.none)
      )
    )

    it("should match the first subcommand without any surplus options", () =>
      T.gen(function* (_) {
        const result = yield* _(Command.parse_(git, ["git", "remote"]))

        expect(result).toEqual(
          CommandDirective.userDefined(
            A.empty,
            Tp.tuple(Tp.tuple(undefined, undefined), Tp.tuple(undefined, undefined))
          )
        )
      }))

    it("should match the first subcommand with surplus options", () =>
      T.gen(function* (_) {
        const result = yield* _(Command.parse_(git, ["git", "remote", "-v"]))

        expect(result).toEqual(
          CommandDirective.userDefined(
            ["-v"],
            Tp.tuple(Tp.tuple(undefined, undefined), Tp.tuple(undefined, undefined))
          )
        )
      }))

    it("should match the second subcommand without any surplus options", () =>
      T.gen(function* (_) {
        const result = yield* _(Command.parse_(git, ["git", "log"]))

        expect(result).toEqual(
          CommandDirective.userDefined(
            A.empty,
            Tp.tuple(Tp.tuple(undefined, undefined), Tp.tuple(undefined, undefined))
          )
        )
      }))
  })

  describe("Subcommands with Options and Arguments", () => {
    const git = pipe(
      Command.command("git", Options.none, Args.none),
      Command.subcommands(
        Command.command(
          "rebase",
          Options.boolean("i", true),
          Args.both_(Args.text, Args.text)
        )
      )
    )

    it("should handle subcommands with options and arguments", () =>
      T.gen(function* (_) {
        const result = yield* _(
          Command.parse_(git, ["git", "rebase", "-i", "upstream", "branch"])
        )

        expect(result).toEqual(
          CommandDirective.userDefined(
            A.empty,
            Tp.tuple(
              Tp.tuple(undefined, undefined),
              Tp.tuple(true, Tp.tuple("upstream", "branch"))
            )
          )
        )
      }))

    it("should reject an unknown subcommand", () =>
      T.gen(function* (_) {
        const result = yield* _(T.result(Command.parse_(git, ["git", "abc"])))

        expect(Ex.untraced(result)).toEqual(
          Ex.fail(Validation.commandMismatch(Help.p("Unexpected command name: abc")))
        )
      }))

    it("should reject a command without specifying the subcommand", () =>
      T.gen(function* (_) {
        const result = yield* _(
          pipe(
            Command.parse_(git, ["git"]),
            T.map(
              matchTag(
                {
                  BuiltIn: (_) => _.option._tag === "ShowHelp"
                },
                () => false
              )
            )
          )
        )

        expect(result).toBeTruthy()
      }))
  })

  describe("Nested Subcommands", () => {
    const command = pipe(
      Command.command("command", Options.none, Args.none),
      Command.subcommands(
        pipe(
          Command.command("sub", Options.none, Args.none),
          Command.subcommands(
            Command.command("subsub", Options.boolean("i", true), Args.text)
          )
        )
      )
    )

    it("should handle a subcommand nested two levels deep with options and arguments", () =>
      T.gen(function* (_) {
        const result = yield* _(
          Command.parse_(command, ["command", "sub", "subsub", "-i", "text"])
        )

        expect(result).toEqual(
          CommandDirective.userDefined(
            A.empty,
            Tp.tuple(
              Tp.tuple(undefined, undefined),
              Tp.tuple(Tp.tuple(undefined, undefined), Tp.tuple(true, "text"))
            )
          )
        )
      }))
  })

  describe("Command HelpDoc", () => {
    it("should add help to a command", () =>
      T.gen(function* (_) {
        const command = pipe(
          Command.command("tldr"),
          Command.withHelp("this is some help")
        )
        const result = yield* _(Command.parse_(command, ["tldr"]))

        expect(Command.helpDoc(command)).toEqual(
          Help.sequence_(Help.h1("DESCRIPTION"), Help.p("this is some help"))
        )
        expect(result).toEqual(
          CommandDirective.userDefined(A.empty, Tp.tuple(undefined, undefined))
        )
      }))

    it("should add help to subcommands", () =>
      T.succeedWith(() => {
        const command = pipe(
          Command.command("command"),
          Command.subcommands(
            pipe(Command.command("sub"), Command.withHelp("this is some help"))
          )
        )

        expect(Command.helpDoc(command)).not.toEqual(
          Help.sequence_(Help.h1("DESCRIPTION"), Help.p("this is some help"))
        )
      }))

    it("should add help to an OrElse command", () =>
      T.succeedWith(() => {
        const command = pipe(
          Command.command("command1"),
          Command.withHelp("this is help for command1"),
          Command.orElse(Command.command("command2"))
        )

        expect(Command.helpDoc((command as any).left)).toEqual(
          Help.sequence_(Help.h1("DESCRIPTION"), Help.p("this is help for command1"))
        )
      }))

    it("should add help to a Map command", () =>
      T.succeedWith(() => {
        const command = pipe(
          Command.command("command", Options.text("word"), Args.text),
          Command.withHelp("this is some help"),
          Command.map(({ tuple: [_, a] }) => a.length)
        )

        expect(Help.render_(Command.helpDoc(command), Help.plainMode())).toContain(
          "this is some help"
        )
      }))
  })
})
