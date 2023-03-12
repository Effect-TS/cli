import type * as Args from "@effect/cli/Args"
import type * as CliConfig from "@effect/cli/CliConfig"
import type * as Command from "@effect/cli/Command"
import type * as CommandDirective from "@effect/cli/CommandDirective"
import type * as HelpDoc from "@effect/cli/HelpDoc"
import * as _args from "@effect/cli/internal_effect_untraced/args"
import * as builtInOption from "@effect/cli/internal_effect_untraced/builtInOption"
import * as cliConfig from "@effect/cli/internal_effect_untraced/cliConfig"
import * as commandDirective from "@effect/cli/internal_effect_untraced/commandDirective"
import * as doc from "@effect/cli/internal_effect_untraced/helpDoc"
import * as span from "@effect/cli/internal_effect_untraced/helpDoc/span"
import * as options from "@effect/cli/internal_effect_untraced/options"
import * as _usage from "@effect/cli/internal_effect_untraced/usage"
import * as validationError from "@effect/cli/internal_effect_untraced/validationError"
import type * as Options from "@effect/cli/Options"
import type * as Usage from "@effect/cli/Usage"
import type * as ValidationError from "@effect/cli/ValidationError"
import * as Chunk from "@effect/data/Chunk"
import * as Either from "@effect/data/Either"
import { dual, pipe } from "@effect/data/Function"
import * as HashMap from "@effect/data/HashMap"
import * as HashSet from "@effect/data/HashSet"
import * as List from "@effect/data/List"
import * as Option from "@effect/data/Option"
import type { NonEmptyReadonlyArray } from "@effect/data/ReadonlyArray"
import * as Debug from "@effect/io/Debug"
import * as Effect from "@effect/io/Effect"

const CommandSymbolKey = "@effect/cli/Command"

/** @internal */
export const CommandTypeId: Command.CommandTypeId = Symbol.for(
  CommandSymbolKey
) as Command.CommandTypeId

/** @internal */
export type Op<Tag extends string, Body = {}> = Command.Command<never> & Body & {
  readonly _tag: Tag
}

const proto = {
  [CommandTypeId]: {
    _ArgsType: (_: never) => _,
    _OptionsType: (_: never) => _
  }
}

/** @internal */
export type Instruction =
  | Single
  | Map
  | OrElse
  | Subcommands

/** @internal */
export interface Single extends
  Op<"Single", {
    readonly name: string
    readonly help: HelpDoc.HelpDoc
    readonly options: Options.Options<unknown>
    readonly args: Args.Args<unknown>
  }>
{}

/** @internal */
export interface Map extends
  Op<"Map", {
    readonly command: Instruction
    readonly f: (a: unknown) => unknown
  }>
{}

/** @internal */
export interface OrElse extends
  Op<"OrElse", {
    readonly left: Instruction
    readonly right: Instruction
  }>
{}

/** @internal */
export interface Subcommands extends
  Op<"Subcommands", {
    readonly parent: Instruction
    readonly child: Instruction
  }>
{}

const getSubcommandsMap: {
  [K in Instruction["_tag"]]: (self: Extract<Instruction, { _tag: K }>) => HashMap.HashMap<string, Command.Command<any>>
} = {
  Single: (self) => HashMap.make([self.name, self]),
  Map: (self) => getSubcommandsMap[self.command._tag](self.command as any),
  OrElse: (self) =>
    HashMap.union(
      getSubcommandsMap[self.left._tag](self.left as any),
      getSubcommandsMap[self.right._tag](self.right as any)
    ),
  Subcommands: (self) => getSubcommandsMap[self.child._tag](self.child as any)
}

/** @internal */
export const getSubcommands = <A>(self: Command.Command<A>): HashMap.HashMap<string, Command.Command<unknown>> =>
  getSubcommandsMap[(self as Instruction)._tag](self as any)

const helpDocMap: {
  [K in Instruction["_tag"]]: (self: Extract<Instruction, { _tag: K }>) => HelpDoc.HelpDoc
} = {
  Single: (self) => {
    const header = doc.isEmpty(self.help)
      ? doc.empty
      : doc.sequence(doc.h1("DESCRIPTION"), self.help)
    const argsHelp = _args.helpDoc(self.args)
    const argsSection = doc.isEmpty(argsHelp)
      ? doc.empty
      : doc.sequence(doc.h1("ARGUMENTS"), argsHelp)
    const optionsHelp = options.helpDoc(self.options)
    const optionsSection = doc.isEmpty(optionsHelp)
      ? doc.empty
      : doc.sequence(doc.h1("OPTIONS"), optionsHelp)
    return doc.sequence(header, doc.sequence(argsSection, optionsSection))
  },
  Map: (self) => helpDocMap[self.command._tag](self.command as any),
  OrElse: (self) =>
    doc.sequence(
      helpDocMap[self.left._tag](self.left as any),
      helpDocMap[self.right._tag](self.right as any)
    ),
  Subcommands: (self) =>
    doc.sequence(
      helpDocMap[self.parent._tag](self.parent as any),
      doc.sequence(
        doc.h1("COMMANDS"),
        subcommandsDescription(self.child, getSubcommandMaxSynopsisLength(self.child))
      )
    )
}

