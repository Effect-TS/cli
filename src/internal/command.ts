import type * as FileSystem from "@effect/platform/FileSystem"
import type * as Terminal from "@effect/platform/Terminal"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import { dual, pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as HashSet from "effect/HashSet"
import * as Option from "effect/Option"
import * as Order from "effect/Order"
import { pipeArguments } from "effect/Pipeable"
import * as ReadonlyArray from "effect/ReadonlyArray"
import * as SynchronizedRef from "effect/SynchronizedRef"
import type * as Args from "../Args.js"
import type * as CliConfig from "../CliConfig.js"
import type * as Command from "../Command.js"
import type * as CommandDirective from "../CommandDirective.js"
import * as HelpDoc from "../HelpDoc.js"
import type * as Span from "../HelpDoc/Span.js"
import * as Options from "../Options.js"
import type * as Prompt from "../Prompt.js"
import type * as Usage from "../Usage.js"
import type * as ValidationError from "../ValidationError.js"
import * as InternalArgs from "./args.js"
import * as InternalBuiltInOptions from "./builtInOptions.js"
import * as InternalCliConfig from "./cliConfig.js"
import * as InternalCommandDirective from "./commandDirective.js"
import * as InternalHelpDoc from "./helpDoc.js"
import * as InternalSpan from "./helpDoc/span.js"
import * as InternalOptions from "./options.js"
import * as InternalPrompt from "./prompt.js"
import * as InternalSelectPrompt from "./prompt/select.js"
import * as InternalUsage from "./usage.js"
import * as InternalValidationError from "./validationError.js"

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
    _A: (_: never) => _
  },
  pipe() {
    return pipeArguments(this, arguments)
  }
}

/** @internal */
export type Instruction =
  | Standard
  | GetUserInput
  | Map
  | OrElse
  | Subcommands

/** @internal */
export interface Standard extends
  Op<"Standard", {
    readonly name: string
    readonly description: HelpDoc.HelpDoc
    readonly options: Options.Options<unknown>
    readonly args: Args.Args<unknown>
  }>
{}

/** @internal */
export interface GetUserInput extends
  Op<"GetUserInput", {
    readonly name: string
    readonly description: HelpDoc.HelpDoc
    readonly prompt: Prompt.Prompt<unknown>
  }>
{}

/** @internal */
export interface Map extends
  Op<"Map", {
    readonly command: Command.Command<unknown>
    readonly f: (value: unknown) => Either.Either<ValidationError.ValidationError, unknown>
  }>
{}

/** @internal */
export interface OrElse extends
  Op<"OrElse", {
    readonly left: Command.Command<unknown>
    readonly right: Command.Command<unknown>
  }>
{}

/** @internal */
export interface Subcommands extends
  Op<"Subcommands", {
    readonly parent: Command.Command<unknown>
    readonly child: Command.Command<unknown>
  }>
{}

// =============================================================================
// Refinements
// =============================================================================

/** @internal */
export const isCommand = (u: unknown): u is Command.Command<unknown> =>
  typeof u === "object" && u != null && CommandTypeId in u

/** @internal */
export const isStandard = (self: Instruction): self is Standard => self._tag === "Standard"

/** @internal */
export const isGetUserInput = (self: Instruction): self is GetUserInput =>
  self._tag === "GetUserInput"

/** @internal */
export const isMap = (self: Instruction): self is Map => self._tag === "Map"

/** @internal */
export const isOrElse = (self: Instruction): self is OrElse => self._tag === "OrElse"

/** @internal */
export const isSubcommands = (self: Instruction): self is Subcommands => self._tag === "Subcommands"

// =============================================================================
// Constructors
// =============================================================================

const defaultConstructorConfig = {
  options: InternalOptions.none,
  args: InternalArgs.none
}

/** @internal */
export const make = <Name extends string, OptionsType = void, ArgsType = void>(
  name: Name,
  config: Command.Command.ConstructorConfig<OptionsType, ArgsType> = defaultConstructorConfig as any
): Command.Command<Command.Command.ParsedStandardCommand<Name, OptionsType, ArgsType>> => {
  const { args, options } = { ...defaultConstructorConfig, ...config }
  const op = Object.create(proto)
  op._tag = "Standard"
  op.name = name
  op.description = InternalHelpDoc.empty
  op.options = options
  op.args = args
  return op
}

/** @internal */
export const prompt = <Name extends string, A>(
  name: Name,
  prompt: Prompt.Prompt<A>
): Command.Command<Command.Command.ParsedUserInputCommand<Name, A>> => {
  const op = Object.create(proto)
  op._tag = "GetUserInput"
  op.name = name
  op.description = InternalHelpDoc.empty
  op.prompt = prompt
  return op
}

// =============================================================================
// Combinators
// =============================================================================

/** @internal */
export const getHelp = <A>(self: Command.Command<A>): HelpDoc.HelpDoc =>
  getHelpInternal(self as Instruction)

/** @internal */
export const getNames = <A>(self: Command.Command<A>): HashSet.HashSet<string> =>
  getNamesInternal(self as Instruction)

/** @internal */
export const getBashCompletions = <A>(
  self: Command.Command<A>,
  programName: string
): Effect.Effect<never, never, ReadonlyArray<string>> =>
  getBashCompletionsInternal(self as Instruction, programName)

/** @internal */
export const getFishCompletions = <A>(
  self: Command.Command<A>,
  programName: string
): Effect.Effect<never, never, ReadonlyArray<string>> =>
  getFishCompletionsInternal(self as Instruction, programName)

/** @internal */
export const getZshCompletions = <A>(
  self: Command.Command<A>,
  programName: string
): Effect.Effect<never, never, ReadonlyArray<string>> =>
  getZshCompletionsInternal(self as Instruction, programName)

/** @internal */
export const getSubcommands = <A>(
  self: Command.Command<A>
): HashMap.HashMap<string, Command.Command<unknown>> => getSubcommandsInternal(self as Instruction)

/** @internal */
export const getUsage = <A>(self: Command.Command<A>): Usage.Usage =>
  getUsageInternal(self as Instruction)

/** @internal */
export const map = dual<
  <A, B>(f: (a: A) => B) => (self: Command.Command<A>) => Command.Command<B>,
  <A, B>(self: Command.Command<A>, f: (a: A) => B) => Command.Command<B>
>(2, (self, f) => mapOrFail(self, (a) => Either.right(f(a))))

