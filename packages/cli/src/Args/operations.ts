// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import type * as T from "@effect-ts/core/Effect"
import { _A } from "@effect-ts/core/Effect"
import * as E from "@effect-ts/core/Either"
import { identity } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import { matchTag_ } from "@effect-ts/core/Utils"

import type { CliConfig } from "../CliConfig"
import * as Config from "../CliConfig"
import type { Exists } from "../Exists"
import * as Exist from "../Exists"
import type { HelpDoc } from "../Help"
import type { Float, Integer } from "../Internal/NewType"
import * as PathType from "../PathType"
import * as Primitive from "../PrimType"
import type { UsageSynopsis } from "../UsageSynopsis"
import * as Arguments from "./_internal"
import type { Args, Instruction } from "./definition"

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const none: Args<void> = new Arguments.None()

export function both_<A, B>(self: Args<A>, that: Args<B>): Args<Tuple<[A, B]>> {
  return new Arguments.Both(self, that)
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
  return new Arguments.Single(O.some(name), new Primitive.Bool(O.none))
}

/**
 * Creates a boolean argument with `"boolean"` as the argument name.
 */
export const bool: Args<boolean> = new Arguments.Single(
  O.none,
  new Primitive.Bool(O.none)
)

/**
 * Creates an enumeration argument with a custom argument name.
 */
export function namedEnumeration<A>(
  name: string,
  case0: Tuple<[string, A]>,
  ...cases: Array<Tuple<[string, A]>>
): Args<A> {
  return new Arguments.Single(
    O.some(name),
    new Primitive.Enumeration(A.cons_(cases, case0))
  )
}

/**
 * Creates an enumeration argument with `"choice"` as the argument name.
 */
export function enumeration<A>(
  case0: Tuple<[string, A]>,
  ...cases: Array<Tuple<[string, A]>>
): Args<A> {
  return new Arguments.Single(O.none, new Primitive.Enumeration(A.cons_(cases, case0)))
}

/**
 * Creates a file argument with a custom argument name.
 */
export function namedFile(name: string, exists: Exists = Exist.either): Args<string> {
  return new Arguments.Single(O.some(name), new Primitive.Path(PathType.file, exists))
}

/**
 * Creates a file argument with `"file"` as the argument name.
 */
export function file(exists: Exists = Exist.either): Args<string> {
  return new Arguments.Single(O.none, new Primitive.Path(PathType.file, exists))
}

/**
 * Creates a directory argument with a custom argument name.
 */
export function namedDirectory(
  name: string,
  exists: Exists = Exist.either
): Args<string> {
  return new Arguments.Single(
    O.some(name),
    new Primitive.Path(PathType.directory, exists)
  )
}

/**
 * Creates a directory argument with `"directory"` as the argument name.
 */
export function directory(exists: Exists = Exist.either): Args<string> {
  return new Arguments.Single(O.none, new Primitive.Path(PathType.directory, exists))
}

/**
 * Creates a text argument with a custom argument name.
 */
export function namedText(name: string): Args<string> {
  return new Arguments.Single(O.some(name), new Primitive.Text())
}

/**
 * Creates a text argument with `"text"` as the argument name.
 */
export const text: Args<string> = new Arguments.Single(O.none, new Primitive.Text())

/**
 * Creates a float argument with a custom argument name.
 */
export function namedFloat(name: string): Args<Float> {
  return new Arguments.Single(O.some(name), new Primitive.Float())
}

/**
 * Creates a float argument with `"float"` as the argument name.
 */
export const float: Args<Float> = new Arguments.Single(O.none, new Primitive.Float())

/**
 * Creates an integer argument with a custom argument name.
 */
export function namedInteger(name: string): Args<Integer> {
  return new Arguments.Single(O.some(name), new Primitive.Integer())
}

/**
 * Creates an integer argument with `"integer"` as the argument name.
 */
export const integer: Args<Integer> = new Arguments.Single(
  O.none,
  new Primitive.Integer()
)

/**
 * Creates a date argument with a custom argument name.
 */
export function namedDate(name: string): Args<Date> {
  return new Arguments.Single(O.some(name), new Primitive.Date())
}

/**
 * Creates a date argument with `"date"` as the argument name.
 */
export const date: Args<Date> = new Arguments.Single(O.none, new Primitive.Date())

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
    None: () => Arguments.noneMinSize,
    Single: () => Arguments.singleMinSize,
    Map: (_) => Arguments.getMapMinSize_(_, minSize),
    Both: (_) => Arguments.getBothMinSize_(_, minSize),
    Variadic: (_) => Arguments.getVariadicMinSize_(_, minSize)
  })
}

