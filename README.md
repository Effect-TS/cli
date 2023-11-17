# Effect CLI

command-line interface (CLI)

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
