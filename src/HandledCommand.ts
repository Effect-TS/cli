/**
 * @since 1.0.0
 */
import * as Effect from "effect/Effect"
import { dual } from "effect/Function"
import type * as Option from "effect/Option"
import { type Pipeable, pipeArguments } from "effect/Pipeable"
import * as ReadonlyArray from "effect/ReadonlyArray"
import * as CliApp from "./CliApp.js"
import * as Command from "./Command.js"
import type { HelpDoc } from "./HelpDoc.js"
import type { Span } from "./HelpDoc/Span.js"
import type { ValidationError } from "./ValidationError.js"

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
export interface HandledCommand<A, R, E> extends Pipeable {
  readonly [TypeId]: TypeId
  readonly command: Command.Command<A>
  readonly handler: (_: A) => Effect.Effect<R, E, void>
}

const Prototype = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments)
  }
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const fromCommand = dual<
  <A extends { readonly name: string }, R, E>(
    handler: (_: A) => Effect.Effect<R, E, void>
  ) => (command: Command.Command<A>) => HandledCommand<A, R, E>,
  <A extends { readonly name: string }, R, E>(
    command: Command.Command<A>,
    handler: (_: A) => Effect.Effect<R, E, void>
  ) => HandledCommand<A, R, E>
>(2, (command, handler) => {
  const self = Object.create(Prototype)
  self.command = command
  self.handler = handler
  return self
})

/**
 * @since 1.0.0
 * @category constructors
 */
export const fromCommandUnit = <A extends { readonly name: string }>(
  command: Command.Command<A>
): HandledCommand<A, never, never> => fromCommand(command, (_) => Effect.unit)

/**
 * @since 1.0.0
 * @category constructors
 */
export const fromCommandOrDie = <A extends { readonly name: string }>(
  command: Command.Command<A>,
  orDie: () => unknown
): HandledCommand<A, never, never> => fromCommand(command, (_) => Effect.dieSync(orDie))

/**
 * @since 1.0.0
 * @category constructors
 */
export const make = <Name extends string, R, E, OptionsType = void, ArgsType = void>(
  name: Name,
  config: Command.Command.ConstructorConfig<OptionsType, ArgsType>,
  handler: (
    _: { readonly name: Name; readonly options: OptionsType; readonly args: ArgsType }
  ) => Effect.Effect<R, E, void>
): HandledCommand<
  { readonly name: Name; readonly options: OptionsType; readonly args: ArgsType },
  R,
  E
> => fromCommand(Command.make(name, config), handler)

/**
 * @since 1.0.0
 * @category constructors
 */
export const makeUnit = <Name extends string, OptionsType = void, ArgsType = void>(
  name: Name,
  config?: Command.Command.ConstructorConfig<OptionsType, ArgsType>
): HandledCommand<
  { readonly name: Name; readonly options: OptionsType; readonly args: ArgsType },
  never,
  never
> => fromCommandUnit(Command.make(name, config))

/**
 * @since 1.0.0
 * @category constructors
 */
export const makeOrDie = <Name extends string, OptionsType = void, ArgsType = void>(
  name: Name,
  config: Command.Command.ConstructorConfig<OptionsType, ArgsType>,
  orDie: () => unknown
): HandledCommand<
  { readonly name: Name; readonly options: OptionsType; readonly args: ArgsType },
  never,
  never
> => fromCommandOrDie(Command.make(name, config), orDie)

/**
 * @since 1.0.0
 * @category combinators
 */
export const withSubcommands = dual<
  <Subcommand extends ReadonlyArray.NonEmptyReadonlyArray<HandledCommand<any, any, any>>>(
    subcommands: Subcommand
  ) => <A, R, E>(self: HandledCommand<A, R, E>) => HandledCommand<
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
    A,
    R,
    E,
    Subcommand extends ReadonlyArray.NonEmptyReadonlyArray<HandledCommand<any, any, any>>
  >(
    self: HandledCommand<A, R, E>,
    subcommands: Subcommand
  ) => HandledCommand<
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
      for (const name of Command.getNames(subcommand.command)) {
        handlers[name] = subcommand.handler
      }
      return handlers
    }
  )
  const handler = (
    args: {
      readonly name: string
      readonly subcommand: Option.Option<{ readonly name: string }>
    }
  ) => {
    if (args.subcommand._tag === "Some") {
      return handlers[args.subcommand.value.name](args.subcommand.value)
    }
    return self.handler(args as any)
  }
  return fromCommand(command as any, handler) as any
})

/**
 * @since 1.0.0
 * @category combinators
 */
export const toAppAndRun = dual<
  (config: {
    readonly name: string
    readonly version: string
    readonly summary?: Span | undefined
    readonly footer?: HelpDoc | undefined
  }) => <A, R, E>(
    self: HandledCommand<A, R, E>
  ) => (
    args: ReadonlyArray<string>
  ) => Effect.Effect<R | CliApp.CliApp.Environment, E | ValidationError, void>,
  <A, R, E>(self: HandledCommand<A, R, E>, config: {
    readonly name: string
    readonly version: string
    readonly summary?: Span | undefined
    readonly footer?: HelpDoc | undefined
  }) => (
    args: ReadonlyArray<string>
  ) => Effect.Effect<R | CliApp.CliApp.Environment, E | ValidationError, void>
>(2, (self, config) => {
  const app = CliApp.make({
    ...config,
    command: self.command
  })
  return (args) => CliApp.run(app, args, self.handler)
})
