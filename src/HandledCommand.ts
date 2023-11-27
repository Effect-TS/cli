/**
 * @since 1.0.0
 */
import * as Effect from "effect/Effect"
import { dual } from "effect/Function"
import type * as Option from "effect/Option"
import type { Pipeable } from "effect/Pipeable"
import ReadonlyArray from "effect/ReadonlyArray"
import * as Command from "./Command.js"

/**
 * @since 1.0.0
 * @category type ids
 */
export const TypeId = Symbol.for("@effect/cli/HandledCommand")

/**
 * @since 1.0.0
 * @category type ids
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface HandledCommand<Name extends string, A, R, E> extends Pipeable {
  readonly [TypeId]: TypeId
  readonly name: Name
  readonly command: Command.Command<A>
  readonly handler: (_: A) => Effect.Effect<R, E, void>
}

const Prototype = {
  [TypeId]: TypeId
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const make = dual<
  <Name extends string, A, R, E>(
    name: Name,
    handler: (_: A) => Effect.Effect<R, E, void>
  ) => (
    command: Command.Command<{ readonly name: Name } & A>
  ) => HandledCommand<Name, A, R, E>,
  <Name extends string, A, R, E>(
    command: Command.Command<{ readonly name: Name } & A>,
    name: Name,
    handler: (_: A) => Effect.Effect<R, E, void>
  ) => HandledCommand<Name, "name", R, E>
>(3, (command, name, handler) => {
  const self = Object.create(Prototype)
  self.name = name
  self.command = command
  self.handler = handler
  return self
})

/**
 * @since 1.0.0
 * @category constructors
 */
export const makeUnit = dual<
  <Name extends string, A>(
    name: Name
  ) => (
    command: Command.Command<{ readonly name: Name } & A>
  ) => HandledCommand<Name, A, never, never>,
  <Name extends string, A>(
    command: Command.Command<{ readonly name: Name } & A>,
    name: Name
  ) => HandledCommand<Name, A, never, never>
>(2, (command, name) => make(command, name, (_) => Effect.unit) as any)

/**
 * @since 1.0.0
 * @category combinators
 */
export const withSubcommands = dual<
  <
    Subcommand extends ReadonlyArray.NonEmptyReadonlyArray<HandledCommand<any, any, any, any>>
  >(
    subcommands: Subcommand
  ) => <Name extends string, A, R, E>(self: HandledCommand<Name, A, R, E>) => HandledCommand<
    Name,
    Command.Command.ComputeParsedType<
      & A
      & Readonly<
        { subcommand: Option.Option<Command.Command.GetParsedType<Subcommand[number]["command"]>> }
      >
    >,
    R | Effect.Effect.Context<ReturnType<Subcommand[number]["handler"]>>,
    E | Effect.Effect.Error<ReturnType<Subcommand[number]["handler"]>>
  >,
  <
    Name extends string,
    A,
    R,
    E,
    Subcommand extends ReadonlyArray.NonEmptyReadonlyArray<HandledCommand<any, any, any, any>>
  >(
    self: HandledCommand<Name, A, R, E>,
    subcommands: Subcommand
  ) => HandledCommand<
    Name,
    Command.Command.ComputeParsedType<
      & A
      & Readonly<
        { subcommand: Option.Option<Command.Command.GetParsedType<Subcommand[number]["command"]>> }
      >
    >,
    R | Effect.Effect.Context<ReturnType<Subcommand[number]["handler"]>>,
    E | Effect.Effect.Error<ReturnType<Subcommand[number]["handler"]>>
  >
>(2, (self, subcommands) => {
  const command = Command.withSubcommands(
    self.command,
    ReadonlyArray.map(subcommands, (_) => _.command)
  )
  const handlers = ReadonlyArray.reduce(
    subcommands,
    {} as Record<string, (_: any) => Effect.Effect<any, any, void>>,
    (handlers, subcommand) => {
      handlers[subcommand.name] = subcommand.handler
      return handlers
    }
  )
  const handler = (
    args: { readonly subcommand: Option.Option<{ readonly name: string }> }
  ) => {
    if (args.subcommand._tag === "Some") {
      return handlers[args.subcommand.value.name](args.subcommand.value)
    }
    return self.handler(args as any)
  }
  return make(command as any, self.name, handler) as any
})