/** @internal */
export const mapOrFail = dual<
  <A, B>(
    f: (a: A) => Either.Either<ValidationError.ValidationError, B>
  ) => (self: Command.Command<A>) => Command.Command<B>,
  <A, B>(
    self: Command.Command<A>,
    f: (a: A) => Either.Either<ValidationError.ValidationError, B>
  ) => Command.Command<B>
>(2, (self, f) => {
  const op = Object.create(proto)
  op._tag = "Map"
  op.command = self
  op.f = f
  return op
})

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
  <B>(
    that: Command.Command<B>
  ) => <A>(self: Command.Command<A>) => Command.Command<Either.Either<A, B>>,
  <A, B>(self: Command.Command<A>, that: Command.Command<B>) => Command.Command<Either.Either<A, B>>
>(2, (self, that) => orElse(map(self, Either.left), map(that, Either.right)))

/** @internal */
export const parse = dual<
  (
    args: ReadonlyArray<string>,
    config: CliConfig.CliConfig
  ) => <A>(self: Command.Command<A>) => Effect.Effect<
    FileSystem.FileSystem | Terminal.Terminal,
    ValidationError.ValidationError,
    CommandDirective.CommandDirective<A>
  >,
  <A>(
    self: Command.Command<A>,
    args: ReadonlyArray<string>,
    config: CliConfig.CliConfig
  ) => Effect.Effect<
    FileSystem.FileSystem | Terminal.Terminal,
    ValidationError.ValidationError,
    CommandDirective.CommandDirective<A>
  >
>(3, (self, args, config) => parseInternal(self as Instruction, args, config))

/** @internal */
export const withDescription = dual<
  (help: string | HelpDoc.HelpDoc) => <A>(self: Command.Command<A>) => Command.Command<A>,
  <A>(self: Command.Command<A>, help: string | HelpDoc.HelpDoc) => Command.Command<A>
>(2, (self, help) => withDescriptionInternal(self as Instruction, help))

/** @internal */
export const withSubcommands = dual<
  <Subcommands extends ReadonlyArray.NonEmptyReadonlyArray<Command.Command<any>>>(
    subcommands: [...Subcommands]
  ) => <A>(
    self: Command.Command<A>
  ) => Command.Command<
    Command.Command.ComputeParsedType<
      A & Readonly<{ subcommand: Option.Option<Command.Command.Subcommands<Subcommands>> }>
    >
  >,
  <A, Subcommands extends ReadonlyArray.NonEmptyReadonlyArray<Command.Command<any>>>(
    self: Command.Command<A>,
    subcommands: [...Subcommands]
  ) => Command.Command<
    Command.Command.ComputeParsedType<
      A & Readonly<{ subcommand: Option.Option<Command.Command.Subcommands<Subcommands>> }>
    >
  >
>(2, (self, subcommands) => {
  const op = Object.create(proto)
  op._tag = "Subcommands"
  op.parent = self
  if (ReadonlyArray.isNonEmptyReadonlyArray(subcommands)) {
    const head = ReadonlyArray.headNonEmpty<Command.Command<unknown>>(subcommands)
    const tail = ReadonlyArray.tailNonEmpty<Command.Command<unknown>>(subcommands)
    op.child = ReadonlyArray.isNonEmptyReadonlyArray(tail)
      ? ReadonlyArray.reduce(tail, head, orElse)
      : head
    return op
  }
  throw new Error("[BUG]: Command.subcommands - received empty list of subcommands")
})

/** @internal */
export const wizard = dual<
  (config: CliConfig.CliConfig) => <A>(self: Command.Command<A>) => Effect.Effect<
    FileSystem.FileSystem | Terminal.Terminal,
    ValidationError.ValidationError,
    ReadonlyArray<string>
  >,
  <A>(self: Command.Command<A>, config: CliConfig.CliConfig) => Effect.Effect<
    FileSystem.FileSystem | Terminal.Terminal,
    ValidationError.ValidationError,
    ReadonlyArray<string>
  >
>(2, (self, config) => wizardInternal(self as Instruction, config))

// =============================================================================
// Internals
// =============================================================================

const getHelpInternal = (self: Instruction): HelpDoc.HelpDoc => {
  switch (self._tag) {
    case "Standard": {
      const header = InternalHelpDoc.isEmpty(self.description)
        ? InternalHelpDoc.empty
        : InternalHelpDoc.sequence(InternalHelpDoc.h1("DESCRIPTION"), self.description)
      const argsHelp = InternalArgs.getHelp(self.args)
      const argsSection = InternalHelpDoc.isEmpty(argsHelp)
        ? InternalHelpDoc.empty
        : InternalHelpDoc.sequence(InternalHelpDoc.h1("ARGUMENTS"), argsHelp)
      const optionsHelp = InternalOptions.getHelp(self.options)
      const optionsSection = InternalHelpDoc.isEmpty(optionsHelp)
        ? InternalHelpDoc.empty
        : InternalHelpDoc.sequence(InternalHelpDoc.h1("OPTIONS"), optionsHelp)
      return InternalHelpDoc.sequence(header, InternalHelpDoc.sequence(argsSection, optionsSection))
    }
    case "GetUserInput": {
      return InternalHelpDoc.isEmpty(self.description)
        ? InternalHelpDoc.empty
        : InternalHelpDoc.sequence(InternalHelpDoc.h1("DESCRIPTION"), self.description)
    }
    case "Map": {
      return getHelpInternal(self.command as Instruction)
    }
    case "OrElse": {
      return InternalHelpDoc.sequence(
        getHelpInternal(self.left as Instruction),
        getHelpInternal(self.right as Instruction)
      )
    }
    case "Subcommands": {
      const getUsage = (
        command: Instruction,
        preceding: ReadonlyArray<Span.Span>
      ): ReadonlyArray<[Span.Span, Span.Span]> => {
        switch (command._tag) {
          case "Standard":
          case "GetUserInput": {
            const usage = InternalHelpDoc.getSpan(InternalUsage.getHelp(getUsageInternal(command)))
            const usages = ReadonlyArray.append(preceding, usage)
            const finalUsage = ReadonlyArray.reduce(
              usages,
              InternalSpan.empty,
              (acc, next) =>
                InternalSpan.isText(acc) && acc.value === ""
                  ? next
                  : InternalSpan.isText(next) && next.value === ""
                  ? acc
                  : InternalSpan.spans([acc, InternalSpan.space, next])
            )
            const description = InternalHelpDoc.getSpan(command.description)
            return ReadonlyArray.of([finalUsage, description])
          }
          case "Map": {
            return getUsage(command.command as Instruction, preceding)
          }
          case "OrElse": {
            return ReadonlyArray.appendAll(
              getUsage(command.left as Instruction, preceding),
              getUsage(command.right as Instruction, preceding)
            )
          }
          case "Subcommands": {
            const parentUsage = getUsage(command.parent as Instruction, preceding)
            return Option.match(ReadonlyArray.head(parentUsage), {
              onNone: () => getUsage(command.child as Instruction, preceding),
              onSome: ([usage]) => {
                const childUsage = getUsage(
                  command.child as Instruction,
                  ReadonlyArray.append(preceding, usage)
                )
                return ReadonlyArray.appendAll(parentUsage, childUsage)
              }
            })
          }
        }
      }
      const printSubcommands = (
        subcommands: ReadonlyArray<[Span.Span, Span.Span]>
      ): HelpDoc.HelpDoc => {
        const maxUsageLength = ReadonlyArray.reduceRight(
          subcommands,
          0,
          (max, [usage]) => Math.max(InternalSpan.size(usage), max)
        )
        const documents = ReadonlyArray.map(subcommands, ([usage, desc]) =>
          InternalHelpDoc.p(
            InternalSpan.spans([
              usage,
              InternalSpan.text(" ".repeat(maxUsageLength - InternalSpan.size(usage) + 2)),
              desc
            ])
          ))
        if (ReadonlyArray.isNonEmptyReadonlyArray(documents)) {
          return InternalHelpDoc.enumeration(documents)
        }
        throw new Error("[BUG]: Subcommands.usage - received empty list of subcommands to print")
      }
      return InternalHelpDoc.sequence(
        getHelpInternal(self.parent as Instruction),
        InternalHelpDoc.sequence(
          InternalHelpDoc.h1("COMMANDS"),
          printSubcommands(getUsage(self.child as Instruction, ReadonlyArray.empty()))
        )
      )
    }
  }
}

