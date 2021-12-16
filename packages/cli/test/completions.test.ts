import { Tagged } from "@effect-ts/core/Case"
import * as Set from "@effect-ts/core/Collections/Immutable/Set"
import * as T from "@effect-ts/core/Effect"
import * as Equal from "@effect-ts/core/Equal"
import { pipe } from "@effect-ts/core/Function"
import * as TE from "@effect-ts/jest/Test"

import * as Args from "../src/Args"
import * as Command from "../src/Command"
import * as Exists from "../src/Exists"
import * as Help from "../src/Help"
import * as Options from "../src/Options"
import * as ShellType from "../src/ShellType"

type GitSubcommand = Add | Remote

class Add extends Tagged("Add")<{
  readonly modified: boolean
  readonly directory: string
}> {}

class Remote extends Tagged("Remote")<{
  readonly verbose: boolean
}> {}

export function add(modified: boolean, directory: string): GitSubcommand {
  return new Add({ modified, directory })
}

export function remote(verbose: boolean): GitSubcommand {
  return new Remote({ verbose })
}

export const modifiedFlag = Options.boolean("m")

const addOptions = modifiedFlag
const addArgs = Args.namedDirectory("directory", Exists.yes)
const addHelp = Help.p("Add subcommand description")

const addCommand = pipe(
  Command.make("add", addOptions, addArgs, addHelp),
  Command.map(({ tuple: [modified, directory] }) => add(modified, directory))
)

const verboseFlag = pipe(
  Options.boolean("verbose"),
  Options.alias("v"),
  Options.withDescription("this is the verbose option")
)

const remoteOptions = verboseFlag
const remoteArgs = Args.none
const remoteHelp = Help.p("Remote command description")

const remoteCommand = pipe(
  Command.make("remote", remoteOptions, remoteArgs, remoteHelp),
  Command.map(remote)
)

const gitCommand = pipe(
  Command.make("git", Options.none, Args.none),
  Command.subcommands(pipe(addCommand, Command.orElse(remoteCommand)))
)

describe("Completions", () => {
  const { it } = TE.runtime()

  describe("Default", () => {
    describe("Bash", () => {
      it("should generate default bash completions for a command", () =>
        T.gen(function* (_) {
          const result = yield* _(
            pipe(gitCommand, Command.completions(["git", " "], ShellType.bash))
          )

          expect(result).toEqual(Set.fromArray(Equal.string)(["add", "remote"]))
        }))

      it("should generate default bash completions for a subcommand", () =>
        T.gen(function* (_) {
          const result = yield* _(
            pipe(
              gitCommand,
              Command.completions(["git", "remote", " "], ShellType.bash)
            )
          )

          expect(result).toEqual(Set.fromArray(Equal.string)(["--verbose"]))
        }))
    })

    describe("Zsh", () => {
      it("should generate default zsh completions for a command", () =>
        T.gen(function* (_) {
          const result = yield* _(
            pipe(gitCommand, Command.completions(["git", " "], ShellType.zShell))
          )

          expect(result).toEqual(
            Set.fromArray(Equal.string)([
              "add:Add subcommand description",
              "remote:Remote command description"
            ])
          )
        }))

      it("should generate default zsh completions for a subcommand", () =>
        T.gen(function* (_) {
          const result = yield* _(
            pipe(
              gitCommand,
              Command.completions(["git", "remote", " "], ShellType.zShell)
            )
          )

          expect(result).toEqual(
            Set.fromArray(Equal.string)(["--verbose: this is the verbose option"])
          )
        }))
    })
  })

  describe("Custom", () => {
    describe("Bash", () => {
      it("should register custom bash completions for a command", () =>
        T.gen(function* (_) {
          const result = yield* _(
            pipe(
              gitCommand,
              Command.withCustomCompletion(() => T.succeed(Set.singleton("--foo"))),
              Command.withCustomCompletion((_, __, shell) =>
                T.succeed(Set.singleton(`--${shell._tag.toLowerCase()}`))
              ),
              Command.completions(["git", " "], ShellType.bash)
            )
          )

          expect(result).toEqual(Set.fromArray(Equal.string)(["--bash", "--foo"]))
        }))

      it("should register custom bash completions for an option", () =>
        T.gen(function* (_) {
          const fooOption = pipe(
            Options.text("foo"),
            Options.withDescription("the foo option"),
            Options.withCustomCompletion(() => T.succeed(Set.singleton("--bar")))
          )
          const fooCommand = Command.make("test", fooOption)

          const result = yield* _(
            pipe(fooCommand, Command.completions(["test", " "], ShellType.bash))
          )

          expect(result).toEqual(Set.fromArray(Equal.string)(["--bar"]))
        }))
    })

    describe("Zsh", () => {
      it("should register custom zsh completions for a command", () =>
        T.gen(function* (_) {
          const result = yield* _(
            pipe(
              gitCommand,
              Command.withCustomCompletion(() => T.succeed(Set.singleton("--foo"))),
              Command.withCustomCompletion((_, __, shell) =>
                T.succeed(Set.singleton(`--${shell._tag.toLowerCase()}:the shell type`))
              ),
              Command.completions(["git", " "], ShellType.zShell)
            )
          )

          expect(result).toEqual(
            Set.fromArray(Equal.string)(["--zshell:the shell type", "--foo"])
          )
        }))

      it("should register custom zsh completions for an option", () =>
        T.gen(function* (_) {
          const fooOption = pipe(
            Options.text("foo"),
            Options.withDescription("the foo option"),
            Options.withCustomCompletion(() => T.succeed(Set.singleton("--bar")))
          )
          const fooCommand = Command.make("test", fooOption)

          const result = yield* _(
            pipe(fooCommand, Command.completions(["test", " "], ShellType.zShell))
          )

          expect(result).toEqual(Set.fromArray(Equal.string)(["--bar"]))
        }))
    })
  })
})
