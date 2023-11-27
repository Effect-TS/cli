import { Args, CliApp, Command, Options, ValidationError } from "@effect/cli"
import * as KeyValueStore from "@effect/platform-node/KeyValueStore"
import * as NodeContext from "@effect/platform-node/NodeContext"
import * as Runtime from "@effect/platform-node/Runtime"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import type { MineSubcommand, ShipSubcommand } from "./naval-fate/domain.js"
import {
  MineCommand,
  MoveShipCommand,
  NewShipCommand,
  RemoveMineCommand,
  SetMineCommand,
  ShipCommand,
  ShootShipCommand
} from "./naval-fate/domain.js"
import * as NavalFateStore from "./naval-fate/store.js"

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
}).pipe(Command.map(({ args }) => new NewShipCommand({ name: args })))

const moveShipCommand = Command.make("move", {
  args: nameAndCoordinatesArg,
  options: speedOption
}).pipe(Command.map(({ args, options }) => new MoveShipCommand({ ...args, speed: options })))

const shootShipCommand = Command.make("shoot", {
  args: coordinatesArg
}).pipe(Command.map(({ args }) => new ShootShipCommand(args)))

const shipCommand = Command.make("ship").pipe(
  Command.withSubcommands([
    newShipCommand,
    moveShipCommand,
    shootShipCommand
  ]),
  Command.map(({ subcommand }) => new ShipCommand({ subcommand }))
)

const setMineCommand = Command.make("set", {
  args: coordinatesArg,
  options: mooredOption
}).pipe(Command.map(({ args, options }) => new SetMineCommand({ ...args, moored: options })))

const removeMineCommand = Command.make("remove", {
  args: coordinatesArg
}).pipe(Command.map(({ args }) => new RemoveMineCommand(args)))

const mineCommand = Command.make("mine").pipe(
  Command.withSubcommands([
    setMineCommand,
    removeMineCommand
  ]),
  Command.map(({ subcommand }) => new MineCommand({ subcommand }))
)

const navalFate = Command.make("naval_fate").pipe(
  Command.withSubcommands([shipCommand, mineCommand]),
  Command.withDescription("An implementation of the Naval Fate CLI application.")
)

const navalFateApp = CliApp.make({
  name: "Naval Fate",
  version: "1.0.0",
  command: navalFate
})

const handleSubcommand = (command: ShipCommand | MineCommand) => {
  switch (command._tag) {
    case "ShipCommand": {
      return Option.match(command.subcommand, {
        onNone: () => Effect.fail(ValidationError.helpRequested(shipCommand)),
        onSome: (subcommand) => handleShipSubcommand(subcommand)
      })
    }
    case "MineCommand": {
      return Option.match(command.subcommand, {
        onNone: () => Effect.fail(ValidationError.helpRequested(mineCommand)),
        onSome: (subcommand) => handleMineSubcommand(subcommand)
      })
    }
  }
}

const handleShipSubcommand = (command: ShipSubcommand) =>
  Effect.gen(function*($) {
    const store = yield* $(NavalFateStore.NavalFateStore)
    switch (command._tag) {
      case "NewShipCommand": {
        const { name } = command
        yield* $(store.createShip(name))
        yield* $(Console.log(`Created ship: '${name}'`))
        break
      }
      case "MoveShipCommand": {
        const { name, speed, x, y } = command
        yield* $(store.moveShip(name, x, y))
        yield* $(Console.log(`Moving ship '${name}' to coordinates (${x}, ${y}) at ${speed} knots`))
        break
      }
      case "ShootShipCommand": {
        const { x, y } = command
        yield* $(store.shoot(x, y))
        yield* $(Console.log(`Shot cannons at coordinates (${x}, ${y})`))
        break
      }
    }
  })

const handleMineSubcommand = (command: MineSubcommand) =>
  Effect.gen(function*($) {
    const store = yield* $(NavalFateStore.NavalFateStore)
    switch (command._tag) {
      case "SetMineCommand": {
        const { moored, x, y } = command
        const mineType = moored ? "moored" : "drifting"
        yield* $(store.setMine(x, y))
        yield* $(Console.log(`Set ${mineType} mine at coordinates (${x}, ${y})`))
        break
      }
      case "RemoveMineCommand": {
        const { x, y } = command
        yield* $(store.removeMine(x, y))
        yield* $(Console.log(`Removing mine at coordinates (${x}, ${y}), if present`))
        break
      }
    }
  })

const main = Effect.sync(() => globalThis.process.argv.slice(2)).pipe(
  Effect.flatMap((argv) =>
    CliApp.run(
      navalFateApp,
      argv,
      Effect.unifiedFn((args) =>
        Option.match(args.subcommand, {
          onNone: () => Effect.fail(ValidationError.helpRequested(navalFate)),
          onSome: (subcommand) => handleSubcommand(subcommand)
        })
      )
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
