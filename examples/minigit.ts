import * as Args from "@effect/cli/Args"
import * as Handled from "@effect/cli/HandledCommand"
import * as Options from "@effect/cli/Options"
import * as NodeContext from "@effect/platform-node/NodeContext"
import * as Runtime from "@effect/platform-node/Runtime"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as ReadonlyArray from "effect/ReadonlyArray"

// minigit [--version] [-h | --help] [-c <name>=<value>]
const minigit = Handled.make(
  "minigit",
  { configs: Options.keyValueMap("c").pipe(Options.optional) },
  ({ configs }) =>
    Option.match(configs, {
      onNone: () => Console.log("Running 'minigit'"),
      onSome: (configs) => {
        const keyValuePairs = Array.from(configs).map(([key, value]) => `${key}=${value}`).join(
          ", "
        )
        return Console.log(`Running 'minigit' with the following configs: ${keyValuePairs}`)
      }
    })
)

// minigit add   [-v | --verbose] [--] [<pathspec>...]
const minigitAdd = Handled.make("add", {
  verbose: Options.boolean("verbose").pipe(Options.withAlias("v"))
}, ({ verbose }) => Console.log(`Running 'minigit add' with '--verbose ${verbose}'`))

// minigit clone [--depth <depth>] [--] <repository> [<directory>]
const minigitClone = Handled.make("clone", {
  repository: Args.text({ name: "repository" }),
  directory: Args.directory().pipe(Args.optional),
  depth: Options.integer("depth").pipe(Options.optional)
}, ({ depth, directory, repository }) => {
  const optionsAndArgs = pipe(
    ReadonlyArray.compact([
      Option.map(depth, (depth) => `--depth ${depth}`),
      Option.some(repository),
      directory
    ]),
    ReadonlyArray.join(", ")
  )
  return Console.log(
    `Running 'minigit clone' with the following options and arguments: '${optionsAndArgs}'`
  )
})

const finalCommand = minigit.pipe(Handled.withSubcommands([minigitAdd, minigitClone]))

// =============================================================================
// Application
// =============================================================================

const run = Handled.toAppAndRun(finalCommand, {
  name: "MiniGit Distributed Version Control",
  version: "v2.42.1"
})

Effect.suspend(() => run(process.argv.slice(2))).pipe(
  Effect.provide(NodeContext.layer),
  Runtime.runMain
)
