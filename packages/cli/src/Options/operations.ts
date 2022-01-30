// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as PredefMap from "@effect-ts/core/Collections/Immutable/Map"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import * as S from "@effect-ts/core/Collections/Immutable/Set"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import type { Either } from "@effect-ts/core/Either"
import * as E from "@effect-ts/core/Either"
import * as Equal from "@effect-ts/core/Equal"
import { identity, pipe } from "@effect-ts/core/Function"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import type { Show } from "@effect-ts/core/Show"
import { boolean as showBoolean } from "@effect-ts/core/Show"
import * as String from "@effect-ts/core/String"
import { matchTag_ } from "@effect-ts/core/Utils"

import * as AutoCorrect from "../AutoCorrect"
import type { CliConfig } from "../CliConfig"
import * as Config from "../CliConfig"
import type { Completion } from "../Completion"
import type { Exists } from "../Exists"
import * as Exist from "../Exists"
import type { HelpDoc } from "../Help"
import * as Help from "../Help"
import type { Float, Integer } from "../Internal/NewType"
import * as PathType from "../PathType"
import * as Primitive from "../PrimType"
import type { ShellType } from "../ShellType"
import type { UsageSynopsis } from "../UsageSynopsis"
import * as Synopsis from "../UsageSynopsis"
import type { ValidationError } from "../Validation"
import * as Validation from "../Validation"
import { Both } from "./_internal/Both"
import { Map } from "./_internal/Map"
import { Mapping } from "./_internal/Mapping"
import { None } from "./_internal/None"
import { OrElse } from "./_internal/OrElse"
import { Single } from "./_internal/Single"
import { WithDefault } from "./_internal/WithDefault"
import type { Instruction, Options, SingleModifier } from "./definition"

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const none: Options<void> = new None()

function makeBoolean(name: string, ifPresent: boolean, negationNames: Array<string>) {
  const option = new Single(name, A.empty(), new Primitive.Bool(O.some(ifPresent)))

  return A.foldLeft_(
    negationNames,
    () => withDefault_(option, !ifPresent, showBoolean),
    (head, tail) => {
      const negationOption = new Single(
        head,
        tail,
        new Primitive.Bool(O.some(!ifPresent))
      )
      return withDefault_(orElse_(option, negationOption), !ifPresent, showBoolean)
    }
  )
}

/**
 * Creates a boolean flag with the specified name, which, if present, will
 * produce the specified constant boolean value.
 */
export function boolean(name: string, ifPresent = true): Options<boolean> {
  return makeBoolean(name, ifPresent, A.empty())
}

/**
 * Creates a boolean flag with the specified name, which, if present, will
 * produce the specified constant boolean value.
 *
 * Additional negation names can be specified to explicitly invert the boolean
 * value of this option.
 */
export function negatableBoolean(
  name: string,
  ifPresent: boolean,
  negationName: string,
  ...negationNames: Array<string>
): Options<boolean> {
  return makeBoolean(name, ifPresent, A.prepend_(negationNames, negationName))
}

/**
 * Creates a parameter which will accept one value from a set of allowed values.
 */
export function enumeration<A>(
  name: string,
  cases: Array<Tuple<[string, A]>>
): Options<A> {
  return new Single(name, A.empty(), new Primitive.Enumeration(cases))
}

/**
 * Creates a parameter which expects a path to a file.
 */
export function file(name: string, exists: Exists = Exist.either): Options<string> {
  return new Single(name, A.empty(), new Primitive.Path(PathType.file, exists))
}

/**
 * Creates a parameter which expects a path to a directory.
 */
export function directory(
  name: string,
  exists: Exists = Exist.either
): Options<string> {
  return new Single(name, A.empty(), new Primitive.Path(PathType.directory, exists))
}

/**
 * Creates a parameter expecting a text value.
 */
export function text(name: string): Options<string> {
  return new Single(name, A.empty(), new Primitive.Text())
}

/**
 * Creates a parameter expecting an float value.
 */
export function float(name: string): Options<Float> {
  return new Single(name, A.empty(), new Primitive.Float())
}

/**
 * Creates a parameter expecting an integer value.
 */
