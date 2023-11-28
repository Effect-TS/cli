/**
 * @since 1.0.0
 */
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Effectable from "effect/Effectable"
import { dual } from "effect/Function"
import { globalValue } from "effect/GlobalValue"
import type * as Option from "effect/Option"
import { type Pipeable, pipeArguments } from "effect/Pipeable"
import * as Predicate from "effect/Predicate"
import * as ReadonlyArray from "effect/ReadonlyArray"
import type * as Types from "effect/Types"
import * as Args from "./Args.js"
import * as CliApp from "./CliApp.js"
import * as Command from "./Command.js"
import type { HelpDoc } from "./HelpDoc.js"
import type { Span } from "./HelpDoc/Span.js"
import * as Options from "./Options.js"
import * as ValidationError from "./ValidationError.js"

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
export interface HandledCommand<Name extends string, A, R, E>
  extends Pipeable, Effect.Effect<Command.Command<Name>, never, A>
{
  readonly [TypeId]: TypeId
  readonly command: Command.Command<A>
  readonly handler: (_: A) => Effect.Effect<R, E, void>
  readonly tag: Context.Tag<Command.Command<Name>, A>
}

/**
 * @since 1.0.0
 * @category models
 */
export declare namespace HandledCommand {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface ConfigBase {
    readonly [key: string]:
      | Args.Args<any>
      | Options.Options<any>
      | ReadonlyArray<Args.Args<any> | Options.Options<any> | ConfigBase>
      | ConfigBase
  }

  /**
   * @since 1.0.0
   * @category models
   */
  export type ParseConfig<A extends ConfigBase> = Types.Simplify<
    { readonly [Key in keyof A]: ParseConfigValue<A[Key]> }
  >

  type ParseConfigValue<A> = A extends ReadonlyArray<infer _> ?
    { readonly [Key in keyof A]: ParseConfigValue<A[Key]> } :
    A extends Args.Args<infer Value> ? Value
    : A extends Options.Options<infer Value> ? Value
    : A extends ConfigBase ? ParseConfig<A>
    : never

  interface ParsedConfigTree {
    [key: string]: ParsedConfigNode
  }

  type ParsedConfigNode = {
    readonly _tag: "Args"
    readonly index: number
  } | {
    readonly _tag: "Options"
    readonly index: number
  } | {
    readonly _tag: "Array"
    readonly children: ReadonlyArray<ParsedConfigNode>
  } | {
    readonly _tag: "ParsedConfig"
    readonly tree: ParsedConfigTree
  }

  /**
   * @since 1.0.0
   * @category models
   */
  export interface ParsedConfig {
    readonly args: ReadonlyArray<Args.Args<any>>
    readonly options: ReadonlyArray<Options.Options<any>>
    readonly tree: ParsedConfigTree
  }
}

const parseConfig = (config: HandledCommand.ConfigBase): HandledCommand.ParsedConfig => {
  const args: Array<Args.Args<any>> = []
  let argsIndex = 0
  const options: Array<Options.Options<any>> = []
  let optionsIndex = 0
  const tree: HandledCommand.ParsedConfigTree = {}

  function parse(config: HandledCommand.ConfigBase) {
    for (const key in config) {
      tree[key] = parseValue(config[key])
    }
    return tree
  }

  function parseValue(
    value:
      | Args.Args<any>
      | Options.Options<any>
      | ReadonlyArray<Args.Args<any> | Options.Options<any> | HandledCommand.ConfigBase>
      | HandledCommand.ConfigBase
  ): HandledCommand.ParsedConfigNode {
    if (Array.isArray(value)) {
      return {
        _tag: "Array",
        children: ReadonlyArray.map(value, parseValue)
      }
    } else if (Args.isArgs(value)) {
      args.push(value)
      return {
        _tag: "Args",
        index: argsIndex++
      }
    } else if (Options.isOptions(value)) {
      options.push(value)
      return {
        _tag: "Options",
        index: optionsIndex++
      }
    } else {
      return {
        _tag: "ParsedConfig",
        tree: parse(value as any)
      }
    }
  }

  return {
    args,
    options,
    tree: parse(config)
  }
}

