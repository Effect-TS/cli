// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import { _A } from "@effect-ts/core/Effect"
import * as E from "@effect-ts/core/Either"
import { identity, pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import { matchTag_ } from "@effect-ts/core/Utils"

import type { CliConfig } from "../CliConfig/index.js"
import * as Config from "../CliConfig/index.js"
import type { Exists } from "../Exists/index.js"
import * as Exist from "../Exists/index.js"
import type { HelpDoc } from "../Help/index.js"
import * as Help from "../Help/index.js"
import type { Float, Integer } from "../Internal/NewType/index.js"
import * as PathType from "../PathType/index.js"
import * as Primitive from "../PrimType/index.js"
import type { UsageSynopsis } from "../UsageSynopsis/index.js"
import * as Synopsis from "../UsageSynopsis/index.js"
import { Both } from "./_internal/Both.js"
import { Map } from "./_internal/Map.js"
import { None } from "./_internal/None.js"
import { Single } from "./_internal/Single.js"
import { Variadic } from "./_internal/Variadic.js"
import type { Args, Instruction } from "./definition.js"

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const none: Args<void> = new None()

export function both_<A, B>(self: Args<A>, that: Args<B>): Args<Tuple<[A, B]>> {
  return new Both(self, that)
}

/**
 * @ets_data_first both_
 */
export function both<B>(that: Args<B>) {
  return <A>(self: Args<A>): Args<Tuple<[A, B]>> => both_(self, that)
}

/**
 * Creates a boolean argument with a custom argument name.
 */
export function namedBool(name: string): Args<boolean> {
  return new Single(O.some(name), new Primitive.Bool(O.none))
}

/**
 * Creates a boolean argument with `"boolean"` as the argument name.
 */
export const bool: Args<boolean> = new Single(O.none, new Primitive.Bool(O.none))

/**
 * Creates an enumeration argument with a custom argument name.
 */
export function namedEnumeration<A>(
  name: string,
  case0: Tuple<[string, A]>,
  ...cases: Array<Tuple<[string, A]>>
): Args<A> {
  return new Single(O.some(name), new Primitive.Enumeration(A.prepend_(cases, case0)))
}

/**
 * Creates an enumeration argument with `"choice"` as the argument name.
 */
export function enumeration<A>(
  case0: Tuple<[string, A]>,
  ...cases: Array<Tuple<[string, A]>>
): Args<A> {
  return new Single(O.none, new Primitive.Enumeration(A.prepend_(cases, case0)))
}

/**
 * Creates a file argument with a custom argument name.
 */
export function namedFile(name: string, exists: Exists = Exist.either): Args<string> {
  return new Single(O.some(name), new Primitive.Path(PathType.file, exists))
}

/**
 * Creates a file argument with `"file"` as the argument name.
 */
export function file(exists: Exists = Exist.either): Args<string> {
  return new Single(O.none, new Primitive.Path(PathType.file, exists))
}

/**
 * Creates a directory argument with a custom argument name.
 */
export function namedDirectory(
  name: string,
  exists: Exists = Exist.either
): Args<string> {
  return new Single(O.some(name), new Primitive.Path(PathType.directory, exists))
}

/**
 * Creates a directory argument with `"directory"` as the argument name.
 */
export function directory(exists: Exists = Exist.either): Args<string> {
  return new Single(O.none, new Primitive.Path(PathType.directory, exists))
}

/**
 * Creates a text argument with a custom argument name.
 */
export function namedText(name: string): Args<string> {
  return new Single(O.some(name), new Primitive.Text())
}

/**
 * Creates a text argument with `"text"` as the argument name.
 */
export const text: Args<string> = new Single(O.none, new Primitive.Text())

/**
 * Creates a float argument with a custom argument name.
 */
export function namedFloat(name: string): Args<Float> {
  return new Single(O.some(name), new Primitive.Float())
}

/**
 * Creates a float argument with `"float"` as the argument name.
 */
export const float: Args<Float> = new Single(O.none, new Primitive.Float())

/**
 * Creates an integer argument with a custom argument name.
 */
export function namedInteger(name: string): Args<Integer> {
  return new Single(O.some(name), new Primitive.Integer())
}

/**
 * Creates an integer argument with `"integer"` as the argument name.
 */
export const integer: Args<Integer> = new Single(O.none, new Primitive.Integer())

/**
 * Creates a date argument with a custom argument name.
 */
export function namedDate(name: string): Args<Date> {
  return new Single(O.some(name), new Primitive.Date())
}

/**
 * Creates a date argument with `"date"` as the argument name.
 */
export const date: Args<Date> = new Single(O.none, new Primitive.Date())

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

/**
 * @ets_tagtimize identity
 */
export function instruction<A>(self: Args<A>): Instruction {
  // @ts-expect-error
  return self
}

/**
 * Returns the minimum number of times that an argument can appear.
 */
export function minSize<A>(self: Args<A>): number {
  return matchTag_(instruction(self), {
    Both: (_) => minSize(_.head) + minSize(_.tail),
    Map: (_) => minSize(_.value),
    None: () => 0,
    Single: () => 1,
    Variadic: (_) => O.getOrElse_(_.min, () => 0) * minSize(_.value)
  })
}

/**
 * Returns the maximum number of times that an argument can appear.
 */
export function maxSize<A>(self: Args<A>): number {
  return matchTag_(instruction(self), {
    Both: (_) => maxSize(_.head) + maxSize(_.tail),
    Map: (_) => maxSize(_.value),
    None: () => 0,
    Single: () => 1,
    Variadic: (_) =>
      O.getOrElse_(_.min, () => Number.MAX_SAFE_INTEGER / 2) * maxSize(_.value)
  })
}

/**
 * Return the `HelpDoc` for an argument.
 */
export function helpDoc<A>(self: Args<A>): HelpDoc {
  return matchTag_(instruction(self), {
    Both: (_) => Help.concat_(helpDoc(_.head), helpDoc(_.tail)),
    Map: (_) => helpDoc(_.value),
    None: () => Help.empty,
    Single: (_) =>
      Help.descriptionList(
        A.single(
          Tp.tuple(
            Help.text(_.name),
            Help.orElse_(_.description, () => Help.p(Primitive.helpDoc(_.primType)))
          )
        )
      ),
    Variadic: (_) =>
      Help.mapDescriptionList_(helpDoc(_.value), ({ tuple: [name, description] }) => {
        const newName = Help.concat_(
          name,
          Help.text(
            O.isSome(_.max)
              ? ` ${minSize(_)} - ${maxSize(_)}`
              : minSize(_) === 0
              ? "..."
              : ` ${minSize(_)}+`
          )
        )

        const newDescription = Help.blocksT(
          description,
          Help.empty,
          Help.p(
            O.isSome(_.max)
              ? `This argument must be repeated at least ${minSize(_)} ` +
                  `times and may be repeated up to ${maxSize(_)} times.`
              : minSize(_) === 0
              ? `This argument may be repeated zero or more times.`
              : `This argument must be repeated at least ${minSize(_)} times.`
          )
        )

        return Tp.tuple(newName, newDescription)
      })
  })
}

/**
 * Return the `UsageSynopsis` for an argument.
 */
export function synopsis<A>(self: Args<A>): UsageSynopsis {
  return matchTag_(instruction(self), {
    Both: (_) => Synopsis.concat_(synopsis(_.head), synopsis(_.tail)),
    Map: (_) => synopsis(_.value),
    None: () => Synopsis.none,
    Single: (_) => Synopsis.named(_.name, Primitive.choices(_.primType)),
    Variadic: (_) => Synopsis.repeated(synopsis(_.value))
  })
}

export function addHelp_<A>(self: Args<A>, text: string): Args<A> {
  return matchTag_(instruction(self), {
    Both: (_) => new Both(addHelp_(_.head, text), addHelp_(_.tail, text)),
    Map: (_) => new Map(addHelp_(_.value, text), _.map),
    None: identity,
    Single: (_) =>
      new Single(_.pseudoName, _.primType, Help.concat_(_.description, Help.p(text))),
    Variadic: (_) => new Variadic(addHelp_(_.value, text), _.min, _.max)
  }) as Args<A>
}

/**
 * Adds an additional description block to the `HelpDoc` for an argument.
 *
 * @ets_data_first addHelp_
 * @param text The description to add.
 */
export function addHelp(text: string) {
  return <A>(self: Args<A>): Args<A> => addHelp_(self, text)
}

/**
 * Validates an argument against the provided command-line arguments.
 *
 * @param args The command-line arguments to validate.
 * @param config The `CliConfig` to use for validation. Defaults to `CliConfig.default`.
 */
export function validate_<A>(
  self: Args<A>,
  args: Array<string>,
  config: CliConfig = Config.defaultConfig
): T.IO<HelpDoc, Tuple<[Array<string>, A]>> {
  return matchTag_(instruction(self), {
    Both: (_) =>
      pipe(
        validate_(_.head, args, config),
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
        T.chain(({ tuple: [args, value] }) =>
          pipe(
            _.map(value),
            E.fold(T.fail, (b) => T.succeed(Tp.tuple(args, b)))
          )
        )
      ),
    None: () => T.succeed(Tp.tuple(args, undefined)),
    Single: (_) =>
      A.foldLeft_(
        args,
        () => {
          const pseudoName = _.pseudoName
          const choices = Primitive.choices(_.primType)

          if (O.isSome(pseudoName) && O.isSome(choices)) {
            return T.fail(
              Help.p(
                `Missing argument <${pseudoName.value}> with values ${choices.value}`
              )
            )
          }

          if (O.isSome(pseudoName)) {
            return T.fail(Help.p(`Missing argument <${pseudoName.value}>`))
          }

          if (O.isSome(choices)) {
            const typeName = Primitive.typeName(_.primType)
            return T.fail(
              Help.p(`Missing argument ${typeName} with values ${choices.value}`)
            )
          }

          const typeName = Primitive.typeName(_.primType)
          return T.fail(Help.p(`Missing argument ${typeName}`))
        },
        (head, tail) =>
          pipe(
            Primitive.validate_(_.primType, O.some(head), config),
            T.bimap(Help.p, (a) => Tp.tuple(tail, a))
          )
      ),
    Variadic: (_) => {
      const min = O.getOrElse_(_.min, () => 0)
      const max = O.getOrElse_(_.max, () => Number.MAX_SAFE_INTEGER)
      const value = _.value

      function loop(
        args: Array<string>,
        acc: Array<A>
      ): T.IO<HelpDoc, Tuple<[Array<string>, Array<A>]>> {
        if (acc.length >= max) {
          return T.succeed(Tp.tuple(args, acc))
        } else {
          return T.foldM_(
            validate_(value, args, config),
            (failure) =>
              acc.length >= min && A.isEmpty(args)
                ? T.succeed(Tp.tuple(args, acc))
                : T.fail(failure),
            ({ tuple: [args, a] }) => loop(args, A.prepend_(acc, a))
          )
        }
      }

      return T.map_(loop(args, A.empty<A>()), Tp.update(1, A.reverse))
    }
  }) as T.IO<HelpDoc, Tuple<[Array<string>, A]>>
}

export function map_<A, B>(self: Args<A>, f: (a: A) => B): Args<B> {
  return new Map(self, (a) => E.right(f(a)))
}

/**
 * @ets_data_first map_
 */
export function map<A, B>(f: (a: A) => B) {
  return (self: Args<A>): Args<B> => map_(self, f)
}

// -----------------------------------------------------------------------------
// Combinators
// -----------------------------------------------------------------------------

export function atLeast_<A>(self: Args<A>, min: number): Args<Array<A>> {
  return new Variadic(self, O.some(min), O.none)
}

/**
 * @ets_data_first atLeast_
 */
export function atLeast(min: number) {
  return <A>(self: Args<A>): Args<Array<A>> => atLeast_(self, min)
}

export function atMost_<A>(self: Args<A>, max: number): Args<Array<A>> {
  return new Variadic(self, O.none, O.some(max))
}

/**
 * @ets_data_first atMost_
 */
export function atMost(min: number) {
  return <A>(self: Args<A>): Args<Array<A>> => atMost_(self, min)
}

export function between_<A>(self: Args<A>, min: number, max: number): Args<Array<A>> {
  return new Variadic(self, O.some(min), O.some(max))
}

/**
 * @ets_data_first between_
 */
export function between(min: number, max: number) {
  return <A>(self: Args<A>): Args<Array<A>> => between_(self, min, max)
}

export function repeat<A>(self: Args<A>): Args<Array<A>> {
  return new Variadic(self, O.none, O.none)
}

export function repeat1<A>(self: Args<A>): Args<NonEmptyArray<A>> {
  return map_(new Variadic(self, O.some(1), O.none), (as) => {
    if (A.isNonEmpty(as)) {
      return as
    }
    throw new Error("bug, variadic argument is not respecting the minimum")
  })
}