export function integer(name: string): Options<Integer> {
  return new Single(name, A.empty(), new Primitive.Integer())
}

/**
 * Creates a parameter expecting a date value.
 */
export function date(name: string): Options<Date> {
  return new Single(name, A.empty(), new Primitive.Date())
}

export function mapping(name: string): Options<PredefMap.Map<string, string>> {
  return mappingFromOption(new Single(name, A.empty(), new Primitive.Text()))
}

export function mappingFromOption(
  argumentOption: Single<string>
): Options<PredefMap.Map<string, string>> {
  return new Mapping(argumentOption.name, argumentOption)
}

// -----------------------------------------------------------------------------
// Combinators
// -----------------------------------------------------------------------------

export function withDescription_<A>(
  self: Options<A>,
  description: string | HelpDoc
): Options<A> {
  return modifySingle_(
    self,
    (single) =>
      new Single(
        single.name,
        single.aliases,
        single.primType,
        Help.concat_(
          Help.p(single.description),
          typeof description === "string" ? Help.text(description) : description
        ),
        single.completions
      )
  )
}

/**
 * @ets_data_first withDescription_
 */
export function withDescription(description: string | HelpDoc) {
  return <A>(self: Options<A>): Options<A> => withDescription_(self, description)
}

export function withDefault_<A>(
  self: Options<A>,
  defaultValue: A,
  showDefaultValue: Show<A>,
  defaultDescription?: string
): Options<A> {
  return new WithDefault(
    self,
    defaultValue,
    showDefaultValue,
    defaultDescription ? O.some(defaultDescription) : O.none
  )
}

/**
 * @ets_data_first withDefault_
 */
export function withDefault<A>(
  defaultValue: A,
  showDefaultValue: Show<A>,
  defaultDescription?: string
) {
  return (self: Options<A>): Options<A> =>
    withDefault_(self, defaultValue, showDefaultValue, defaultDescription)
}

/**
 * Registers a custom shell completion function with a `Command`.
 *
 * @param self The command to which the custom completion function will be added.
 * @param completion The completion function to register.
 */
export function withCustomCompletion_<A>(
  self: Options<A>,
  completion: Completion<Options<A>>
): Options<A> {
  return matchTag_(instruction(self), {
    Both: (_) =>
      new Both(
        withCustomCompletion_(_.head, completion),
        withCustomCompletion_(_.tail, completion)
      ),
    Map: (_) => new Map(withCustomCompletion_(_.value, completion), _.map),
    Mapping: (_) =>
      new Mapping(
        _.argumentName,
        withCustomCompletion_(_.argumentOption as any, completion) as any
      ),
    None: () => new None(),
    OrElse: (_) =>
      new OrElse(
        withCustomCompletion_(_.left, completion),
        withCustomCompletion_(_.right, completion)
      ),
    Single: (_) =>
      new Single(
        _.name,
        _.aliases,
        _.primType,
        _.description,
        A.append_(_.completions, completion)
      ),
    WithDefault: (_) =>
      new WithDefault(
        withCustomCompletion_(_.options, completion),
        _.defaultValue,
        _.showDefaultValue,
        _.defaultDescription
      )
  }) as Options<A>
}

/**
 * Registers a custom shell completion function with a `Command`.
 *
 * **Note**: registering a custom shell completion function for an option will
 * override the default completions for the option.
 *
 * @ets_data_first withCustomCompletion_
 * @param completion The completion function to register.
 */
export function withCustomCompletion<A>(completion: Completion<Options<A>>) {
  return (self: Options<A>): Options<A> => withCustomCompletion_(self, completion)
}

export function optional_<A>(
  self: Options<A>,
  showDefaultValue: Show<A>,
  defaultDescription?: string
): Options<O.Option<A>> {
  return withDefault_(
    map_(self, O.some),
    O.none,
    O.getShow<A>(showDefaultValue),
    defaultDescription
  )
}

/**
 * @ets_data_first optional_
 */
export function optional<A>(showDefaultValue: Show<A>, defaultDescription?: string) {
  return (self: Options<A>): Options<O.Option<A>> =>
    optional_(self, showDefaultValue, defaultDescription)
}

