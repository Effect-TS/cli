import { Tagged } from "@effect-ts/core/Case"
import * as T from "@effect-ts/core/Effect"
import * as R from "@effect-ts/node/Runtime"
import { pipe } from "@effect-ts/system/Function"
import { matchTag } from "@effect-ts/system/Utils"

import * as Args from "../../src/Args"
import * as CliApp from "../../src/CliApp"
import * as Command from "../../src/Command"
import * as Exists from "../../src/Exists"
import * as Help from "../../src/Help"
import { putStrLn } from "../../src/Internal/Console"
import * as Options from "../../src/Options"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type GitSubcommand = Add | Remote

export class Add extends Tagged("Add")<{
  readonly modified: boolean
  readonly directory: string
}> {}

export class Remote extends Tagged("Remote")<{
  readonly verbose: boolean
}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export function add(modified: boolean, directory: string): GitSubcommand {
  return new Add({ modified, directory })
}

export function remote(verbose: boolean): GitSubcommand {
  return new Remote({ verbose })
}

// -----------------------------------------------------------------------------
// Add Subcommand
// -----------------------------------------------------------------------------

export const modifiedFlag = Options.boolean("m")

const addOptions = modifiedFlag
const addArgs = Args.namedDirectory("directory", Exists.yes)
const addHelp = Help.p("Add subcommand description")

const addCommand = pipe(
  Command.command("add", addOptions, addArgs, addHelp),
  Command.map(({ tuple: [modified, directory] }) => add(modified, directory))
)

// -----------------------------------------------------------------------------
// Remote Subcommand
// -----------------------------------------------------------------------------

const verboseFlag = pipe(Options.boolean("verbose"), Options.alias("v"))

const remoteOptions = verboseFlag
const remoteArgs = Args.none
const remoteHelp = Help.p("Remote command description")

const remoteCommand = pipe(
  Command.command("remote", remoteOptions, remoteArgs, remoteHelp),
  Command.map(({ tuple: [verbose] }) => remote(verbose))
)

// -----------------------------------------------------------------------------
// Git Command
// -----------------------------------------------------------------------------

const gitCommand = pipe(
  Command.command("git", Options.none, Args.none),
  Command.subcommands(pipe(addCommand, Command.orElse(remoteCommand))),
  Command.map((tuple) => tuple.get(1))
)

// -----------------------------------------------------------------------------
// CLI Application
// -----------------------------------------------------------------------------

export const gitApp = CliApp.make({
  name: "Git Version Control",
  version: "0.9.2",
  summary: Help.text("a client for the git dvcs protocol"),
  command: gitCommand
})

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

pipe(
  T.succeedWith(() => process.argv.slice(2)),
  T.chain((args) =>
    pipe(
      gitApp,
      CliApp.run(
        args,
        matchTag({
          Add: ({ directory, modified }) =>
            putStrLn(
              `Executing 'git add ${directory}' with the modified flag set to ${modified}`
            ),
          Remote: ({ verbose }) =>
            putStrLn(`Executing 'git remote' with the verbose flag set to ${verbose}`)
        })
      )
    )
  ),
  R.runMain
)
