import { Args, CliApp, Command, Options } from "@effect/cli"
import * as Handled from "@effect/cli/HandledCommand"
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
const nameAndCoordinatesArg = Args.all({ name: nameArg, x: xArg, y: yArg })
const coordinatesArg = Args.all({ x: xArg, y: yArg })

const mooredOption = Options.boolean("moored").pipe(
  Options.withDescription("Whether the mine is moored (anchored) or drifting")
)
const speedOption = Options.integer("speed").pipe(
  Options.withDescription("Speed in knots"),
  Options.withDefault(10)
)

const newShipCommand = Command.make("new", {
  args: nameArg
}).pipe(
  Handled.make("new", ({ args: name }) =>
    createShip(name).pipe(
      Effect.zipRight(Console.log(`Created ship: '${name}'`))
    ))
)

const moveShipCommand = Command.make("move", {
  args: nameAndCoordinatesArg,
  options: speedOption
}).pipe(
  Handled.make("move", ({ args: { name, x, y }, options: speed }) =>
    moveShip(name, x, y).pipe(
      Effect.zipRight(
        Console.log(`Moving ship '${name}' to coordinates (${x}, ${y}) at ${speed} knots`)
      )
    ))
)

const shootShipCommand = Command.make("shoot", {
  args: coordinatesArg
}).pipe(
  Handled.make("shoot", ({ args: { x, y } }) =>
    shoot(x, y).pipe(
      Effect.zipRight(Console.log(`Shot cannons at coordinates (${x}, ${y})`))
    ))
)

const shipCommand = Command.make("ship").pipe(
  Handled.makeUnit("ship"),
  Handled.withSubcommands([
    newShipCommand,
    moveShipCommand,
    shootShipCommand
  ])
)

const setMineCommand = Command.make("set", {
  args: coordinatesArg,
  options: mooredOption
}).pipe(
  Handled.make("set", ({ args: { x, y }, options: moored }) =>
    setMine(x, y).pipe(
      Effect.zipRight(
        Console.log(`Set ${moored ? "moored" : "drifting"} mine at coordinates (${x}, ${y})`)
      )
    ))
)

const removeMineCommand = Command.make("remove", {
  args: coordinatesArg
}).pipe(
  Handled.make("remove", ({ args: { x, y } }) =>
    removeMine(x, y).pipe(
      Effect.zipRight(Console.log(`Removing mine at coordinates (${x}, ${y}), if present`))
    ))
)

const mineCommand = Command.make("mine").pipe(
  Handled.makeUnit("mine"),
  Handled.withSubcommands([
    setMineCommand,
    removeMineCommand
  ])
)

const navalFate = Command.make("naval_fate").pipe(
  Command.withDescription("An implementation of the Naval Fate CLI application."),
  Handled.makeUnit("naval_fate"),
  Handled.withSubcommands([shipCommand, mineCommand])
)

const navalFateApp = CliApp.make({
  name: "Naval Fate",
  version: "1.0.0",
  command: navalFate.command
})

const main = Effect.sync(() => globalThis.process.argv.slice(2)).pipe(
  Effect.flatMap((argv) =>
    CliApp.run(
      navalFateApp,
      argv,
      navalFate.handler
    )
  )
)

const MainLayer = NavalFateStore.layer.pipe(
  Layer.use(KeyValueStore.layerFileSystem("naval-fate-store")),
  Layer.merge(NodeContext.layer)
)

main.pipe(
  Effect.provide(MainLayer),
  Effect.tapErrorCause(Effect.logError),
  Runtime.runMain
)
