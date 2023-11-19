# Effect CLI

- [Effect CLI](#effect-cli)
  - [Installation](#installation)
  - [Built-In Options](#built-in-options)
  - [API Reference](#api-reference)
  - [Quick Start Guide](#quick-start-guide)
    - [Creating the Command-Line Application](#creating-the-command-line-application)
    - [Running the Command-Line Application](#running-the-command-line-application)


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

## Built-In Options

All Effect CLI programs ship with several built-in options:

  - `[--version]` - automatically displays the version of the CLI application
  - `[-h | --help]` - automatically generates and displays a help documentation for your CLI application
  - `[--wizard]` - starts the Wizard Mode for your CLI application which guides a user through constructing a command for your the CLI application
  - `[--shell-completion-script] [--shell-type]` - automatically generates and displays a shell completion script for your CLI application

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

**NOTE**: During this quick start guide, we will focus on building the components of the CLI application that will allow us to parse the above commands into structured data. However, implementing the *functionality* of these commands is out of the scope of this quick start guide.

The CLI application that will be built during this quick start guide is also available in the [examples](./examples/git.ts).

### Creating the Command-Line Application

When building an CLI application with `@effect/cli`, it is often good practice to specify each command individually is to consider what the data model should be for a parsed command.

For our `minigit` CLI, we have three commands that we would like to model. Let's start by using `@effect/cli` to create a basic `Command` to represent our top-level `minigit` command:

```ts
import * as Command from "@effect/cli/Command"
import * as Options from "@effect/cli/Options"

// minigit [--version] [-h | --help] [-c <name>=<value>]
const minigitOptions = Options.keyValueMap("c").pipe(Options.optional)
const minigit = Command.standard("minigit", { options: minigitOptions })
```

Some things to note in the above example:
  1. We've imported the `Command` and `Options` modules from `@effect/cli`
  2. We've created an `Options` object which will allow us to parse `key=value` pairs with the `-c` flag
  3. We've made our `-c` flag an optional option using the `Options.optional` combinator
  4. We've created a `Command` named `minigit` and passed our previously created `Options` to the `minigit` command

An astute observer may have also noticed that in the snippet above we did not specify `Options` for version and help.

This is because Effect CLI has several built-in options (see [Built-In Options](#built-in-options) for more information) which are available automatically for all CLI applications built with `@effect/cli`.

Let's continue and create our other two commands:

```ts
import * as Args from "@effect/cli/Args"
import * as Command from "@effect/cli/Command"
import * as Options from "@effect/cli/Options"

// minigit [--version] [-h | --help] [-c <name>=<value>]
const minigitOptions = Options.keyValueMap("c").pipe(Options.optional)
const minigit = Command.standard("minigit", { options: minigitOptions })

// minigit add   [-v | --verbose] [--] [<pathspec>...]
const minigitAddOptions = Options.boolean("verbose").pipe(Options.withAlias("v"))
const minigitAdd = Command.standard("add", { options: minigitAddOptions })

// minigit clone [--depth <depth>] [--] <repository> [<directory>]
const minigitCloneArgs = Args.all([
  Args.text({ name: "repository" }),
  Args.directory().pipe(Args.optional)
])
const minigitCloneOptions = Options.integer("depth").pipe(Options.optional)
const minigitClone = Command.standard("clone", {
  options: minigitCloneOptions,
  args: minigitCloneArgs
})
```

Some things to note in the above example:
  1. We've additionally imported the `Args` module from `@effect/cli`
  2. We've used `Options.withAlias` to give the `--verbose` flag an alias of `-v`
  3. We've used `Args.all` to compose two `Args` allowing us to return a tuple of their values
  4. We've additionally passed the `Args` for `minigit clone` to the `Command`

Now that we've fully defined all the commands, we must indicate that the `add` and `clone` commands are subcommands of `minigit`. This can be accomplished using the `Command.withSubcommands` combinator:

```ts
const finalCommand = minigit.pipe(Command.withSubcommands([minigitAdd, minigitClone]))
```

Inspecting the type of `finalCommand` above, we can see that `@effect/cli` tracks:
  - the name of the `Command`
  - the structured data that results from parsing the `Options` for the command
  - the structured data that results from parsing the `Args` for the command

```ts
const finalCommand: Command.Command<{
    readonly name: "minigit";
    readonly options: Option<HashMap<string, string>>;
    readonly args: void;
    readonly subcommand: Option<{
        readonly name: "add";
        readonly options: boolean;
        readonly args: void;
    } | {
        readonly name: "clone";
        readonly options: Option<number>;
        readonly args: [string, Option<string>];
    }>;
}>
```

To reduce the verbosity of the `Command` type, we can create data models for our subcommands:

```ts
import * as Data from "effect/Data"
import * as Option from "effect/Option"

type Subcommand = AddSubcommand | CloneSubcommand

interface AddSubcommand extends Data.Case {
  readonly _tag: "AddSubcommand"
  readonly verbose: boolean
}
const AddSubcommand = Data.tagged<AddSubcommand>("AddSubcommand")

interface CloneSubcommand extends Data.Case {
  readonly _tag: "CloneSubcommand"
  readonly depth: Option.Option<number>
  readonly repository: string
  readonly directory: Option.Option<string>
}
const CloneSubcommand = Data.tagged<CloneSubcommand>("CloneSubcommand")
```

And then use `Command.map` to map the values parsed by our subcommands to the data models we've created:

```ts
const minigitAdd = Command.standard("add", { options: minigitAddOptions }).pipe(
  Command.map((parsed) => AddSubcommand({ verbose: parsed.options }))
)

const minigitClone = Command.standard("clone", {
  options: minigitCloneOptions,
  args: minigitCloneArgs
const minigitClone = Command.standard("clone", {
  options: minigitCloneOptions,
  args: minigitCloneArgs
}).pipe(Command.map((parsed) =>
  CloneSubcommand({
    depth: parsed.options,
    repository: parsed.args[0],
    directory: parsed.args[1]
  })
))
```

Now if we inspect the type of our top-level `finalCommand` we will see our data models instead of their properties:

```ts
const finalCommand: Command.Command<{
    readonly name: "minigit";
    readonly options: Option.Option<HashMap<string, string>>;
    readonly args: void;
    readonly subcommand: Option.Option<CloneSubcommand | AddSubcommand>;
}>
```

The last thing left to do before we have a complete CLI application is to use our command to construct a `CliApp`:

```ts
import * as CliApp from "@effect/cli/CliApp"

// ...

const cliApp = CliApp.make({
  name: "MiniGit Distributed Version Control",
  version: "v2.42.1",
  command: finalCommand
})
```

Some things to note in the above example:
  1. We've additionally imported the `CliApp` module from `@effect/cli`
  2. We've constructed a new `CliApp` using `CliApp.make`
  3. We've provided our application with a `name`, `version`, and our `finalCommand`

At this point, we're ready to run our CLI application.

### Running the Command-Line Application

For the purposes of this example, we will assume that our CLI application is running in a NodeJS environment and that we have previously installed `@effect/platform-node` (see [Installation](#installation)).

We can then run the CLI application using the `CliApp.run` method. This method takes three arguments: the `CliApp` to run, the command-line arguments, and an `execute` function which will be called with the parsed command-line arguments.

```ts
import * as NodeContext from "@effect/platform-node/NodeContext"
import * as Runtime from "@effect/platform-node/Runtime"
import * as Effect from "effect/Effect"

const program = Effect.gen(function*(_) {
  const args = yield* _(Effect.sync(() => globalThis.process.argv.slice(1)))
  return yield* _(CliApp.run(cliApp, args, (parsed) => {
    return Effect.unit // For now, do nothing
  }))
})

program.pipe(
  Effect.provide(NodeContext.layer),
  Runtime.runMain
)
```

Some things to note in the above example:
  1. We've imported the `Effect` module from `effect`
  2. We've imported the `NodeContext` and `Runtime` modules from `@effect/platform-node`
  3. We've used `Effect.sync` to lazily evaluate the NodeJS `process.argv`
  4. We've called `CliApp.run` to execute our CLI application (currently we're not using the parsed arguments)
  5. We've provided our CLI `program` with the `NodeContext` `Layer`
     - Ensure that the CLI can access platform-specific services (i.e. `FileSystem`, `Terminal`, etc.)
  6. We've used the platform-specific `Runtime.runMain` to run the program

At the moment, we're not using the parsed command-line arguments for anything, but we *can* run some of the built-in commands to see how they work. For simplicity, the example commands below run the `minigit` [example](./examples/minigit.ts) within this project. If you've been following along, feel free to replace with a command appropriate for your environment:

  - Display the CLI application's version:

    ```sh
    pnpm tsx ./examples/minigit.ts --version
    ```

  - Display the help documentation for a command:

    ```sh
    pnpm tsx ./examples/minigit.ts --help
    pnpm tsx ./examples/minigit.ts add --help
    pnpm tsx ./examples/minigit.ts clone --help
    ```

  - Run the Wizard Mode for a command:

    ```sh
    pnpm tsx ./examples/minigit.ts --wizard
    pnpm tsx ./examples/minigit.ts add --wizard
    ```

Let's go ahead and adjust our `CliApp.run` to make use of the parsed command-line arguments.

```ts
import { pipe } from "effect/Function"
import * as ReadonlyArray from "effect/ReadonlyArray"

const handleRootCommand = (configs: Option.Option<HashMap.HashMap<string, string>>) =>
  Option.match(configs, {
    onNone: () => Console.log("Running 'minigit'"),
    onSome: (configs) => {
      const keyValuePairs = Array.from(configs).map(([key, value]) => `${key}=${value}`).join(", ")
      return Console.log(`Running 'minigit' with the following configs: ${keyValuePairs}`)
    }
  })

const handleSubcommand = (subcommand: Subcommand) => {
  switch (subcommand._tag) {
    case "AddSubcommand": {
      return Console.log(`Running 'minigit add' with '--verbose ${subcommand.verbose}'`)
    }
    case "CloneSubcommand": {
      const optionsAndArgs = pipe(
        ReadonlyArray.compact([
          Option.map(subcommand.depth, (depth) => `--depth ${depth}`),
          Option.some(subcommand.repository),
          subcommand.directory
        ]),
        ReadonlyArray.join(", ")
      )
      return Console.log(
        `Running 'minigit clone' with the following options and arguments: '${optionsAndArgs}'`
      )
    }
  }
}

const program = Effect.gen(function*(_) {
  const args = yield* _(Effect.sync(() => globalThis.process.argv.slice(1)))
  return yield* _(CliApp.run(cliApp, args, (parsed) =>
    Option.match(parsed.subcommand, {
      onNone: () => handleRootCommand(parsed.options),
      onSome: (subcommand) => handleSubcommand(subcommand)
    })))
})

program.pipe(
  Effect.provide(NodeContext.layer),
  Runtime.runMain
)
```

Some things to note in the above example:
  1. We've created functions to handle both cases where:
    - We receive parsed command-line arguments that does contain a subcommand
    - We receive parsed command-line arguments that does not contain a subcommand
  2. Within each of our handlers, we are simply loggging the command and the provided options / arguments to the console

We can now run some commands to observe the output. Again, we will assume you are running the [example](./examples//minigit.ts), so make sure to adjust the commands below if you've been following along:

```sh
pnpm tsx ./examples/minigit.ts
pnpm tsx ./examples/minigit.ts -c key1=value1 -c key2=value2

pnpm tsx ./examples/minigit.ts add
pnpm tsx ./examples/minigit.ts add --verbose

pnpm tsx ./examples/minigit.ts clone https://github.com/Effect-TS/cli.git
pnpm tsx ./examples/minigit.ts clone --depth 1 https://github.com/Effect-TS/cli.git
pnpm tsx ./examples/minigit.ts clone --depth 1 https://github.com/Effect-TS/cli.git ./output-directory
```

You should also try running some invalid commands and observe the error output from your Effect CLI application.

<hr/>

At this point, we've completed our quick-start guide!

We hope that you enjoyed learning a little bit about Effect CLI, but this guide only scratched surface! We encourage you to continue exploring Effect CLI and all the features it provides!

Happy Hacking!