/**
 * Returns the maximum number of times that an argument can appear.
 */
export function maxSize<A>(self: Args<A>): number {
  return matchTag_(instruction(self), {
    None: () => Arguments.noneMaxSize,
    Single: () => Arguments.singleMaxSize,
    Map: (_) => Arguments.getMapMaxSize_(_, maxSize),
    Both: (_) => Arguments.getBothMaxSize_(_, maxSize),
    Variadic: (_) => Arguments.getVariadicMaxSize_(_, maxSize)
  })
}

/**
 * Return the `HelpDoc` for an argument.
 */
export function helpDoc<A>(self: Args<A>): HelpDoc {
  return matchTag_(instruction(self), {
    None: () => Arguments.noneHelpDoc,
    Single: Arguments.getSingleHelpDoc,
    Map: (_) => Arguments.getMapHelpDoc_(_, helpDoc),
    Both: (_) => Arguments.getBothHelpDoc_(_, helpDoc),
    Variadic: (_) => Arguments.getVariadicHelpDoc_(_, helpDoc, minSize, maxSize)
  })
}

/**
 * Return the `UsageSynopsis` for an argument.
 */
export function synopsis<A>(self: Args<A>): UsageSynopsis {
  return matchTag_(instruction(self), {
    None: () => Arguments.noneUsageSynopsis,
    Single: Arguments.getSingleUsageSynopsis,
    Map: (_) => Arguments.getMapUsageSynopsis_(_, synopsis),
    Both: (_) => Arguments.getBothUsageSynopsis_(_, synopsis),
    Variadic: (_) => Arguments.getVariadicUsageSynopsis_(_, synopsis)
  })
}

export function addDescription_<A>(self: Args<A>, text: string): Args<A> {
  return matchTag_(instruction(self), {
    None: identity,
    Single: Arguments.addSingleDescription(text),
    Map: (_) => Arguments.addMapDescription_(_, text, addDescription(text)),
    Both: (_) => Arguments.addBothDescription_(_, text, addDescription(text)),
    Variadic: (_) => Arguments.addVariadicDescription_(_, text, addDescription(text))
  }) as Args<A>
}

/**
 * Adds an additional description block to the `HelpDoc` for an argument.
 *
 * @ets_data_first addDescription_
 * @param text The description to add.
 */
export function addDescription(text: string) {
  return <A>(self: Args<A>): Args<A> => addDescription_(self, text)
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
    None: () => Arguments.validateNone(args),
    Single: Arguments.validateSingle(args, config),
    Map: (_) => Arguments.validateMap_(_, args, config, validate_),
    Both: (_) => Arguments.validateBoth_(_, args, config, validate_),
    Variadic: (_) => Arguments.validateVariadic_(_, args, config, validate_)
  })
}

export function map_<A, B>(self: Args<A>, f: (a: A) => B): Args<B> {
  return new Arguments.Map(self, (a) => E.right(f(a)))
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
  return new Arguments.Variadic(self, O.some(min), O.none)
}

/**
 * @ets_data_first atLeast_
 */
export function atLeast(min: number) {
  return <A>(self: Args<A>): Args<Array<A>> => atLeast_(self, min)
}

export function atMost_<A>(self: Args<A>, max: number): Args<Array<A>> {
  return new Arguments.Variadic(self, O.none, O.some(max))
}

/**
 * @ets_data_first atMost_
 */
export function atMost(min: number) {
  return <A>(self: Args<A>): Args<Array<A>> => atMost_(self, min)
}

export function between_<A>(self: Args<A>, min: number, max: number): Args<Array<A>> {
  return new Arguments.Variadic(self, O.some(min), O.some(max))
}

/**
 * @ets_data_first between_
 */
export function between(min: number, max: number) {
  return <A>(self: Args<A>): Args<Array<A>> => between_(self, min, max)
}

export function repeat<A>(self: Args<A>): Args<Array<A>> {
  return new Arguments.Variadic(self, O.none, O.none)
}

export function repeat1<A>(self: Args<A>): Args<NonEmptyArray<A>> {
  return map_(new Arguments.Variadic(self, O.some(1), O.none), (as) => {
    if (A.isNonEmpty(as)) {
      return as
    }
    throw new Error("bug, variadic argument is not respecting the minimum")
  })
}