const getNamesInternal = (self: Instruction): HashSet.HashSet<string> => {
  switch (self._tag) {
    case "Standard":
    case "GetUserInput": {
      return HashSet.make(self.name)
    }
    case "Map": {
      return getNamesInternal(self.command as Instruction)
    }
    case "OrElse": {
      return HashSet.union(
        getNamesInternal(self.right as Instruction),
        getNamesInternal(self.left as Instruction)
      )
    }
    case "Subcommands": {
      return getNamesInternal(self.parent as Instruction)
    }
  }
}

const getSubcommandsInternal = (
  self: Instruction
): HashMap.HashMap<string, GetUserInput | Standard> => {
  switch (self._tag) {
    case "Standard":
    case "GetUserInput": {
      return HashMap.make([self.name, self])
    }
    case "Map": {
      return getSubcommandsInternal(self.command as Instruction)
    }
    case "OrElse": {
      return HashMap.union(
        getSubcommandsInternal(self.left as Instruction),
        getSubcommandsInternal(self.right as Instruction)
      )
    }
    case "Subcommands": {
      return getSubcommandsInternal(self.parent as Instruction)
    }
  }
}

const getUsageInternal = (self: Instruction): Usage.Usage => {
  switch (self._tag) {
    case "Standard": {
      return InternalUsage.concat(
        InternalUsage.named(ReadonlyArray.of(self.name), Option.none()),
        InternalUsage.concat(
          InternalOptions.getUsage(self.options),
          InternalArgs.getUsage(self.args)
        )
      )
    }
    case "GetUserInput": {
      return InternalUsage.named(ReadonlyArray.of(self.name), Option.none())
    }
    case "Map": {
      return getUsageInternal(self.command as Instruction)
    }
    case "OrElse": {
      return InternalUsage.mixed
    }
    case "Subcommands": {
      return InternalUsage.concat(
        getUsageInternal(self.parent as Instruction),
        getUsageInternal(self.child as Instruction)
      )
    }
  }
}

const parseInternal = (
  self: Instruction,
  args: ReadonlyArray<string>,
  config: CliConfig.CliConfig
): Effect.Effect<
  FileSystem.FileSystem | Terminal.Terminal,
  ValidationError.ValidationError,
  CommandDirective.CommandDirective<any>
