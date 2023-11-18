# Effect CLI

## Installation

You can install `@effect/cli` using your preferred package manager:

```sh
npm install @effect/cli
# or
pnpm add @effect/cli
# or
yarn add @effect/cli
```

You will also need to install one of the platform-specific `@effect/platform` packages based on where you intend to run your command-line application.

This is because `@effect/cli` must interact with many platform-specific services to function, such as the file system and the terminal.

For example, if your command-line application will run in a NodeJS environment:

```sh
npm install @effect/platform-node
# or
pnpm add @effect/platform-node
# or
yarn add @effect/platform-node
```

You can then provide the `NodeContext.layer` exported from `@effect/platform-node` to your command-line application to ensure that `@effect/cli` has access to all the platform-specific services that it needs.

For a more detailed walkthrough, take a read through the [Quick Start Guide](#quick-start-guide) below.

## API Reference

- https://effect-ts.github.io/cli/docs/modules

## Quick Start Guide

In this quick start guide, we are going to attempt to replicate a small part of the Git Distributed Version Control System command-line interface (CLI) using `@effect/cli`.

Specifically, our goal will be to build a CLI application which replicates the following subset of the `git` CLI which we will call `minigit`:

```
minigit       [-v | --version] [-h | --help] [-c <name>=<value>]
minigit add   [-v | --verbose] [--] [<pathspec>...]
minigit clone [--depth <depth>] [--] <repository> [<directory>]
```

A fully functioning version of the CLI application that will be built during this quick start is also available in the [examples](./examples/git.ts).

### Modeling the Parsed Command Line

A good first step when building an CLI with `@effect/cli` is to consider what the data model should be for a parsed command. For our `minigit` CLI, we have three commands that we would like to model.

```ts
import * as HashMap from "effect/HashMap"

// minigit [--version] [-h | --help] [-c <name>=<value>]
interface MiniGit {
  readonly config: HashMap.HashMap<string, string>
}
```

Notice that we have omitted the version and help flags from the model above. This is because Effect CLI has several [Built-In Commands](#built-in-commands) which are available automatically for all CLI applications built with `@effect/cli`.

Some of the relevant built-in commands are:

- The built-in `[--version]` flag will automatically display the version of the CLI application
- The built-in `[-h | --help]` flag will automatically generate and display a description based upon the commands available for your CLI application
- The built-in `[--wizard]` flag will automatically start Wizard Mode for your CLI application, which guides a user through the CLI application

Let's finish modeling our other commands:

```ts
import * as Option from "effect/Option"

// minigit add   [-v | --verbose] [--] [<pathspec>...]
interface MiniGitAdd {
  readonly verbose: boolean
  readonly paths: ReadonlyArray<string>
}

// minigit clone [--depth <depth>] [--] <repository> [<directory>]
interface MiniGitClone {
  readonly depth: Option.Option<number>
  readonly repository: string
  readonly directory: Option.Option<string>
}
```

### Modeling Commands

In addition, a command-line application built with `@effect/cli` must be able to interact with platform-specific services such as the file system, terminal, and others. Therefore, you must also install the `@effect/platform` package specific to the environment where your command-line application will run.

For example, if you intend to run your command-line application in a NodeJS environment, install `@effect/platform-node`:


Then, you can run your command-line application using the `Context` and `Runtime` exported by the environment-specific `@effect/platform` package:

```ts
import * as CliApp from "@effect/cli/CliApp"
import * as Command from "@effect/cli/Command"
import * as NodeContext from "@effect/platform-node/NodeContext"
import * as Runtime from "@effect/platform-node/Runtime"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"

const app = CliApp.make({
  name: "Hello App",
  version: "1.0.0",
  command: Command.standard("hello")
})

Effect.sync(() => process.argv.slice(2)).pipe(
  Effect.flatMap((args) => CliApp.run(app, args, () => Console.log("Hello, World!"))),
  Effect.provide(NodeContext.layer),
  Runtime.runMain
)
```

## Commands

A command is a structured sequence of text tokens that represents a specific directive for a CLI application. Effect CLI represents a CLI command using the `Command<A>` data type.

Effect CLI uses the data type `Command<A>` to represent a CLI command. When constructing a `CliApp`, at least one `Command<A>` must be provided. When run, the `CliApp` will then parse provided command-line arguments using the provided `Command<A>` into a structured format represented by the generic `A` type. Then you can implement the functionality of the CLI application using the parsed command-line input.

### Subcommands

A subcommand is a `Command` that belongs to a larger parent `Command`. Thus, it is possible for a `Command` to have several distinct subcommands.

Subcommands can be used to better organize and design the functionality of a CLI application. Different subcommands can represent distinct directives to be carried out by the CLI application.

For example, looking at the subset of the `git` CLI application provided below, `git` is the name of the parent `Command`, while `add` and `clone` are subcommands of `git`.

```sh
git clone # Creates a copy of a repository
git add   # Adds modified or new files that will be committed after using git commit
```

# Basic Construction

A standard `Command` can be constructed using the `Command.standard` constructor:

```ts
import * as Command from "@effect/cli/Command"

const git = Command.standard("git")
```

You can also specify additional `Options` and `Args` that a `Command` may accept:

```ts
import * as Args from "@effect/cli/Args"
import * as Command from "@effect/cli/Command"
import * as Options from "@effect/cli/Options"

const args = Args.file()
const options = Options.boolean("--version")
const git = Command.standard("git", { args, options })
```

See [Options](#options) and [Args](#args) for more information on each, respectively.

## Options

## Args
