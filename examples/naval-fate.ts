import { Args, Command, HandledCommand, Options } from "@effect/cli"
import * as KeyValueStore from "@effect/platform-node/KeyValueStore"
import * as NodeContext from "@effect/platform-node/NodeContext"
import * as Runtime from "@effect/platform-node/Runtime"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as NavalFateStore from "./naval-fate/store.js"

const { createShip, moveShip, removeMine, setMine, shoot } = Effect.serviceFunctions(
  NavalFateStore.NavalFateStore
)

// naval_fate [-h | --help] [--version]
// naval_fate ship new <name>...
// naval_fate ship move [--speed=<kn>] <name> <x> <y>
// naval_fate ship shoot <x> <y>
// naval_fate mine set <x> <y> [--moored]
// naval_fate mine remove <x> <y> [--moored]

const nameArg = Args.text({ name: "name" })
const xArg = Args.integer({ name: "x" })
const yArg = Args.integer({ name: "y" })
const coordinatesArg = { x: xArg, y: yArg }
const nameAndCoordinatesArg = { name: nameArg, ...coordinatesArg }

const mooredOption = Options.boolean("moored").pipe(
  Options.withDescription("Whether the mine is moored (anchored) or drifting")
)
const speedOption = Options.integer("speed").pipe(
  Options.withDescription("Speed in knots"),
  Options.withDefault(10)
)

const shipCommandParent = HandledCommand.makeRequestHelp("ship", {
  verbose: Options.withDefault(Options.boolean("verbose"), false)
})

const newShipCommand = HandledCommand.make("new", {
  name: nameArg
}, ({ name }) =>
  Effect.gen(function*(_) {
    const { verbose } = yield* _(shipCommandParent)
    yield* _(createShip(name))
    yield* _(Console.log(`Created ship: '${name}'`))
    if (verbose) {
      yield* _(Console.log(`Verbose mode enabled`))
    }
  }))

const moveShipCommand = HandledCommand.make("move", {
  ...nameAndCoordinatesArg,
  speed: speedOption
}, ({ name, speed, x, y }) =>
  Effect.gen(function*(_) {
    yield* _(moveShip(name, x, y))
    yield* _(Console.log(`Moving ship '${name}' to coordinates (${x}, ${y}) at ${speed} knots`))
  }))

const shootShipCommand = HandledCommand.make(
  "shoot",
  { ...coordinatesArg },
  ({ x, y }) =>
    Effect.gen(function*(_) {
      yield* _(shoot(x, y))
      yield* _(Console.log(`Shot cannons at coordinates (${x}, ${y})`))
    })
)

const shipCommand = HandledCommand.withSubcommands(shipCommandParent, [
  newShipCommand,
  moveShipCommand,
  shootShipCommand
])

const mineCommandParent = HandledCommand.makeRequestHelp("mine")

const setMineCommand = HandledCommand.make("set", {
  ...coordinatesArg,
  moored: mooredOption
}, ({ moored, x, y }) =>
  Effect.gen(function*(_) {
    yield* _(setMine(x, y))
    yield* _(
      Console.log(`Set ${moored ? "moored" : "drifting"} mine at coordinates (${x}, ${y})`)
    )
  }))

const removeMineCommand = HandledCommand.make("remove", {
  ...coordinatesArg
}, ({ x, y }) =>
  Effect.gen(function*(_) {
    yield* _(removeMine(x, y))
    yield* _(Console.log(`Removing mine at coordinates (${x}, ${y}), if present`))
  }))

const mineCommand = HandledCommand.withSubcommands(mineCommandParent, [
  setMineCommand,
  removeMineCommand
])

const run = Command.make("naval_fate").pipe(
  Command.withDescription("An implementation of the Naval Fate CLI application."),
  HandledCommand.fromCommandUnit,
  HandledCommand.withSubcommands([shipCommand, mineCommand]),
  HandledCommand.toAppAndRun({
    name: "Naval Fate",
    version: "1.0.0"
  })
)

const main = Effect.suspend(() => run(globalThis.process.argv.slice(2)))

const MainLayer = NavalFateStore.layer.pipe(
  Layer.use(KeyValueStore.layerFileSystem("naval-fate-store")),
  Layer.merge(NodeContext.layer)
)

main.pipe(
  Effect.provide(MainLayer),
  Effect.tapErrorCause(Effect.logError),
  Runtime.runMain
)