> => {
  switch (self._tag) {
    case "Standard": {
      const parseCommandLine = (
        args: ReadonlyArray<string>
      ): Effect.Effect<never, ValidationError.ValidationError, ReadonlyArray<string>> => {
        if (ReadonlyArray.isNonEmptyReadonlyArray(args)) {
          const head = ReadonlyArray.headNonEmpty(args)
          const tail = ReadonlyArray.tailNonEmpty(args)
          const normalizedArgv0 = InternalCliConfig.normalizeCase(config, head)
          const normalizedCommandName = InternalCliConfig.normalizeCase(config, self.name)
          return Effect.succeed(tail).pipe(
            Effect.when(() => normalizedArgv0 === normalizedCommandName),
            Effect.flatten,
            Effect.catchTag("NoSuchElementException", () => {
              const error = InternalHelpDoc.p(`Missing command name: '${self.name}'`)
              return Effect.fail(InternalValidationError.commandMismatch(error))
            })
          )
        }
        const error = InternalHelpDoc.p(`Missing command name: '${self.name}'`)
        return Effect.fail(InternalValidationError.commandMismatch(error))
      }
      const parseBuiltInArgs = (
        args: ReadonlyArray<string>
      ): Effect.Effect<
        FileSystem.FileSystem,
        ValidationError.ValidationError,
        CommandDirective.CommandDirective<never>
      > => {
        if (ReadonlyArray.isNonEmptyReadonlyArray(args)) {
          const argv0 = ReadonlyArray.headNonEmpty(args)
          const normalizedArgv0 = InternalCliConfig.normalizeCase(config, argv0)
          const normalizedCommandName = InternalCliConfig.normalizeCase(config, self.name)
          if (normalizedArgv0 === normalizedCommandName) {
            const help = getHelpInternal(self)
            const usage = getUsageInternal(self)
            const options = InternalBuiltInOptions.builtInOptions(self, usage, help)
            return InternalOptions.validate(options, ReadonlyArray.drop(args, 1), config).pipe(
              Effect.flatMap((tuple) => tuple[2]),
              Effect.catchTag("NoSuchElementException", () => {
                const error = InternalHelpDoc.p("No built-in option was matched")
                return Effect.fail(InternalValidationError.noBuiltInMatch(error))
              }),
              Effect.map(InternalCommandDirective.builtIn)
            )
          }
        }
        const error = InternalHelpDoc.p(`Missing command name: '${self.name}'`)
        return Effect.fail(InternalValidationError.commandMismatch(error))
      }
      const parseUserDefinedArgs = (
        args: ReadonlyArray<string>
      ): Effect.Effect<
        FileSystem.FileSystem,
        ValidationError.ValidationError,
        CommandDirective.CommandDirective<unknown>
      > =>
        parseCommandLine(args).pipe(Effect.flatMap((commandOptionsAndArgs) => {
          const [optionsAndArgs, forcedCommandArgs] = splitForcedArgs(commandOptionsAndArgs)
          return InternalOptions.validate(self.options, optionsAndArgs, config).pipe(
            Effect.flatMap(([error, commandArgs, optionsType]) =>
              InternalArgs.validate(
                self.args,
                ReadonlyArray.appendAll(commandArgs, forcedCommandArgs),
                config
              ).pipe(
                Effect.catchAll((e) =>
                  Option.match(error, {
                    onNone: () => Effect.fail(e),
                    onSome: (err) => Effect.fail(err)
                  })
                ),
                Effect.map(([argsLeftover, argsType]) =>
                  InternalCommandDirective.userDefined(argsLeftover, {
                    name: self.name,
                    options: optionsType,
                    args: argsType
                  })
                )
              )
            )
          )
        }))
      const exhaustiveSearch = (
        args: ReadonlyArray<string>
      ): Effect.Effect<
        FileSystem.FileSystem,
        ValidationError.ValidationError,
        CommandDirective.CommandDirective<never>
      > => {
        if (ReadonlyArray.contains(args, "--help") || ReadonlyArray.contains(args, "-h")) {
          return parseBuiltInArgs(ReadonlyArray.make(self.name, "--help"))
        }
        if (ReadonlyArray.contains(args, "--wizard")) {
          return parseBuiltInArgs(ReadonlyArray.make(self.name, "--wizard"))
        }
        if (ReadonlyArray.contains(args, "--version")) {
          return parseBuiltInArgs(ReadonlyArray.make(self.name, "--version"))
        }
        const error = InternalHelpDoc.p(`Missing command name: '${self.name}'`)
        return Effect.fail(InternalValidationError.commandMismatch(error))
      }
      return parseBuiltInArgs(args).pipe(
        Effect.orElse(() => parseUserDefinedArgs(args)),
        Effect.catchSome((e) => {
          if (InternalValidationError.isValidationError(e)) {
            if (config.finalCheckBuiltIn) {
              return Option.some(
                exhaustiveSearch(args).pipe(
                  Effect.catchSome((_) =>
                    InternalValidationError.isValidationError(_)
                      ? Option.some(Effect.fail(e))
                      : Option.none()
                  )
                )
              )
            }
            return Option.some(Effect.fail(e))
          }
          return Option.none()
        })
      )
    }
    case "GetUserInput": {
      return InternalPrompt.run(self.prompt).pipe(
        Effect.map((value) =>
          InternalCommandDirective.userDefined(ReadonlyArray.drop(args, 1), {
            name: self.name,
            value
          })
        )
      )
    }
    case "Map": {
      return parseInternal(self.command as Instruction, args, config).pipe(
        Effect.flatMap((directive) => {
          if (InternalCommandDirective.isUserDefined(directive)) {
            const either = self.f(directive.value)
            return Either.isLeft(either)
              ? Effect.fail(either.left)
              : Effect.succeed(InternalCommandDirective.userDefined(
                directive.leftover,
                either.right
              ))
          }
          return Effect.succeed(directive)
        })
      )
    }
    case "OrElse": {
      return parseInternal(self.left as Instruction, args, config).pipe(
        Effect.catchSome((e) => {
          return InternalValidationError.isCommandMismatch(e)
            ? Option.some(parseInternal(self.right as Instruction, args, config))
            : Option.none()
        })
      )
    }
    case "Subcommands": {
      const names = Array.from(getNamesInternal(self))
      const subcommands = getSubcommandsInternal(self.child as Instruction)
      const [parentArgs, childArgs] = ReadonlyArray.span(
        args,
        (name) => !HashMap.has(subcommands, name)
      )
      const helpDirectiveForParent = Effect.sync(() => {
        return InternalCommandDirective.builtIn(InternalBuiltInOptions.showHelp(
          getUsageInternal(self),
          getHelpInternal(self)
        ))
      })
      const helpDirectiveForChild = Effect.suspend(() => {
        return parseInternal(self.child as Instruction, childArgs, config).pipe(
          Effect.flatMap((directive) => {
            if (
              InternalCommandDirective.isBuiltIn(directive) &&
              InternalBuiltInOptions.isShowHelp(directive.option)
            ) {
              const parentName = Option.getOrElse(ReadonlyArray.head(names), () => "")
              const newDirective = InternalCommandDirective.builtIn(InternalBuiltInOptions.showHelp(
                InternalUsage.concat(
                  InternalUsage.named(ReadonlyArray.of(parentName), Option.none()),
                  directive.option.usage
                ),
                directive.option.helpDoc
              ))
              return Effect.succeed(newDirective)
            }
            return Effect.fail(InternalValidationError.invalidArgument(InternalHelpDoc.empty))
          })
        )
      })
      const wizardDirectiveForParent = Effect.sync(() =>
        InternalCommandDirective.builtIn(InternalBuiltInOptions.showWizard(self))
      )
      const wizardDirectiveForChild = Effect.suspend(() =>
        parseInternal(self.child as Instruction, childArgs, config).pipe(
          Effect.flatMap((directive) => {
            if (
              InternalCommandDirective.isBuiltIn(directive) &&
              InternalBuiltInOptions.isShowWizard(directive.option)
            ) {
              return Effect.succeed(directive)
            }
            return Effect.fail(InternalValidationError.invalidArgument(InternalHelpDoc.empty))
          })
        )
      )
      return parseInternal(self.parent as Instruction, parentArgs, config).pipe(
        Effect.flatMap((directive) => {
          switch (directive._tag) {
            case "BuiltIn": {
              if (InternalBuiltInOptions.isShowHelp(directive.option)) {
                // We do not want to display the child help docs if there are
                // no arguments indicating the CLI command was for the child
                return ReadonlyArray.isNonEmptyReadonlyArray(childArgs)
                  ? Effect.orElse(helpDirectiveForChild, () => helpDirectiveForParent)
                  : helpDirectiveForParent
              }
              if (InternalBuiltInOptions.isShowWizard(directive.option)) {
                return Effect.orElse(wizardDirectiveForChild, () => wizardDirectiveForParent)
              }
              return Effect.succeed(directive)
            }
            case "UserDefined": {
              const args = ReadonlyArray.appendAll(directive.leftover, childArgs)
              if (ReadonlyArray.isNonEmptyReadonlyArray(args)) {
                return parseInternal(self.child as Instruction, args, config).pipe(Effect.mapBoth({
                  onFailure: (err) => {
                    if (InternalValidationError.isCommandMismatch(err)) {
                      const parentName = Option.getOrElse(ReadonlyArray.head(names), () => "")
                      const subcommandNames = pipe(
                        ReadonlyArray.fromIterable(HashMap.keys(subcommands)),
                        ReadonlyArray.map((name) => `'${name}'`)
                      )
                      const oneOf = subcommandNames.length === 1 ? "" : " one of"
                      const error = InternalHelpDoc.p(
                        `Invalid subcommand for ${parentName} - use${oneOf} ${
                          ReadonlyArray.join(subcommandNames, ", ")
                        }`
                      )
                      return InternalValidationError.commandMismatch(error)
                    }
                    return err
                  },
                  onSuccess: InternalCommandDirective.map((subcommand) => ({
                    ...directive.value as any,
                    subcommand: Option.some(subcommand)
                  }))
                }))
              }
              return Effect.succeed(InternalCommandDirective.userDefined(directive.leftover, {
                ...directive.value as any,
                subcommand: Option.none()
              }))
            }
          }
        }),
        Effect.catchSome(() =>
          ReadonlyArray.isEmptyReadonlyArray(args)
            ? Option.some(helpDirectiveForParent) :
            Option.none()
        )
      )
    }
  }
}