/** @internal */
export const helpDoc = <A>(self: Command.Command<A>): HelpDoc.HelpDoc =>
  helpDocMap[(self as Instruction)._tag](self as any)

/** @internal */
export const make = <OptionsType, ArgsType>(
  name: string,
  options: Options.Options<OptionsType>,
  args: Args.Args<ArgsType>
): Command.Command<readonly [OptionsType, ArgsType]> => single(name, doc.empty, options, args)

/** @internal */
export const map = dual<
  <A, B>(f: (a: A) => B) => (self: Command.Command<A>) => Command.Command<B>,
  <A, B>(self: Command.Command<A>, f: (a: A) => B) => Command.Command<B>
>(2, (self, f) => {
  const op = Object.create(proto)
  op._tag = "Map"
  op.command = self
  op.f = f
  return op
})

const namesMap: {
  [K in Instruction["_tag"]]: (self: Extract<Instruction, { _tag: K }>) => HashSet.HashSet<string>
} = {
  Single: (self) => HashSet.make(self.name),
  Map: (self) => namesMap[self.command._tag](self.command as any),
  OrElse: (self) =>
    HashSet.union(
      namesMap[self.left._tag](self.left as any),
      namesMap[self.right._tag](self.right as any)
    ),
  Subcommands: (self) => namesMap[self.parent._tag](self.parent as any)
}

/** @internal */
export const names = <A>(self: Command.Command<A>): HashSet.HashSet<string> =>
  namesMap[(self as Instruction)._tag](self as any)

/** @internal */
export const orElse = dual<
  <B>(that: Command.Command<B>) => <A>(self: Command.Command<A>) => Command.Command<A | B>,
  <A, B>(self: Command.Command<A>, that: Command.Command<B>) => Command.Command<A | B>
>(2, (self, that) => {
  const op = Object.create(proto)
  op._tag = "OrElse"
  op.left = self
  op.right = that
  return op
})

/** @internal */
export const orElseEither = dual<
  <B>(that: Command.Command<B>) => <A>(self: Command.Command<A>) => Command.Command<Either.Either<A, B>>,
  <A, B>(self: Command.Command<A>, that: Command.Command<B>) => Command.Command<Either.Either<A, B>>
>(2, (self, that) => orElse(map(self, Either.left), map(that, Either.right)))