export function alias_<A>(
  self: Options<A>,
  name: string,
  ...names: Array<string>
): Options<A> {
  return modifySingle_(
    self,
    (single) =>
      new Single(
        single.name,
        A.concat_(A.prepend_(names, name), single.aliases),
        single.primType,
        single.description,
        single.completions
      )
  )
}

/**
 * @ets_data_first alias_
 */
export function alias(name: string, ...names: Array<string>) {
  return <A>(self: Options<A>): Options<A> => alias_(self, name, ...names)
}

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

/**
 * @ets_tagtimize identity
 */
export function instruction<A>(self: Options<A>): Instruction {
  // @ts-expect-error
  return self
}

export function map_<A, B>(self: Options<A>, f: (a: A) => B): Options<B> {
  return new Map(self, (a) => E.right(f(a)))
}

/**
 * @ets_data_first map_
 */
export function map<A, B>(f: (a: A) => B) {
  return (self: Options<A>): Options<B> => map_(self, f)
}

export function mapOrFail_<A, B>(
  self: Options<A>,
  f: (a: A) => Either<ValidationError, B>
): Options<B> {
  return new Map(self, f)
}

/**
 * @ets_data_first mapOrFail_
 */
export function mapOrFail<A, B>(f: (a: A) => Either<ValidationError, B>) {
  return (self: Options<A>): Options<B> => mapOrFail_(self, f)
}

export function zip_<A, B>(self: Options<A>, that: Options<B>): Options<Tuple<[A, B]>> {
  return new Both(self, that)
}

/**
 * @ets_data_first zip_
 */
export function zip<B>(that: Options<B>) {
  return <A>(self: Options<A>): Options<Tuple<[A, B]>> => zip_(self, that)
}

export function orElse_<A, B>(self: Options<A>, that: Options<B>): Options<A | B> {
  return map_(orElseEither_(self, that), E.merge)
}

/**
 * @ets_data_first orElse_
 */
export function orElse<B>(that: Options<B>) {
  return <A>(self: Options<A>): Options<A | B> => orElse_(self, that)
}

export function orElseEither_<A, B>(
  self: Options<A>,
  that: Options<B>
): Options<Either<A, B>> {
  return new OrElse(self, that)
}

/**
 * @ets_data_first orElseEither_
 */
export function orElseEither<B>(that: Options<B>) {
  return <A>(self: Options<A>): Options<Either<A, B>> => orElseEither_(self, that)
}

/**
 * Return the unique identifier for a command-line option.
 */
export function uid<A>(self: Options<A>): Option<string> {
  return matchTag_(instruction(self), {
    Both: (_) => {
      const uids = A.compact([uid(_.head), uid(_.tail)])
      return uids.length === 0 ? O.none : O.some(uids.join(", "))
    },
    Map: (_) => uid(_.value),
    Mapping: (_) => uid(_.argumentOption),
    None: () => O.none,
    OrElse: (_) => {
      const uids = A.compact([uid(_.left), uid(_.right)])
      return uids.length === 0 ? O.none : O.some(uids.join(", "))
    },
    Single: (_) => O.some(makeFullName(_.name)),
    WithDefault: (_) => uid(_.options)
  })
}

/**
 * Return the `HelpDoc` for a command-line option.
 */
export function helpDoc<A>(self: Options<A>): HelpDoc {
  return matchTag_(instruction(self), {
    Both: (_) => Help.sequence_(helpDoc(_.head), helpDoc(_.tail)),
    Map: (_) => helpDoc(_.value),
    Mapping: (_) => helpDoc(_.argumentOption),
    None: () => Help.empty,
    OrElse: (_) => Help.sequence_(helpDoc(_.left), helpDoc(_.right)),
    Single: (_) => {
      const allNames = A.prepend_(
        A.map_(_.aliases, (alias) => `--${alias}`),
        `--${_.name}`
      )

      const names = Help.spans(
        A.mapWithIndex_(allNames, (index, span) =>
          index !== allNames.length - 1
            ? Help.concat_(Help.text(span), Help.text(", "))
            : Help.text(span)
        )
      )

      return Help.descriptionList(
        A.single(
          Tp.tuple(
            names,
            Help.p(Help.sequence_(Primitive.helpDoc(_.primType), _.description))
          )
        )
      )
    },
    WithDefault: (_) =>
      Help.mapDescriptionList_(helpDoc(_.options), (definition) => {
        const span = definition.get(0)
        const block = definition.get(1)
        return Tp.tuple(
          span,
          Help.sequence_(
            block,
            Help.text(
              `This setting is optional. If unspecified, the default value of ` +
                `this option is '${_.showDefaultValue.show(_.defaultValue)}'` +
                `. ${O.getOrElse_(_.defaultDescription, () => "")}`
            )
          )
        )
      })
  })
}

