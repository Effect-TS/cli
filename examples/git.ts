import * as Args from "@effect/cli/Args"
import * as CliApp from "@effect/cli/CliApp"
import * as CliConfig from "@effect/cli/CliConfig"
import * as Command from "@effect/cli/Command"
import * as Console from "@effect/cli/Console"
import * as HelpDoc from "@effect/cli/HelpDoc"
import * as Span from "@effect/cli/HelpDoc/Span"
import * as Options from "@effect/cli/Options"
import { pipe } from "@effect/data/Function"
import * as List from "@effect/data/List"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"

export type GitSubcommand = Add | Remote | AddRemote | RemoveRemote

export interface Add {
  readonly _tag: "Add"
  readonly modified: boolean
  readonly directory: string
}

export interface Remote {
  readonly _tag: "Remote"
  readonly verbose: boolean
}

export type RemoteSubcommand = AddRemote | RemoveRemote

export interface AddRemote {
  readonly _tag: "AddRemote"
  readonly name: string
  readonly url: string
}

export interface RemoveRemote {
  readonly _tag: "RemoveRemote"
  readonly name: string
}

export const add = (modified: boolean, directory: string): GitSubcommand => ({
  _tag: "Add",
  modified,
  directory
})

export const remote = (verbose: boolean): GitSubcommand => ({
  _tag: "Remote",
  verbose
})

export const addRemote = (name: string, url: string): RemoteSubcommand => ({
  _tag: "AddRemote",
  name,
  url
})

export const removeRemote = (name: string): RemoteSubcommand => ({
  _tag: "RemoveRemote",
  name
})

const addCommand = pipe(
  Command.make("add", Options.boolean("m"), Args.text({ name: "directory" })),
  Command.withHelp(HelpDoc.p("Description of the `git add` subcommand")),
  Command.map(([modified, directory]) => add(modified, directory))
)

const remoteAddCommand = pipe(
  Command.make("add", Options.zip(Options.text("name"), Options.text("url")), Args.none),
  Command.withHelp(HelpDoc.p("Description of the `git remote add` subcommand")),
  Command.map(([[name, url]]) => addRemote(name, url))
)

const remoteRemoveCommand = pipe(
  Command.make("remove", Options.none, Args.text({ name: "name" })),
  Command.withHelp(HelpDoc.p("Description of the `git remote remove` subcommand")),
  Command.map(([, [name]]) => removeRemote(name))
)

const remoteCommand = pipe(
  Command.make("remote", Options.alias(Options.boolean("verbose"), "v"), Args.none),
  Command.withHelp("Description of the `git remote` subcommand"),
  Command.subcommands([remoteAddCommand, remoteRemoveCommand]),
  Command.map(([, cmd]) => cmd)
)

const git = pipe(
  Command.make("git", Options.none, Args.none),
  Command.subcommands([addCommand, remoteCommand]),
  Command.map(([, cmd]) => cmd) // TODO: we shouldn't have to discard this stuff
)

const cli = CliApp.make({
  name: "Git Version Control",
  version: "0.9.2",
  command: git,
  summary: Span.text("a client for the git dvcs protocol")
})

const cliLayer = Layer.merge(CliConfig.layer(CliConfig.defaultConfig), Console.layer)

pipe(
  Effect.sync(() => List.fromIterable(process.argv.slice(2))),
  Effect.flatMap((args) =>
    CliApp.run(cli, args, (command) => {
      switch (command._tag) {
        case "Add": {
          const msg = `Executing 'git add ${command.directory}' with modified flag set to '${command.modified}'`
          return Effect.log(msg)
        }
        case "Remote": {
          const msg = `Executing 'git remote' with verbose flag set to '${command.verbose}'`
          return Effect.log(msg)
        }
        case "AddRemote": {
          const msg = `Executing 'git remote add ${command.name} ${command.url}'`
          return Effect.log(msg)
        }
        case "RemoveRemote": {
          const msg = `Executing 'git remote remove ${command.name}'`
          return Effect.log(msg)
        }
      }
    })
  ),
  Effect.provideLayer(cliLayer),
  Effect.runFork
)