const parseMap: {
  [K in Instruction["_tag"]]: (
    self: Extract<Instruction, { _tag: K }>,
    args: List.List<string>,
    config: CliConfig.CliConfig
  ) => Effect.Effect<never, ValidationError.ValidationError, CommandDirective.CommandDirective<any>>
} = {
  Single: (self, args, config) => {
    const parseBuiltInArgs = Option.exists(
        List.head(args),
        (name) => cliConfig.normalizeCase(config, self.name) === cliConfig.normalizeCase(config, name)
      )
      ? pipe(
        builtInOption.builtInOptions(self, usage(self), helpDoc(self)),
        options.validate(args, config),
        Effect.mapBoth((error) => error.error, (tuple) => tuple[1]),
        Effect.some,
        Effect.map(commandDirective.builtIn)
      )
      : Effect.fail(Option.none())
    const parseUserDefinedArgs = pipe(
      List.isNil(args)
        ? Effect.fail(validationError.commandMismatch(doc.p(`Missing command name: '${self.name}'`)))
        : pipe(
          Effect.succeed(args.tail),
          Effect.when(() => cliConfig.normalizeCase(config, args.head) === cliConfig.normalizeCase(config, self.name)),
          Effect.some,
          Effect.orElseFail(() => validationError.commandMismatch(doc.p(`Missing command name: '${self.name}'`)))
        ),
      Effect.flatMap((commandOptionsAndArgs) =>
        pipe(
          options.validate(self.options, unCluster(commandOptionsAndArgs), config),
          Effect.flatMap(([commandArgs, options]) =>
            pipe(
              _args.validate(self.args, commandArgs),
              Effect.map(([argsLeftover, args]) => commandDirective.userDefined(argsLeftover, [options, args]))
            )
          )
        )
      )
    )
    return Effect.orElse(parseBuiltInArgs, () => parseUserDefinedArgs)
  },
  Map: (self, args, config) =>
    Effect.map(
      parseMap[self.command._tag](self.command as any, args, config),
      commandDirective.map(self.f)
    ),
  OrElse: (self, args, config) =>
    Effect.catchSome(
      parseMap[self.left._tag](self.left as any, args, config),
      (error) =>
        validationError.isCommandMismatch(error)
          ? Option.some(parseMap[self.right._tag](self.right as any, args, config))
          : Option.none()
    ),
  Subcommands: (self, args, config) => {
    const helpDirectiveForChild = Effect.continueOrFail(
      parseMap[self.child._tag](self.child as any, List.isNil(args) ? List.nil() : args.tail, config),
      () => validationError.invalidArgument(doc.empty),
      (directive) => {
        if (commandDirective.isBuiltIn(directive) && builtInOption.isShowHelp(directive.option)) {
          const availableNames = Array.from(names(self))
          const parentName = availableNames.length === 0 ? "" : availableNames[0]
          return Option.some(commandDirective.builtIn(builtInOption.showHelp(
            _usage.concat(
              _usage.named(Chunk.of(parentName), Option.none()),
              directive.option.usage
            ),
            directive.option.helpDoc
          )))
        }
        return Option.none()
      }
    )
    const helpDirectiveForParent = Effect.succeed(commandDirective.builtIn(builtInOption.showHelp(
      usage(self),
      helpDoc(self)
    )))
    const wizardDirectiveForChild = Effect.continueOrFail(
      parseMap[self.child._tag](self.child as any, List.isNil(args) ? List.nil() : args.tail, config),
      () => validationError.invalidArgument(doc.empty),
      (directive) =>
        commandDirective.isBuiltIn(directive) && builtInOption.isWizard(directive.option)
          ? Option.some(directive)
          : Option.none()
    )
    const wizardDirectiveForParent = Effect.succeed(commandDirective.builtIn(builtInOption.wizard(self)))
    return pipe(
      parseMap[self.parent._tag](self.parent as any, args, config),
      Effect.flatMap((directive) => {
        if (commandDirective.isBuiltIn(directive)) {
          if (builtInOption.isShowHelp(directive.option)) {
            return Effect.orElse(helpDirectiveForChild, () => helpDirectiveForParent)
          }
          if (builtInOption.isWizard(directive.option)) {
            return Effect.orElse(wizardDirectiveForChild, () => wizardDirectiveForParent)
          }
          return Effect.succeed(directive)
        }
        if (List.isCons(directive.leftover)) {
          return Effect.map(
            parseMap[self.child._tag](self.child as any, directive.leftover, config),
            commandDirective.map((a) => [directive.value, a])
          )
        }
        return helpDirectiveForParent
      }),
      Effect.catchSome(() =>
        List.isNil(args)
          ? Option.some(helpDirectiveForParent)
          : Option.none()
      )
    )
  }
}

/** @internal */
export const parse = Debug.dualWithTrace<
  (
    args: List.List<string>,
    config: CliConfig.CliConfig
  ) => <A>(
    self: Command.Command<A>
  ) => Effect.Effect<never, ValidationError.ValidationError, CommandDirective.CommandDirective<A>>,
  <A>(
    self: Command.Command<A>,
    args: List.List<string>,
    config: CliConfig.CliConfig
  ) => Effect.Effect<never, ValidationError.ValidationError, CommandDirective.CommandDirective<A>>
>(3, (trace) => (self, args, config) => parseMap[(self as Instruction)._tag](self as any, args, config).traced(trace))

/** @internal */
export const subcommands = dual<
  <B>(
    subcommands: NonEmptyReadonlyArray<Command.Command<B>>
  ) => <A>(
    self: Command.Command<A>
  ) => Command.Command<readonly [A, B]>,
  <A, B>(
    self: Command.Command<A>,
    subcommands: NonEmptyReadonlyArray<Command.Command<B>>
  ) => Command.Command<readonly [A, B]>
>(2, (self, subcommands) => {
  const head = subcommands[0]
  const tail = subcommands.slice(1)
  if (tail.length === 0) {
    return subcommand(self, head)
  }
  return subcommand(self, tail.slice(1).reduce(orElse, orElse(head, tail[0])))
})

const usageMap: {
  [K in Instruction["_tag"]]: (self: Extract<Instruction, { _tag: K }>) => Usage.Usage
} = {
  Single: (self) =>
    _usage.concat(
      _usage.named(Chunk.of(self.name), Option.none()),
      _usage.concat(
        options.usage(self.options),
        _args.usage(self.args)
      )
    ),
  Map: (self) => usageMap[self.command._tag](self.command as any),
  OrElse: () => _usage.mixed,
  Subcommands: (self) =>
    _usage.concat(
      usageMap[self.parent._tag](self.parent as any),
      usageMap[self.child._tag](self.child as any)
    )
}