/**
 * Return the `UsageSynopsis` for a command-line option.
 */
export function synopsis<A>(self: Options<A>): UsageSynopsis {
  return matchTag_(instruction(self), {
    Both: (_) => Synopsis.concat_(synopsis(_.head), synopsis(_.tail)),
    Map: (_) => synopsis(_.value),
    Mapping: (_) => synopsis(_.argumentOption),
    None: () => Synopsis.none,
    OrElse: (_) => Synopsis.concat_(synopsis(_.left), synopsis(_.right)),
    Single: (_) => Synopsis.named(makeFullName(_.name), Primitive.choices(_.primType)),
    WithDefault: (_) => synopsis(_.options)
  })
}

/**
 * Generate shell completions for the specified `Command`.
 *
 * @param self The command to generate completions for.
 * @param args The command-line arguments to parse.
 * @param shellType The shell to generate completions for.
 */
export function completions_<A>(
  self: Options<A>,
  args: NonEmptyArray<string>,
  shellType: ShellType
): T.UIO<Set<string>> {
  return pipe(
    instruction(self),
    T.matchTag({
      Both: (_) =>
        pipe(
          T.tuplePar(
            completions_(_.head, args, shellType),
            completions_(_.tail, args, shellType)
          ),
          T.map(([headCompletions, tailCompletions]) =>
            S.union_(Equal.string)(headCompletions, tailCompletions)
          )
        ),
      Map: (_) => completions_(_.value, args, shellType),
      Mapping: (_) => completions_(_.argumentOption, args, shellType),
      None: (_) => T.succeed<Set<string>>(S.empty),
      OrElse: (_) =>
        pipe(
          T.tuplePar(
            completions_(_.left, args, shellType),
            completions_(_.right, args, shellType)
          ),
          T.map(([leftCompletions, rightCompletions]) =>
            S.union_(Equal.string)(leftCompletions, rightCompletions)
          )
        ),
      Single: (_) => {
        const name = makeFullName(_.name)
        const aliases = A.map_(_.aliases, makeFullName)

        const argsContainsName = args.includes(name)
        const argsContainsAlias = A.isNonEmpty(
          A.intersection_(Equal.string)(aliases, args)
        )

        /**
         * Avoid adding the option to the completions set if:
         *  1. The arguments already include the option name
         *  2. The arguments already include an alias for the option
         */
        if (argsContainsName || argsContainsAlias) {
          return T.succeed<Set<string>>(S.empty)
        }

        return A.isNonEmpty(_.completions)
          ? pipe(
              _.completions,
              T.forEach((f) => f(_, args, shellType)),
              T.map(C.foldMap(S.getUnionIdentity(Equal.string))(identity as any))
            )
          : T.succeed(getOptionsCompletions(_, shellType))
      },
      WithDefault: (_) => completions_(_.options, args, shellType)
    })
  )
}

/**
 * Generate shell completions for the specified `Command`.
 *
 * @ets_data_first completions_
 * @param args The command-line arguments to parse.
 * @param shellType The shell to generate completions for.
 */
export function completions(args: NonEmptyArray<string>, shellType: ShellType) {
  return <A>(self: Options<A>): T.UIO<Set<string>> =>
    completions_(self, args, shellType)
}

/**
 * Validates an option against the provided command-line arguments.
 *
 * @param self The option to validate.
 * @param args The command-line arguments to validate.
 * @param config The `CliConfig` to use for validation.
 */