const reconstructConfigTree = (
  tree: HandledCommand.ParsedConfigTree,
  args: ReadonlyArray<any>,
  options: ReadonlyArray<any>
): Record<string, any> => {
  const output: Record<string, any> = {}

  for (const key in tree) {
    output[key] = nodeValue(tree[key])
  }

  return output

  function nodeValue(node: HandledCommand.ParsedConfigNode): any {
    if (node._tag === "Args") {
      return args[node.index]
    } else if (node._tag === "Options") {
      return options[node.index]
    } else if (node._tag === "Array") {
      return ReadonlyArray.map(node.children, nodeValue)
    } else {
      return reconstructConfigTree(node.tree, args, options)
    }
  }
}

const Prototype = {
  ...Effectable.CommitPrototype,
  [TypeId]: TypeId,
  commit(this: HandledCommand<string, any, any, any>) {
    return this.tag
  },
  pipe() {
    return pipeArguments(this, arguments)
  }
}

const modifiedCommands = globalValue(
  "@effect/cli/HandledCommand/modifiedCommands",
  () => new WeakMap<Context.Tag<any, any>, Command.Command<any>>()
)

const getCommand = <Name extends string, A, R, E>(self: HandledCommand<Name, A, R, E>) =>
  modifiedCommands.get(self.tag) ?? self.command