/** @internal */
export const usage = <A>(self: Command.Command<A>): Usage.Usage => usageMap[(self as Instruction)._tag](self as any)

const withHelpMap: {
  [K in Instruction["_tag"]]: (
    self: Extract<Instruction, { _tag: K }>,
    help: string | HelpDoc.HelpDoc
  ) => Command.Command<any>
} = {
  Single: (self, help) => single(self.name, typeof help === "string" ? doc.p(help) : help, self.options, self.args),
  Map: (self, help) => map(withHelpMap[self.command._tag](self.command as any, help), self.f),
  OrElse: (self, help) =>
    orElse(
      withHelpMap[self.left._tag](self.left as any, help),
      withHelpMap[self.right._tag](self.right as any, help)
    ),
  Subcommands: (self, help) => subcommand(withHelpMap[self.parent._tag](self.parent as any, help), self.child)
}

/** @internal */
export const withHelp = dual<
  (help: string | HelpDoc.HelpDoc) => <A>(self: Command.Command<A>) => Command.Command<A>,
  <A>(self: Command.Command<A>, help: string | HelpDoc.HelpDoc) => Command.Command<A>
>(2, (self, help) => withHelpMap[(self as Instruction)._tag](self as any, help))

const single = <OptionsType, ArgsType>(
  name: string,
  help: HelpDoc.HelpDoc,
  options: Options.Options<OptionsType>,
  args: Args.Args<ArgsType>
): Command.Command<readonly [OptionsType, ArgsType]> => {
  const op = Object.create(proto)
  op._tag = "Single"
  op.name = name
  op.help = help
  op.options = options
  op.args = args
  return op
}

const subcommand = <A, B>(parent: Command.Command<A>, child: Command.Command<B>): Command.Command<readonly [A, B]> => {
  const op = Object.create(proto)
  op._tag = "Subcommands"
  op.parent = parent
  op.child = child
  return op
}

const clusteredOptionRegex = /^-{1}([^-]{2,}|$)/

const unCluster = (args: List.List<string>): List.List<string> =>
  List.flatMap(args, (arg) =>
    clusteredOptionRegex.test(arg.trim())
      ? List.fromIterable(arg.substring(1).split("").map((c) => `-${c}`))
      : List.of(arg))

const subcommandMaxSynopsisLengthMap: {
  [K in Instruction["_tag"]]: (self: Extract<Instruction, { _tag: K }>) => number
} = {
  Single: (self) => span.size(doc.getSpan(_usage.helpDoc(usage(self)))),
  Map: (self) => subcommandMaxSynopsisLengthMap[self.command._tag](self.command as any),
  OrElse: (self) =>
    Math.max(
      subcommandMaxSynopsisLengthMap[self.left._tag](self.left as any),
      subcommandMaxSynopsisLengthMap[self.right._tag](self.right as any)
    ),
  Subcommands: (self) => subcommandMaxSynopsisLengthMap[self.parent._tag](self.parent as any)
}

const getSubcommandMaxSynopsisLength = (self: Instruction): number =>
  subcommandMaxSynopsisLengthMap[self._tag](self as any)

const subcommandDescriptionMap: {
  [K in Instruction["_tag"]]: (self: Extract<Instruction, { _tag: K }>, maxSynopsisLength: number) => HelpDoc.HelpDoc
} = {
  Single: (self, maxSynopsisLength) => {
    const usageSpan = doc.getSpan(_usage.helpDoc(usage(self)))
    return doc.p(span.spans([
      usageSpan,
      span.text(" ".repeat(maxSynopsisLength - span.size(usageSpan) + 2)),
      doc.getSpan(self.help)
    ]))
  },
  Map: (self, maxSynopsisLength) => subcommandDescriptionMap[self.command._tag](self.command as any, maxSynopsisLength),
  OrElse: (self, maxSynopsisLength) =>
    doc.enumeration([
      subcommandDescriptionMap[self.left._tag](self.left as any, maxSynopsisLength),
      subcommandDescriptionMap[self.right._tag](self.right as any, maxSynopsisLength)
    ]),
  Subcommands: (self, maxSynopsisLength) =>
    subcommandDescriptionMap[self.parent._tag](self.parent as any, maxSynopsisLength)
}

const subcommandsDescription = (self: Instruction, maxSynopsisLength: number): HelpDoc.HelpDoc =>
  subcommandDescriptionMap[self._tag](self as any, maxSynopsisLength)