const splitForcedArgs = (
  args: ReadonlyArray<string>
): [ReadonlyArray<string>, ReadonlyArray<string>] => {
  const [remainingArgs, forcedArgs] = ReadonlyArray.span(args, (str) => str !== "--")
  return [remainingArgs, ReadonlyArray.drop(forcedArgs, 1)]
}

const withDescriptionInternal = (
  self: Instruction,
  description: string | HelpDoc.HelpDoc
): Command.Command<any> => {
  switch (self._tag) {
    case "Standard": {
      const helpDoc = typeof description === "string" ? HelpDoc.p(description) : description
      const op = Object.create(proto)
      op._tag = "Standard"
      op.name = self.name
      op.description = helpDoc
      op.options = self.options
      op.args = self.args
      return op
    }
    case "GetUserInput": {
      const helpDoc = typeof description === "string" ? HelpDoc.p(description) : description
      const op = Object.create(proto)
      op._tag = "GetUserInput"
      op.name = self.name
      op.description = helpDoc
      op.prompt = self.prompt
      return op
    }
    case "Map": {
      return map(withDescriptionInternal(self.command as Instruction, description), self.f)
    }
    case "OrElse": {
      // TODO: if both the left and right commands also have help defined, that
      // help will be overwritten by this method which may be undesirable
      return orElse(
        withDescriptionInternal(self.left as Instruction, description),
        withDescriptionInternal(self.right as Instruction, description)
      )
    }
    case "Subcommands": {
      const op = Object.create(proto)
      op._tag = "Subcommands"
      op.parent = withDescriptionInternal(self.parent as Instruction, description)
      op.child = self.child
      return op
    }
  }
}

const wizardInternal = (
  self: Instruction,
  config: CliConfig.CliConfig
): Effect.Effect<
  FileSystem.FileSystem | Terminal.Terminal,
  ValidationError.ValidationError,
  ReadonlyArray<string>
> => {
  const loop = (self: WizardCommandSequence): Effect.Effect<
    FileSystem.FileSystem | Terminal.Terminal,
    ValidationError.ValidationError,
    ReadonlyArray<string>
  > => {
    switch (self._tag) {
      case "SingleCommandWizard": {
        const optionsWizard = isStandard(self.command)
          ? InternalOptions.wizard(self.command.options, config)
          : Effect.succeed(ReadonlyArray.empty())
        const argsWizard = isStandard(self.command)
          ? InternalArgs.wizard(self.command.args, config)
          : Effect.succeed(ReadonlyArray.empty())
        const help = InternalHelpDoc.p(pipe(
          InternalSpan.text("\n"),
          InternalSpan.concat(InternalSpan.strong(InternalSpan.code("COMMAND:"))),
          InternalSpan.concat(InternalSpan.space),
          InternalSpan.concat(InternalSpan.code(self.command.name))
        ))
        const message = InternalHelpDoc.toAnsiText(help)
        return Console.log(message).pipe(
          Effect.zipRight(Effect.zipWith(optionsWizard, argsWizard, (options, args) =>
            pipe(
              ReadonlyArray.appendAll(options, args),
              ReadonlyArray.prepend(self.command.name)
            )))
        )
      }
      case "AlternativeCommandWizard": {
        const makeChoice = (title: string, value: WizardCommandSequence) => ({ title, value })
        const choices = self.alternatives.map((alternative) => {
          switch (alternative._tag) {
            case "SingleCommandWizard": {
              return makeChoice(alternative.command.name, alternative)
            }
            case "SubcommandWizard": {
              return makeChoice(alternative.names, alternative)
            }
          }
        })
        const description = InternalHelpDoc.p("Select which command you would like to execute")
        const message = InternalHelpDoc.toAnsiText(description).trimEnd()
        return InternalSelectPrompt.select({ message, choices }).pipe(
          Effect.flatMap((nextSequence) => loop(nextSequence))
        )
      }
      case "SubcommandWizard": {
        return Effect.zipWith(
          loop(self.parent),
          loop(self.child),
          (parent, child) => ReadonlyArray.appendAll(parent, child)
        )
      }
    }
  }
  return loop(getWizardCommandSequence(self))
}

