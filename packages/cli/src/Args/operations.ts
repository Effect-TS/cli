// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as E from "@effect-ts/core/Either"
import * as O from "@effect-ts/core/Option"
import type { NonEmptyArray } from "@effect-ts/system/Collections/Immutable/NonEmptyArray"
import type { Tuple } from "@effect-ts/system/Collections/Immutable/Tuple"

import type { Exists } from "../Exists"
import * as Exist from "../Exists"
import type { Float, Integer } from "../Internal/NewType"
import * as PathType from "../PathType"
import * as Primitive from "../PrimType"
import type { Args } from "./definition"
import { Cons, Map, None, Single, Variadic } from "./models"

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const none: Args<void> = new None()

export function cons_<A, B>(self: Args<A>, that: Args<B>): Args<Tuple<[A, B]>> {
  return new Cons(self, that)
}

/**
 * @ets_data_first
 */
export function cons<B>(that: Args<B>) {
  return <A>(self: Args<A>): Args<Tuple<[A, B]>> => cons_(self, that)
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
  ...cases: Array<Tuple<[string, A]>>
): Args<A> {
  return new Single(O.some(name), new Primitive.Enumeration(cases))
}

/**
 * Creates an enumeration argument with `"choice"` as the argument name.
 */
export function enumeration<A>(...cases: Array<Tuple<[string, A]>>): Args<A> {
  return new Single(O.none, new Primitive.Enumeration(cases))
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

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

export function map_<A, B>(self: Args<A>, f: (a: A) => B): Args<B> {
  return new Map(self, (a) => E.right(f(a)))
}

/**
 * @ets_data_first map_
 */
export function map<A, B>(f: (a: A) => B) {
  return (self: Args<A>): Args<B> => map_(self, f)
}
