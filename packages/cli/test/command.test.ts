import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import * as TE from "@effect-ts/jest/Test"
import { pipe } from "@effect-ts/system/Function"

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
      expect(yield* _(tailCommand.parse(["tail", "-n", "100", "foo.log"]))).toEqual(
        CommandDirective.userDefined(A.empty, Tp.tuple(100, "foo.log"))
      )
      expect(
        yield* _(agCommand.parse(["grep", "--after", "2", "--before", "3", "fooBar"]))
      ).toEqual(CommandDirective.userDefined(A.empty, Tp.tuple([2, 3], "fooBar")))
    }))

  it("should provide correct suggestions for misspelled options", () =>
    T.gen(function* (_) {
      const r1 = yield* _(
        T.result(agCommand.parse(["grep", "--afte", "2", "--before", "3", "fooBar"]))
      )
      const r2 = yield* _(
        T.result(agCommand.parse(["grep", "--after", "2", "--efore", "3", "fooBar"]))
      )
      const r3 = yield* _(
        T.result(agCommand.parse(["grep", "--afte", "2", "--efore", "3", "fooBar"]))
      )

      expect(Ex.untraced(r1)).toEqual(
        Ex.fail(
          Validation.missingValueError(
            Help.p(
              Help.error("The flag '--afte' is not recognized. Did you mean '--after'?")
            )
          )
        )
      )
      expect(Ex.untraced(r2)).toEqual(
        Ex.fail(
          Validation.missingValueError(
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
          Validation.missingValueError(
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
        T.result(agCommand.parse(["grep", "--a", "2", "--before", "3", "fooBar"]))
      )

      expect(Ex.untraced(result)).toEqual(
        Ex.fail(
          Validation.missingValueError(
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

      const result = yield* _(orElseCommand.parse(["log"]))

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
        const result = yield* _(git.parse(["git", "remote"]))

        expect(result).toEqual(
          CommandDirective.userDefined(
            A.empty,
            Tp.tuple(Tp.tuple(undefined, undefined), Tp.tuple(undefined, undefined))
          )
        )
      }))

    it("should match the first subcommand with surplus options", () =>
      T.gen(function* (_) {
        const result = yield* _(git.parse(["git", "remote", "-v"]))

        expect(result).toEqual(
          CommandDirective.userDefined(
            ["-v"],
            Tp.tuple(Tp.tuple(undefined, undefined), Tp.tuple(undefined, undefined))
          )
        )
      }))

    it("should match the second subcommand without any surplus options", () =>
      T.gen(function* (_) {
        const result = yield* _(git.parse(["git", "log"]))

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
          Args.cons_(Args.text, Args.text)
        )
      )
    )

    it("should handle subcommands with options and arguments", () =>
      T.gen(function* (_) {
        const result = yield* _(
          git.parse(["git", "rebase", "-i", "upstream", "branch"])
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
        const result = yield* _(T.result(git.parse(["git", "abc"])))

        expect(Ex.untraced(result)).toEqual(
          Ex.fail(
            Validation.commandMismatchError(Help.p("Unexpected command name: abc"))
          )
        )
      }))

    it("should reject a command without specifying the subcommand", () =>
      T.gen(function* (_) {
        const result = yield* _(T.result(git.parse(["git"])))

        expect(Ex.untraced(result)).toEqual(
          Ex.fail(Validation.missingSubcommandError(Help.p("Missing subcommand.")))
        )
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
          command.parse(["command", "sub", "subsub", "-i", "text"])
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
})