type WizardCommandSequence = SingleCommandWizard | AlternativeCommandWizard | SubcommandWizard

interface SingleCommandWizard {
  readonly _tag: "SingleCommandWizard"
  readonly command: GetUserInput | Standard
}

interface AlternativeCommandWizard {
  readonly _tag: "AlternativeCommandWizard"
  readonly alternatives: ReadonlyArray<SingleCommandWizard | SubcommandWizard>
}

interface SubcommandWizard {
  _tag: "SubcommandWizard"
  readonly names: string
  readonly parent: WizardCommandSequence
  readonly child: WizardCommandSequence
}

/**
 * Creates an intermediate data structure that allows commands to be properly
 * sequenced by the prompts of Wizard Mode.
 */
const getWizardCommandSequence = (self: Instruction): WizardCommandSequence => {
  switch (self._tag) {
    case "Standard":
    case "GetUserInput": {
      return { _tag: "SingleCommandWizard", command: self }
    }
    case "Map": {
      return getWizardCommandSequence(self.command as Instruction)
    }
    case "OrElse": {
      const left = getWizardCommandSequence(self.left as Instruction)
      const leftAlternatives = left._tag === "AlternativeCommandWizard"
        ? left.alternatives
        : ReadonlyArray.of(left)
      const right = getWizardCommandSequence(self.right as Instruction)
      const rightAlternatives = right._tag === "AlternativeCommandWizard"
        ? right.alternatives
        : ReadonlyArray.of(right)
      const alternatives = ReadonlyArray.appendAll(leftAlternatives, rightAlternatives)
      return { _tag: "AlternativeCommandWizard", alternatives }
    }
    case "Subcommands": {
      const names = pipe(
        ReadonlyArray.fromIterable(getNamesInternal(self.parent as Instruction)),
        ReadonlyArray.join(" | ")
      )
      const parent = getWizardCommandSequence(self.parent as Instruction)
      const child = getWizardCommandSequence(self.child as Instruction)
      return { _tag: "SubcommandWizard", names, parent, child }
    }
  }
}

// =============================================================================
// Completion Internals
// =============================================================================

const getShortDescription = (self: Instruction): string => {
  switch (self._tag) {
    case "Standard": {
      return InternalSpan.getText(InternalHelpDoc.getSpan(self.description))
    }
    case "GetUserInput": {
      return InternalSpan.getText(InternalHelpDoc.getSpan(self.description))
    }
    case "Map": {
      return getShortDescription(self.command as Instruction)
    }
    case "OrElse":
    case "Subcommands": {
      return ""
    }
  }
}

interface CommandInfo {
  readonly command: Standard | GetUserInput
  readonly parentCommands: ReadonlyArray<string>
  readonly subcommands: ReadonlyArray<[string, Standard | GetUserInput]>
  readonly level: number
}

/**
 * Allows for linear traversal of a `Command` data structure, accumulating state
 * based on information acquired from the command.
 */
const traverseCommand = <S>(
  self: Instruction,
  initialState: S,
  f: (state: S, info: CommandInfo) => Effect.Effect<never, never, S>
): Effect.Effect<never, never, S> =>
  SynchronizedRef.make(initialState).pipe(Effect.flatMap((ref) => {
    const loop = (
      self: Instruction,
      parentCommands: ReadonlyArray<string>,
      subcommands: ReadonlyArray<[string, Standard | GetUserInput]>,
      level: number
    ): Effect.Effect<never, never, void> => {
      switch (self._tag) {
        case "Standard": {
          const info: CommandInfo = {
            command: self,
            parentCommands,
            subcommands,
            level
          }
          return SynchronizedRef.updateEffect(ref, (state) => f(state, info))
        }
        case "GetUserInput": {
          const info: CommandInfo = {
            command: self,
            parentCommands,
            subcommands,
            level
          }
          return SynchronizedRef.updateEffect(ref, (state) => f(state, info))
        }
        case "Map": {
          return loop(self.command as Instruction, parentCommands, subcommands, level)
        }
        case "OrElse": {
          const left = loop(self.left as Instruction, parentCommands, subcommands, level)
          const right = loop(self.right as Instruction, parentCommands, subcommands, level)
          return Effect.zipRight(left, right)
        }
        case "Subcommands": {
          const parentNames = Array.from(getNamesInternal(self.parent as Instruction))
          const nextSubcommands = Array.from(getSubcommandsInternal(self.child as Instruction))
          const nextParentCommands = ReadonlyArray.appendAll(parentCommands, parentNames)
          // Traverse the parent command using old parent names and next subcommands
          return loop(self.parent as Instruction, parentCommands, nextSubcommands, level).pipe(
            Effect.zipRight(
              // Traverse the child command using next parent names and old subcommands
              loop(self.child as Instruction, nextParentCommands, subcommands, level + 1)
            )
          )
        }
      }
    }
    return Effect.suspend(() => loop(self, ReadonlyArray.empty(), ReadonlyArray.empty(), 0)).pipe(
      Effect.zipRight(SynchronizedRef.get(ref))
    )
  }))

const indentAll = dual<
  (indent: number) => (self: ReadonlyArray<string>) => ReadonlyArray<string>,
  (self: ReadonlyArray<string>, indent: number) => ReadonlyArray<string>
>(2, (self: ReadonlyArray<string>, indent: number): ReadonlyArray<string> => {
  const indentation = new Array(indent + 1).join(" ")
  return ReadonlyArray.map(self, (line) => `${indentation}${line}`)
})

