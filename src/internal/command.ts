import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Effectable from "effect/Effectable"
import { dual } from "effect/Function"
import { globalValue } from "effect/GlobalValue"
import type * as Option from "effect/Option"
import { pipeArguments } from "effect/Pipeable"
import * as ReadonlyArray from "effect/ReadonlyArray"
import type * as Types from "effect/Types"
import type * as Args from "../Args.js"
import type * as CliApp from "../CliApp.js"
import type * as Command from "../Command.js"
import type * as Descriptor from "../CommandDescriptor.js"
import type { HelpDoc } from "../HelpDoc.js"
import type { Span } from "../HelpDoc/Span.js"
import type * as Options from "../Options.js"
import type * as Prompt from "../Prompt.js"
import * as ValidationError from "../ValidationError.js"
import * as InternalArgs from "./args.js"
import * as InternalCliApp from "./cliApp.js"
import * as InternalDescriptor from "./commandDescriptor.js"
import * as InternalOptions from "./options.js"

const CommandSymbolKey = "@effect/cli/Command"

/** @internal */
export const TypeId: Command.TypeId = Symbol.for(
  CommandSymbolKey
) as Command.TypeId

const parseConfig = (config: Command.Command.ConfigBase): Command.Command.ParsedConfig => {
  const args: Array<Args.Args<any>> = []
  let argsIndex = 0
  const options: Array<Options.Options<any>> = []
  let optionsIndex = 0
  const tree: Command.Command.ParsedConfigTree = {}

  function parse(config: Command.Command.ConfigBase) {
    for (const key in config) {
      tree[key] = parseValue(config[key])
    }
    return tree
  }

  function parseValue(
    value:
      | Args.Args<any>
      | Options.Options<any>
      | ReadonlyArray<Args.Args<any> | Options.Options<any> | Command.Command.ConfigBase>
      | Command.Command.ConfigBase
  ): Command.Command.ParsedConfigNode {
    if (Array.isArray(value)) {
      return {
        _tag: "Array",
        children: ReadonlyArray.map(value, parseValue)
      }
    } else if (InternalArgs.isArgs(value)) {
      args.push(value)
      return {
        _tag: "Args",
        index: argsIndex++
      }
    } else if (InternalOptions.isOptions(value)) {
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
  tree: Command.Command.ParsedConfigTree,
  args: ReadonlyArray<any>,
  options: ReadonlyArray<any>
): Record<string, any> => {
  const output: Record<string, any> = {}

  for (const key in tree) {
    output[key] = nodeValue(tree[key])
  }

  return output

  function nodeValue(node: Command.Command.ParsedConfigNode): any {
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
  commit(this: Command.Command<string, any, any, any>) {
    return this.tag
  },
  pipe() {
    return pipeArguments(this, arguments)
  }
}

const modifiedCommands = globalValue(
  "@effect/cli/Command/modifiedCommands",
  () => new WeakMap<Context.Tag<any, any>, Descriptor.Command<any>>()
)

const getDescriptor = <Name extends string, R, E, A>(self: Command.Command<Name, R, E, A>) =>
  modifiedCommands.get(self.tag) ?? self.descriptor

const makeProto = <Name extends string, R, E, A>(
  descriptor: Descriptor.Command<A>,
  handler: (_: A) => Effect.Effect<R, E, void>,
  tag?: Context.Tag<any, any>
): Command.Command<Name, R, E, A> => {
  const self = Object.create(Prototype)
  self.descriptor = descriptor
  self.handler = handler
  self.tag = tag ?? Context.Tag()
  modifiedCommands.set(self.tag, self.descriptor)
  return self
}

/** @internal */
export const fromDescriptor = dual<
  <A extends { readonly name: string }, R, E>(
    handler: (_: A) => Effect.Effect<R, E, void>
  ) => (command: Descriptor.Command<A>) => Command.Command<A["name"], R, E, A>,
  <A extends { readonly name: string }, R, E>(
    descriptor: Descriptor.Command<A>,
    handler: (_: A) => Effect.Effect<R, E, void>
  ) => Command.Command<A["name"], R, E, A>
>(2, (descriptor, handler) => makeProto(descriptor, handler))

/** @internal */
export const fromDescriptorUnit = <A extends { readonly name: string }>(
  descriptor: Descriptor.Command<A>
): Command.Command<A["name"], never, never, A> => makeProto(descriptor, (_) => Effect.unit)

/** @internal */
export const fromDescriptorHelp = <A extends { readonly name: string }>(
  descriptor: Descriptor.Command<A>
): Command.Command<A["name"], never, ValidationError.ValidationError, A> => {
  const self: Command.Command<A["name"], never, ValidationError.ValidationError, A> = makeProto(
    descriptor,
    (_) => Effect.fail(ValidationError.helpRequested(getDescriptor(self)))
  )
  return self
}

const makeDescriptor = <const Config extends Command.Command.ConfigBase>(
  name: string,
  config: Config
): Descriptor.Command<Types.Simplify<Command.Command.ParseConfig<Config>>> => {
  const { args, options, tree } = parseConfig(config)
  return InternalDescriptor.map(
    InternalDescriptor.make(name, InternalOptions.all(options), InternalArgs.all(args)),
    ({ args, options }) => reconstructConfigTree(tree, args, options)
  ) as any
}

/** @internal */
export const make = <Name extends string, const Config extends Command.Command.ConfigBase, R, E>(
  name: Name,
  config: Config,
  handler: (_: Types.Simplify<Command.Command.ParseConfig<Config>>) => Effect.Effect<R, E, void>
): Command.Command<
  Name,
  R,
  E,
  Types.Simplify<Command.Command.ParseConfig<Config>>
> => makeProto(makeDescriptor(name, config), handler)

/** @internal */
export const makeUnit: {
  <Name extends string>(
    name: Name
  ): Command.Command<Name, {}, never, never>
  <Name extends string, const Config extends Command.Command.ConfigBase>(
    name: Name,
    config: Config
  ): Command.Command<
    Name,
    never,
    never,
    Types.Simplify<Command.Command.ParseConfig<Config>>
  >
} = (name: string, config = {}) => fromDescriptorUnit(makeDescriptor(name, config) as any) as any

/** @internal */
export const makeHelp: {
  <Name extends string>(
    name: Name
  ): Command.Command<Name, never, ValidationError.ValidationError, {}>
  <Name extends string, const Config extends Command.Command.ConfigBase>(
    name: Name,
    config: Config
  ): Command.Command<
    Name,
    never,
    ValidationError.ValidationError,
    Types.Simplify<Command.Command.ParseConfig<Config>>
  >
} = (name: string, config = {}) => fromDescriptorHelp(makeDescriptor(name, config) as any) as any

/** @internal */
export const mapDescriptor = dual<
  <A>(f: (_: Descriptor.Command<A>) => Descriptor.Command<A>) => <Name extends string, R, E>(
    self: Command.Command<Name, R, E, A>
  ) => Command.Command<Name, R, E, A>,
  <Name extends string, R, E, A>(
    self: Command.Command<Name, R, E, A>,
    f: (_: Descriptor.Command<A>) => Descriptor.Command<A>
  ) => Command.Command<Name, R, E, A>
>(2, (self, f) => makeProto(f(getDescriptor(self)), self.handler, self.tag))

/** @internal */
export const mapBoth = dual<
  <A, B>(
    f: (_: Descriptor.Command<A>) => Descriptor.Command<B>,
    g: (_: B) => A
  ) => <Name extends string, R, E>(
    self: Command.Command<Name, R, E, A>
  ) => Command.Command<Name, R, E, B>,
  <Name extends string, R, E, A, B>(
    self: Command.Command<Name, R, E, A>,
    f: (_: Descriptor.Command<A>) => Descriptor.Command<B>,
    g: (_: B) => A
  ) => Command.Command<Name, R, E, B>
>(3, (self, f, g) => makeProto(f(getDescriptor(self)), (_) => self.handler(g(_)), self.tag))

/** @internal */
export const prompt = <Name extends string, A, R, E>(
  name: Name,
  prompt: Prompt.Prompt<A>,
  handler: (_: A) => Effect.Effect<R, E, void>
) =>
  makeProto(
    InternalDescriptor.map(
      InternalDescriptor.prompt(name, prompt),
      (_) => _.value
    ),
    handler
  )

/** @internal */
export const withDescription = dual<
  (
    help: string | HelpDoc
  ) => <Name extends string, R, E, A>(
    self: Command.Command<Name, R, E, A>
  ) => Command.Command<Name, R, E, A>,
  <Name extends string, R, E, A>(
    self: Command.Command<Name, R, E, A>,
    help: string | HelpDoc
  ) => Command.Command<Name, R, E, A>
>(2, (self, help) => mapDescriptor(self, InternalDescriptor.withDescription(help)))

/** @internal */
export const withSubcommands = dual<
  <Subcommand extends ReadonlyArray.NonEmptyReadonlyArray<Command.Command<any, any, any, any>>>(
    subcommands: Subcommand
  ) => <Name extends string, R, E, A>(self: Command.Command<Name, R, E, A>) => Command.Command<
    Name,
    | R
    | Exclude<
      Effect.Effect.Context<ReturnType<Subcommand[number]["handler"]>>,
      Descriptor.Command<Name>
    >,
    E | Effect.Effect.Error<ReturnType<Subcommand[number]["handler"]>>,
    Descriptor.Command.ComputeParsedType<
      & A
      & Readonly<
        {
          subcommand: Option.Option<
            Descriptor.Command.GetParsedType<Subcommand[number]["descriptor"]>
          >
        }
      >
    >
  >,
  <
    Name extends string,
    R,
    E,
    A,
    Subcommand extends ReadonlyArray.NonEmptyReadonlyArray<Command.Command<any, any, any, any>>
  >(
    self: Command.Command<Name, R, E, A>,
    subcommands: Subcommand
  ) => Command.Command<
    Name,
    | R
    | Exclude<
      Effect.Effect.Context<ReturnType<Subcommand[number]["handler"]>>,
      Descriptor.Command<Name>
    >,
    E | Effect.Effect.Error<ReturnType<Subcommand[number]["handler"]>>,
    Descriptor.Command.ComputeParsedType<
      & A
      & Readonly<
        {
          subcommand: Option.Option<
            Descriptor.Command.GetParsedType<Subcommand[number]["descriptor"]>
          >
        }
      >
    >
  >
>(2, (self, subcommands) => {
  const command = InternalDescriptor.withSubcommands(
    self.descriptor,
    ReadonlyArray.map(subcommands, (_) => [_.tag, _.descriptor])
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
      readonly subcommand: Option.Option<readonly [id: Context.Tag<any, any>, value: unknown]>
    }
  ) {
    if (args.subcommand._tag === "Some") {
      const [tag, value] = args.subcommand.value
      return Effect.provideService(
        handlers.get(tag)!(value),
        self.tag,
        args as any
      )
    }
    return self.handler(args as any)
  }
  return makeProto(command as any, handler, self.tag) as any
})

/** @internal */
export const run = dual<
  (config: {
    readonly name: string
    readonly version: string
    readonly summary?: Span | undefined
    readonly footer?: HelpDoc | undefined
  }) => <Name extends string, R, E, A>(
    self: Command.Command<Name, R, E, A>
  ) => (
    args: ReadonlyArray<string>
  ) => Effect.Effect<R | CliApp.CliApp.Environment, E | ValidationError.ValidationError, void>,
  <Name extends string, R, E, A>(self: Command.Command<Name, R, E, A>, config: {
    readonly name: string
    readonly version: string
    readonly summary?: Span | undefined
    readonly footer?: HelpDoc | undefined
  }) => (
    args: ReadonlyArray<string>
  ) => Effect.Effect<R | CliApp.CliApp.Environment, E | ValidationError.ValidationError, void>
>(2, (self, config) => {
  const app = InternalCliApp.make({
    ...config,
    command: self.descriptor
  })
  return (args) => InternalCliApp.run(app, args, self.handler)
})