export function validate_<A>(
  self: Options<A>,
  args: Array<string>,
  config: CliConfig = Config.defaultConfig
): T.IO<ValidationError, Tuple<[Array<string>, A]>> {
  return matchTag_(instruction(self), {
    Both: (_) =>
      pipe(
        validate_(_.head, args, config),
        T.catchAll((err1) =>
          pipe(
            validate_(_.tail, args, config),
            T.foldM(
              (err2) =>
                T.fail(Validation.missingValue(Help.sequence_(err1.help, err2.help))),
              () => T.fail(err1)
            )
          )
        ),
        T.chain(({ tuple: [args1, a] }) =>
          pipe(
            validate_(_.tail, args1, config),
            T.map(({ tuple: [args2, b] }) => Tp.tuple(args2, Tp.tuple(a, b)))
          )
        )
      ),
    Map: (_) =>
      pipe(
        validate_(_.value, args, config),
        T.chain((result) =>
          pipe(
            _.map(result.get(1)),
            E.fold(T.fail, (a) => T.succeed(Tp.tuple(result.get(0), a)))
          )
        )
      ),
    Mapping: (_) =>
      pipe(
        validate_(_.argumentOption, args, config),
        T.map(({ tuple: [args, first] }) =>
          processMappingArguments(_, args, first, config)
        )
      ),
    None: () => T.succeed(Tp.tuple(args, undefined)),
    OrElse: (_) =>
      pipe(
        validate_(_.left, args, config),
        T.foldM(
          (err1) =>
            pipe(
              validate_(_.right, args, config),
              T.foldM(
                (err2) => {
                  if (err1._tag === "MissingValue" && err2._tag === "MissingValue") {
                    return T.fail(
                      Validation.missingValue(Help.sequence_(err1.help, err2.help))
                    )
                  } else {
                    return T.fail(
                      Validation.invalidValue(Help.sequence_(err1.help, err2.help))
                    )
                  }
                },
                (a) => T.succeed(Tp.tuple(a.get(0), E.right(a.get(1))))
              )
            ),
          (result) =>
            pipe(
              validate_(_.right, result.get(0), config),
              T.foldM(
                () => T.succeed(Tp.tuple(result.get(0), E.left(result.get(1)))),
                () =>
                  T.fail(
                    Validation.invalidValue(
                      Help.p(
                        Help.error(
                          "Options collision detected. You can only specify " +
                            `either '${O.getOrElse_(uid(_.left), () => "unknown")}' ` +
                            `or '${O.getOrElse_(uid(_.right), () => "unknown")}'.`
                        )
                      )
                    )
                  )
              )
            )
        )
      ),
    Single: (_) => {
      const name = makeFullName(_.name)
      const names = A.prepend_(A.map_(_.aliases, makeFullName), name)
      return A.foldLeft_(
        args,
        () =>
          T.fail(
            Validation.missingValue(
              Help.p(Help.error(`Expected to find '${name}' option.`))
            )
          ),
        (head, tail) => {
          if (supports(head, names, config)) {
            const PrimitiveInstruction = Primitive.instruction(_.primType)
            if (PrimitiveInstruction._tag === "Bool") {
              return T.bimap_(
                Primitive.validate_(_.primType, O.none, config),
                (e) => Validation.invalidValue(Help.p(e)),
                (a) => Tp.tuple(tail, a)
              )
            }
            return T.bimap_(
              Primitive.validate_(_.primType, A.head(tail), config),
              (e) => Validation.invalidValue(Help.p(e)),
              (a) => Tp.tuple(A.drop_(tail, 1), a)
            )
          }
          if (
            _.name.length > config.autoCorrectLimit + 1 &&
            AutoCorrect.levensteinDistance(head, name, config) <=
              config.autoCorrectLimit
          ) {
            return T.fail(
              Validation.missingValue(
                Help.p(
                  Help.error(
                    `The flag '${head}' is not recognized. Did you mean '${name}'?`
                  )
                )
              )
            )
          }
          return pipe(validate_(_, tail, config), T.map(Tp.update(0, A.prepend(head))))
        }
      )
    },
    WithDefault: (_) =>
      pipe(
        validate_(_.options, args, config),
        T.catchSome((err) =>
          Validation.isMissingValue(err)
            ? O.some(T.succeed(Tp.tuple(args, _.defaultValue)))
            : O.none
        )
      )
  }) as T.IO<ValidationError, Tuple<[Array<string>, A]>>
}