const getBashCompletionsInternal = (
  self: Instruction,
  rootCommand: string
): Effect.Effect<never, never, ReadonlyArray<string>> =>
  traverseCommand(
    self,
    ReadonlyArray.empty<[ReadonlyArray<string>, ReadonlyArray<string>]>(),
    (state, info) => {
      const options = isStandard(info.command)
        ? Options.all([info.command.options, InternalBuiltInOptions.builtIns])
        : InternalBuiltInOptions.builtIns
      const optionNames = InternalOptions.getNames(options as InternalOptions.Instruction)
      const optionCases = isStandard(info.command)
        ? InternalOptions.getBashCompletions(info.command.options as InternalOptions.Instruction)
        : ReadonlyArray.empty()
      const subcommandNames = pipe(
        info.subcommands,
        ReadonlyArray.map(([name]) => name),
        ReadonlyArray.sort(Order.string)
      )
      const wordList = ReadonlyArray.appendAll(optionNames, subcommandNames)
      const preformatted = ReadonlyArray.isEmptyReadonlyArray(info.parentCommands)
        ? ReadonlyArray.of(info.command.name)
        : pipe(
          info.parentCommands,
          ReadonlyArray.append(info.command.name),
          ReadonlyArray.map((command) => command.replace("-", "__"))
        )
      const caseName = ReadonlyArray.join(preformatted, ",")
      const funcName = ReadonlyArray.join(preformatted, "__")
      const funcLines = ReadonlyArray.isEmptyReadonlyArray(info.parentCommands)
        ? ReadonlyArray.empty()
        : [
          `${caseName})`,
          `    cmd="${funcName}"`,
          "    ;;"
        ]
      const cmdLines = [
        `${funcName})`,
        `    opts="${ReadonlyArray.join(wordList, " ")}"`,
        `    if [[ \${cur} == -* || \${COMP_CWORD} -eq ${info.level + 1} ]] ; then`,
        "        COMPREPLY=( $(compgen -W \"${opts}\" -- \"${cur}\") )",
        "        return 0",
        "    fi",
        "    case \"${prev}\" in",
        ...indentAll(optionCases, 8),
        "    *)",
        "        COMPREPLY=()",
        "        ;;",
        "    esac",
        "    COMPREPLY=( $(compgen -W \"${opts}\" -- \"${cur}\") )",
        "    return 0",
        "    ;;"
      ]
      const lines = ReadonlyArray.append(
        state,
        [funcLines, cmdLines] as [ReadonlyArray<string>, ReadonlyArray<string>]
      )
      return Effect.succeed(lines)
    }
  ).pipe(Effect.map((lines) => {
    const scriptName = `_${rootCommand}_bash_completions`
    const funcCases = ReadonlyArray.flatMap(lines, ([funcLines]) => funcLines)
    const cmdCases = ReadonlyArray.flatMap(lines, ([, cmdLines]) => cmdLines)
    return [
      `function ${scriptName}() {`,
      "    local i cur prev opts cmd",
      "    COMPREPLY=()",
      "    cur=\"${COMP_WORDS[COMP_CWORD]}\"",
      "    prev=\"${COMP_WORDS[COMP_CWORD-1]}\"",
      "    cmd=\"\"",
      "    opts=\"\"",
      "    for i in \"${COMP_WORDS[@]}\"; do",
      "        case \"${cmd},${i}\" in",
      "            \",$1\")",
      `                cmd="${rootCommand}"`,
      "                ;;",
      ...indentAll(funcCases, 12),
      "            *)",
      "                ;;",
      "        esac",
      "    done",
      "    case \"${cmd}\" in",
      ...indentAll(cmdCases, 8),
      "    esac",
      "}",
      `complete -F ${scriptName} -o nosort -o bashdefault -o default ${rootCommand}`
    ]
  }))

const getFishCompletionsInternal = (
  self: Instruction,
  rootCommand: string
): Effect.Effect<never, never, ReadonlyArray<string>> =>
  traverseCommand(self, ReadonlyArray.empty(), (state, info) => {
    const baseTemplate = ReadonlyArray.make("complete", "-c", rootCommand)
    const options = isStandard(info.command)
      ? InternalOptions.all([InternalBuiltInOptions.builtIns, info.command.options])
      : InternalBuiltInOptions.builtIns
    const optionsCompletions = InternalOptions.getFishCompletions(
      options as InternalOptions.Instruction
    )
    const argsCompletions = isStandard(info.command)
      ? InternalArgs.getFishCompletions(info.command.args as InternalArgs.Instruction)
      : ReadonlyArray.empty()
    const rootCompletions = (conditionals: ReadonlyArray<string>) =>
      pipe(
        ReadonlyArray.map(optionsCompletions, (option) =>
          pipe(
            baseTemplate,
            ReadonlyArray.appendAll(conditionals),
            ReadonlyArray.append(option),
            ReadonlyArray.join(" ")
          )),
        ReadonlyArray.appendAll(
          ReadonlyArray.map(argsCompletions, (option) =>
            pipe(
              baseTemplate,
              ReadonlyArray.appendAll(conditionals),
              ReadonlyArray.append(option),
              ReadonlyArray.join(" ")
            ))
        )
      )
    const subcommandCompletions = (conditionals: ReadonlyArray<string>) =>
      ReadonlyArray.map(info.subcommands, ([name, subcommand]) => {
        const description = getShortDescription(subcommand)
        return pipe(
          baseTemplate,
          ReadonlyArray.appendAll(conditionals),
          ReadonlyArray.appendAll(ReadonlyArray.make("-f", "-a", `"${name}"`)),
          ReadonlyArray.appendAll(
            description.length === 0
              ? ReadonlyArray.empty()
              : ReadonlyArray.make("-d", `'${description}'`)
          ),
          ReadonlyArray.join(" ")
        )
      })
    // If parent commands are empty, then the info is for the root command
    if (ReadonlyArray.isEmptyReadonlyArray(info.parentCommands)) {
      const conditionals = ReadonlyArray.make("-n", "\"__fish_use_subcommand\"")
      return Effect.succeed(pipe(
        state,
        ReadonlyArray.appendAll(rootCompletions(conditionals)),
        ReadonlyArray.appendAll(subcommandCompletions(conditionals))
      ))
    }
    // Otherwise the info is for a subcommand
    const parentConditionals = pipe(
      info.parentCommands,
      // Drop the root command name from the subcommand conditionals
      ReadonlyArray.drop(1),
      ReadonlyArray.append(info.command.name),
      ReadonlyArray.map((command) => `__fish_seen_subcommand_from ${command}`)
    )
    const subcommandConditionals = ReadonlyArray.map(
      info.subcommands,
      ([name]) => `not __fish_seen_subcommand_from ${name}`
    )
    const baseConditionals = pipe(
      ReadonlyArray.appendAll(parentConditionals, subcommandConditionals),
      ReadonlyArray.join("; and ")
    )
    const conditionals = ReadonlyArray.make("-n", `"${baseConditionals}"`)
    return Effect.succeed(pipe(
      state,
      ReadonlyArray.appendAll(rootCompletions(conditionals)),
      ReadonlyArray.appendAll(subcommandCompletions(conditionals))
    ))
  })

