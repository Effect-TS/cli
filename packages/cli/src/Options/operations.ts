import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import type { Either } from "@effect-ts/core/Either"
import * as E from "@effect-ts/core/Either"
import * as O from "@effect-ts/core/Option"
import type { Show } from "@effect-ts/core/Show"
import { boolean as showBoolean } from "@effect-ts/core/Show"

import type { Exists } from "../Exists"
import * as Exist from "../Exists"
import * as Help from "../Help"
import type { Float, Integer } from "../Internal/NewType"
import * as PathType from "../PathType"
import * as Primitive from "../PrimType"
import type { ValidationError } from "../Validation"
import type { Options } from "./definition"
import { Both, Map, None, OrElse, Single, WithDefault } from "./models"

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const none: Options<void> = new None()

function makeBoolean(name: string, ifPresent: boolean, negationNames: Array<string>) {
  const option = new Single(name, A.empty, new Primitive.Bool(O.some(ifPresent)))

  return A.foldLeft_(
    negationNames,
    () => withDefault_(option, !ifPresent, `${!ifPresent}`, showBoolean),
    (head, tail) => {
      const negationOption = new Single(
        head,
        tail,
        new Primitive.Bool(O.some(!ifPresent))
      )
      return withDefault_(
        orElse_(option, negationOption),
        !ifPresent,
        `${!ifPresent}`,
        showBoolean
      )
    }
  )
}

/**
 * Creates a boolean flag with the specified name, which, if present, will
 * produce the specified constant boolean value.
 */
export function boolean(name: string, ifPresent = true): Options<boolean> {
  return makeBoolean(name, ifPresent, A.empty)
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
  return makeBoolean(name, ifPresent, A.cons_(negationNames, negationName))
}

/**
 * Creates a parameter which will accept one value from a set of allowed values.
 */
export function enumeration<A>(
  name: string,
  cases: Array<Tuple<[string, A]>>
): Options<A> {
  return new Single(name, A.empty, new Primitive.Enumeration(cases))
}

/**
 * Creates a parameter which expects a path to a file.
 */
export function file(name: string, exists: Exists = Exist.either): Options<string> {
  return new Single(name, A.empty, new Primitive.Path(PathType.file, exists))
}

/**
 * Creates a parameter which expects a path to a directory.
 */
export function directory(
  name: string,
  exists: Exists = Exist.either
): Options<string> {
  return new Single(name, A.empty, new Primitive.Path(PathType.directory, exists))
}

/**
 * Creates a parameter expecting a text value.
 */
export function text(name: string): Options<string> {
  return new Single(name, A.empty, new Primitive.Text())
}

/**
 * Creates a parameter expecting an float value.
 */
export function float(name: string): Options<Float> {
  return new Single(name, A.empty, new Primitive.Float())
}

/**
 * Creates a parameter expecting an integer value.
 */
export function integer(name: string): Options<Integer> {
  return new Single(name, A.empty, new Primitive.Integer())
}

/**
 * Creates a parameter expecting a date value.
 */
export function date(name: string): Options<Date> {
  return new Single(name, A.empty, new Primitive.Date())
}

// -----------------------------------------------------------------------------
// Combinators
// -----------------------------------------------------------------------------

export function describe_<A>(self: Options<A>, description: string): Options<A> {
  return self.modifySingle(
    (single) =>
      new Single(
        single.name,
        single.aliases,
        single.primType,
        Help.sequence_(single.description, Help.p(description))
      )
  )
}

/**
 * @ets_data_first describe_
 */
export function describe(description: string) {
  return <A>(self: Options<A>): Options<A> => describe_(self, description)
}

export function withDefault_<A>(
  self: Options<A>,
  defaultValue: A,
  defaultDescription: string,
  showDefaultValue: Show<A>
): Options<A> {
  return new WithDefault(self, defaultValue, defaultDescription, showDefaultValue)
}

/**
 * @ets_data_first withDefault_
 */
export function withDefault<A>(
  defaultValue: A,
  defaultDescription: string,
  showDefaultValue: Show<A>
) {
  return (self: Options<A>): Options<A> =>
    withDefault_(self, defaultValue, defaultDescription, showDefaultValue)
}

export function optional_<A>(
  self: Options<A>,
  defaultDescription: string,
  showDefaultValue: Show<A>
): Options<O.Option<A>> {
  return withDefault_(
    map_(self, O.some),
    O.none,
    defaultDescription,
    O.getShow<A>(showDefaultValue)
  )
}

/**
 * @ets_data_first optional_
 */
export function optional<A>(defaultDescription: string, showDefaultValue: Show<A>) {
  return (self: Options<A>): Options<O.Option<A>> =>
    optional_(self, defaultDescription, showDefaultValue)
}

export function alias_<A>(
  self: Options<A>,
  name: string,
  ...names: Array<string>
): Options<A> {
  return self.modifySingle(
    (single) =>
      new Single(
        single.name,
        A.concatS_(A.cons_(names, name), single.aliases),
        single.primType,
        single.description
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