/**
 * Validates an option against the provided command-line arguments.
 *
 * @ets_data_first validate
 * @param args The command-line arguments to validate.
 * @param config The `CliConfig` to use for validation.
 */
export function validate(
  args: Array<string>,
  config: CliConfig = Config.defaultConfig
) {
  return <A>(self: Options<A>): T.IO<ValidationError, Tuple<[Array<string>, A]>> =>
    validate_(self, args, config)
}

/**
 * Modify a `Single` option.
 *
 * @param self The option to modify.
 * @param modifier The function which can be used to modify a `Single` option.
 */
export function modifySingle_<A>(
  self: Options<A>,
  modifier: SingleModifier
): Options<A> {
  return matchTag_(instruction(self), {
    Both: (_) =>
      new Both(modifySingle_(_.head, modifier), modifySingle_(_.tail, modifier)),
    Map: (_) => new Map(modifySingle_(_.value, modifier), _.map),
    Mapping: (_) => new Mapping(_.argumentName, modifier(_.argumentOption)),
    None: identity,
    OrElse: (_) =>
      new OrElse(modifySingle_(_.left, modifier), modifySingle_(_.right, modifier)),
    Single: modifier,
    WithDefault: (_) =>
      new WithDefault(
        modifySingle_(_.options, modifier),
        _.defaultValue,
        _.showDefaultValue,
        _.defaultDescription
      )
  }) as Options<A>
}

/**
 * Modify a `Single` option.
 *
 * @ets_data_first modifySingle_
 * @param modifier The function which can be used to modify a `Single` option.
 */
export function modifySingle(modifier: SingleModifier) {
  return <A>(self: Options<A>): Options<A> => modifySingle_(self, modifier)
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function makeFullName(s: string): string {
  return s.length === 1 ? `-${s}` : `--${s}`
}

const equalsIgnoreCase: Equal.Equal<string> = Equal.contramap((s: string) =>
  s.toLowerCase()
)(Equal.string)

function supports(name: string, names: Array<string>, conf: CliConfig): boolean {
  return conf.caseSensitive
    ? A.elem_(Equal.string)(names, name)
    : A.elem_(equalsIgnoreCase)(names, name)
}

function createMapEntry(args: string): Tuple<[string, string]> {
  const arr = A.take_(args.split("="), 2)
  return Tp.tuple(arr[0], arr[1])
}

function createMapEntries(args: Array<string>): Array<Tuple<[string, string]>> {
  return pipe(
    args,
    A.filter((s) => !s.startsWith("-")),
    A.map(createMapEntry)
  )
}

function processMappingArguments(
  self: Mapping,
  args: Array<string>,
  first: string,
  config: CliConfig
): Tuple<[Array<string>, PredefMap.Map<string, string>]> {
  const names = pipe(
    self.argumentOption.aliases,
    A.map(makeFullName),
    A.prepend(makeFullName(self.argumentName))
  )
  return pipe(
    args,
    A.spanLeft((name) => !name.startsWith("-") || supports(name, names, config)),
    ({ init, rest }) =>
      Tp.tuple(
        rest,
        PredefMap.make(A.append_(createMapEntries(init), createMapEntry(first)))
      )
  )
}

function getOptionsCompletions<A>(
  options: Single<A>,
  shellType: ShellType
): Set<string> {
  const optionName = makeFullName(options.name)
  return matchTag_(shellType, {
    Bash: () => S.singleton(optionName),
    ZShell: () => {
      const optionDesc = pipe(
        Help.render_(options.description, Help.plainMode(80)),
        String.replace(/\n|\r\n/g, " ")
      )
      return S.singleton(`${optionName}:${optionDesc}`.trim())
    }
  })
}