const HandledCommand = <Name extends string, A, R, E>(
  command: Command.Command<A>,
  handler: (_: A) => Effect.Effect<R, E, void>,
  tag?: Context.Tag<any, any>
): HandledCommand<Name, A, R, E> => {
  const self = Object.create(Prototype)
  self.command = Command.map(command, (args) =>
    Predicate.hasProperty(args, TypeId) ?
      args :
      new Proxy(args as any, {
        get(target, p, _receiver) {
          if (p === TypeId) {
            return self.tag
          }
          return target[p as any]
        },
        has(target, p) {
          return p === TypeId || p in target
        }
      }))
  self.handler = handler
  self.tag = tag ?? Context.Tag()
  modifiedCommands.set(self.tag, self.command)
  return self
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const fromCommand = dual<
  <A extends { readonly name: string }, R, E>(
    handler: (_: A) => Effect.Effect<R, E, void>
  ) => (command: Command.Command<A>) => HandledCommand<A["name"], A, R, E>,
  <A extends { readonly name: string }, R, E>(
    command: Command.Command<A>,
    handler: (_: A) => Effect.Effect<R, E, void>
  ) => HandledCommand<A["name"], A, R, E>
>(2, (command, handler) => HandledCommand(command, handler))

/**
 * @since 1.0.0
 * @category constructors
 */
export const fromCommandUnit = <A extends { readonly name: string }>(
  command: Command.Command<A>
): HandledCommand<A["name"], A, never, never> => HandledCommand(command, (_) => Effect.unit)

/**
 * @since 1.0.0
 * @category constructors
 */
export const fromCommandHelp = <A extends { readonly name: string }>(
  command: Command.Command<A>
): HandledCommand<A["name"], A, never, ValidationError.ValidationError> => {
  const self: HandledCommand<A["name"], A, never, ValidationError.ValidationError> = HandledCommand(
    command,
    (_) => Effect.fail(ValidationError.helpRequested(getCommand(self)))
  )
  return self
}

const makeCommand = <const Config extends HandledCommand.ConfigBase>(
  name: string,
  config: Config
): Command.Command<Types.Simplify<HandledCommand.ParseConfig<Config>>> => {
  const { args, options, tree } = parseConfig(config)
  return Command.map(
    Command.make(name, {
      args: Args.all(args),
      options: Options.all(options)
    }),
    ({ args, options }) => reconstructConfigTree(tree, args, options)
  ) as any
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const make = <Name extends string, const Config extends HandledCommand.ConfigBase, R, E>(
  name: Name,
  config: Config,
  handler: (_: Types.Simplify<HandledCommand.ParseConfig<Config>>) => Effect.Effect<R, E, void>
): HandledCommand<
  Name,
  Types.Simplify<HandledCommand.ParseConfig<Config>>,
  R,
  E
> => HandledCommand(makeCommand(name, config), handler)

/**
 * @since 1.0.0
 * @category constructors
 */
export const makeUnit: {
  <Name extends string>(
    name: Name
  ): HandledCommand<Name, {}, never, never>
  <Name extends string, const Config extends HandledCommand.ConfigBase>(
    name: Name,
    config: Config
  ): HandledCommand<
    Name,
    Types.Simplify<HandledCommand.ParseConfig<Config>>,
    never,
    never
  >
} = (name: string, config = {}) => fromCommandUnit(makeCommand(name, config) as any) as any

/**
 * @since 1.0.0
 * @category constructors
 */
export const makeHelp: {
  <Name extends string>(
    name: Name
  ): HandledCommand<Name, {}, never, ValidationError.ValidationError>
  <Name extends string, const Config extends HandledCommand.ConfigBase>(
    name: Name,
    config: Config
  ): HandledCommand<
    Name,
    Types.Simplify<HandledCommand.ParseConfig<Config>>,
    never,
    ValidationError.ValidationError
  >
} = (name: string, config = {}) => fromCommandHelp(makeCommand(name, config) as any) as any

/**
 * @since 1.0.0
 * @category combinators
 */
export const withSubcommands = dual<
  <Subcommand extends ReadonlyArray.NonEmptyReadonlyArray<HandledCommand<any, any, any, any>>>(
    subcommands: Subcommand
  ) => <Name extends string, A, R, E>(self: HandledCommand<Name, A, R, E>) => HandledCommand<
    Name,
    Command.Command.ComputeParsedType<
      & A
      & Readonly<
        { subcommand: Option.Option<Command.Command.GetParsedType<Subcommand[number]["command"]>> }
      >
    >,
    | R
    | Exclude<
      Effect.Effect.Context<ReturnType<Subcommand[number]["handler"]>>,
      Command.Command<Name>
    >,
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
    | R
    | Exclude<
      Effect.Effect.Context<ReturnType<Subcommand[number]["handler"]>>,
      Command.Command<Name>
    >,
    E | Effect.Effect.Error<ReturnType<Subcommand[number]["handler"]>>
  >
>(2, (self, subcommands) => {
  const command = Command.withSubcommands(
    self.command,
    ReadonlyArray.map(subcommands, (_) => _.command)
  )
  const handlers = ReadonlyArray.reduce(
    subcommands,
    new Map<Context.Tag<any, any>, (_: any) => Effect.Effect<any, any, void>>(),
    (handlers, subcommand) => {
      handlers.set(subcommand.tag, subcommand.handler)
      return handlers
    }
  )
  function handler(
    args: {
      readonly name: string
      readonly subcommand: Option.Option<{ readonly name: string }>
    }
  ) {
    if (args.subcommand._tag === "Some" && TypeId in args.subcommand.value) {
      return Effect.provideService(
        handlers.get(args.subcommand.value[TypeId] as any)!(args.subcommand.value),
        self.tag,
        args as any
      )
    }
    return self.handler(args as any)
  }
  return HandledCommand(command as any, handler, self.tag) as any
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
  }) => <Name extends string, A, R, E>(
    self: HandledCommand<Name, A, R, E>
  ) => (
    args: ReadonlyArray<string>
  ) => Effect.Effect<R | CliApp.CliApp.Environment, E | ValidationError.ValidationError, void>,
  <Name extends string, A, R, E>(self: HandledCommand<Name, A, R, E>, config: {
    readonly name: string
    readonly version: string
    readonly summary?: Span | undefined
    readonly footer?: HelpDoc | undefined
  }) => (
    args: ReadonlyArray<string>
  ) => Effect.Effect<R | CliApp.CliApp.Environment, E | ValidationError.ValidationError, void>
>(2, (self, config) => {
  const app = CliApp.make({
    ...config,
    command: self.command
  })
  return (args) => CliApp.run(app, args, self.handler)
})