const getZshCompletionsInternal = (
  self: Instruction,
  rootCommand: string
): Effect.Effect<never, never, ReadonlyArray<string>> =>
  traverseCommand(self, ReadonlyArray.empty<string>(), (state, info) => {
    const preformatted = ReadonlyArray.isEmptyReadonlyArray(info.parentCommands)
      ? ReadonlyArray.of(info.command.name)
      : pipe(
        info.parentCommands,
        ReadonlyArray.append(info.command.name),
        ReadonlyArray.map((command) => command.replace("-", "__"))
      )
    const underscoreName = ReadonlyArray.join(preformatted, "__")
    const spaceName = ReadonlyArray.join(preformatted, " ")
    const subcommands = pipe(
      info.subcommands,
      ReadonlyArray.map(([name, subcommand]) => {
        const desc = getShortDescription(subcommand)
        return `'${name}:${desc}' \\`
      })
    )
    const commands = ReadonlyArray.isEmptyReadonlyArray(subcommands)
      ? `commands=()`
      : `commands=(\n${ReadonlyArray.join(indentAll(subcommands, 8), "\n")}\n    )`
    const handlerLines = [
      `(( $+functions[_${underscoreName}_commands] )) ||`,
      `_${underscoreName}_commands() {`,
      `    local commands; ${commands}`,
      `    _describe -t commands '${spaceName} commands' commands "$@"`,
      "}"
    ]
    return Effect.succeed(ReadonlyArray.appendAll(state, handlerLines))
  }).pipe(Effect.map((handlers) => {
    const cases = getZshSubcommandCases(self, ReadonlyArray.empty(), ReadonlyArray.empty())
    const scriptName = `_${rootCommand}_zsh_completions`
    return [
      `#compdef ${rootCommand}`,
      "",
      "autoload -U is-at-least",
      "",
      `function ${scriptName}() {`,
      "    typeset -A opt_args",
      "    typeset -a _arguments_options",
      "    local ret=1",
      "",
      "    if is-at-least 5.2; then",
      "        _arguments_options=(-s -S -C)",
      "    else",
      "        _arguments_options=(-s -C)",
      "    fi",
      "",
      "    local context curcontext=\"$curcontext\" state line",
      ...indentAll(cases, 4),
      "}",
      "",
      ...handlers,
      "",
      `if [ "$funcstack[1]" = "${scriptName}" ]; then`,
      `    ${scriptName} "$@"`,
      "else",
      `    compdef ${scriptName} ${rootCommand}`,
      "fi"
    ]
  }))

const getZshSubcommandCases = (
  self: Instruction,
  parentCommands: ReadonlyArray<string>,
  subcommands: ReadonlyArray<[string, Standard | GetUserInput]>
): ReadonlyArray<string> => {
  switch (self._tag) {
    case "Standard":
    case "GetUserInput": {
      const options = isStandard(self)
        ? InternalOptions.all([InternalBuiltInOptions.builtIns, self.options])
        : InternalBuiltInOptions.builtIns
      const optionCompletions = pipe(
        InternalOptions.getZshCompletions(options as InternalOptions.Instruction),
        ReadonlyArray.map((completion) => `'${completion}' \\`)
      )
      if (ReadonlyArray.isEmptyReadonlyArray(parentCommands)) {
        return [
          "_arguments \"${_arguments_options[@]}\" \\",
          ...indentAll(optionCompletions, 4),
          `    ":: :_${self.name}_commands" \\`,
          `    "*::: :->${self.name}" \\`,
          "    && ret=0"
        ]
      }
      if (ReadonlyArray.isEmptyReadonlyArray(subcommands)) {
        return [
          `(${self.name})`,
          "_arguments \"${_arguments_options[@]}\" \\",
          ...indentAll(optionCompletions, 4),
          "    && ret=0",
          ";;"
        ]
      }
      return [
        `(${self.name})`,
        "_arguments \"${_arguments_options[@]}\" \\",
        ...indentAll(optionCompletions, 4),
        `    ":: :_${ReadonlyArray.append(parentCommands, self.name).join("__")}_commands" \\`,
        `    "*::: :->${self.name}" \\`,
        "    && ret=0"
      ]
    }
    case "Map": {
      return getZshSubcommandCases(self.command as Instruction, parentCommands, subcommands)
    }
    case "OrElse": {
      const left = getZshSubcommandCases(self.left as Instruction, parentCommands, subcommands)
      const right = getZshSubcommandCases(self.right as Instruction, parentCommands, subcommands)
      return ReadonlyArray.appendAll(left, right)
    }
    case "Subcommands": {
      const nextSubcommands = Array.from(getSubcommandsInternal(self.child as Instruction))
      const parentNames = Array.from(getNamesInternal(self.parent as Instruction))
      const parentLines = getZshSubcommandCases(
        self.parent as Instruction,
        parentCommands,
        ReadonlyArray.appendAll(subcommands, nextSubcommands)
      )
      const childCases = getZshSubcommandCases(
        self.child as Instruction,
        ReadonlyArray.appendAll(parentCommands, parentNames),
        subcommands
      )
      const hyphenName = pipe(
        ReadonlyArray.appendAll(parentCommands, parentNames),
        ReadonlyArray.join("-")
      )
      const childLines = pipe(
        parentNames,
        ReadonlyArray.flatMap((parentName) => [
          "case $state in",
          `    (${parentName})`,
          `    words=($line[1] "\${words[@]}")`,
          "    (( CURRENT += 1 ))",
          `    curcontext="\${curcontext%:*:*}:${hyphenName}-command-$line[1]:"`,
          `    case $line[1] in`,
          ...indentAll(childCases, 8),
          "    esac",
          "    ;;",
          "esac"
        ]),
        ReadonlyArray.appendAll(
          ReadonlyArray.isEmptyReadonlyArray(parentCommands)
            ? ReadonlyArray.empty()
            : ReadonlyArray.of(";;")
        )
      )
      return ReadonlyArray.appendAll(parentLines, childLines)
    }
  }
}

// Circular with ValidationError

/** @internal */
export const helpRequestedError = <A>(
  command: Command.Command<A>
): ValidationError.ValidationError => {
  const op = Object.create(InternalValidationError.proto)
  op._tag = "HelpRequested"
  op.error = InternalHelpDoc.empty
  op.showHelp = InternalBuiltInOptions.showHelp(
    getUsageInternal(command as Instruction),
    getHelpInternal(command as Instruction)
  )
  return op
}
