// ets_tracing: off

import { Case } from "@effect-ts/core/Case"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import type { Equal } from "@effect-ts/core/Equal"
import * as Eq from "@effect-ts/core/Equal"
import { pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import type { Show } from "@effect-ts/core/Show"
import { makeShow } from "@effect-ts/core/Show"
import * as String from "@effect-ts/core/String"
import * as Structural from "@effect-ts/core/Structural"

import { escapeRegExp, transpose } from "../_internal"
import { SubLines } from "../SubLines"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export class SubColumns extends Case<{
  readonly value: Chunk<string>
}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Create an instance of `SubColumns` from a pure value.
 */
export function fromValue(value: Chunk<string>): SubColumns {
  return new SubColumns({ value })
}

/**
 * Create a one-column `SubColumns` object of the specified height.
 *
 * @param height The number of columns that compose this `SubColumns` object.
 */
export function zero(width: number): SubColumns {
  return new SubColumns({ value: C.single(" ".repeat(width)) })
}

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

/**
 * Get the number of lines that compose this instance of `SubColumns`.
 */
export function height(self: SubColumns): number {
  return O.getOrElse_(C.head(C.map_(self.value, (_) => _.length)), () => 0)
}

export function toSubLines(self: SubColumns): SubLines {
  return new SubLines({
    value: pipe(
      C.toArray(self.value),
      A.map(String.split("")),
      transpose,
      A.map(A.join("")),
      C.from
    )
  })
}

/**
 * Gets the length of the `SubColumns`.
 */
export function length(self: SubColumns): number {
  return self.value.length
}

/**
 * Apply a function to each element to obtain a new `SubColumns`.
 */
export function map_(self: SubColumns, f: (s: string) => string): SubColumns {
  return fromValue(C.map_(self.value, f))
}

/**
 * Apply a function to each element to obtain a new `SubColumns`.
 *
 * @ets_data_first map_
 */
export function map(f: (s: string) => string) {
  return (self: SubColumns): SubColumns => map_(self, f)
}

/**
 * Applies a function to each element of the `SubColumns`.
 */
export function foreach_<U>(self: SubColumns, f: (s: string) => U): void {
  return C.forEach_(self.value, f)
}

/**
 * Applies a function to each element of the `SubColumns`.
 *
 * @ets_data_first foreach_
 */
export function foreach<U>(f: (s: string) => U) {
  return (self: SubColumns): void => foreach_(self, f)
}

/**
 * Replaces a string value looking inside each element of the `SubColumns`.
 */
export function replace_(
  self: SubColumns,
  oldValue: string,
  newValue: string
): SubColumns {
  return pipe(
    self.value,
    C.map(String.replace(new RegExp(escapeRegExp(oldValue), "g"), newValue)),
    fromValue
  )
}

/**
 * Replaces a string value looking inside each element of the `SubColumns`.
 *
 * @ets_data_first replace_
 */
export function replace(oldValue: string, newValue: string) {
  return (self: SubColumns): SubColumns => replace_(self, oldValue, newValue)
}

// -----------------------------------------------------------------------------
// Instances
// -----------------------------------------------------------------------------

export const equalSubColumns: Equal<SubColumns> = Eq.makeEqual((x, y) =>
  x[Structural.equalsSym](y)
)

export const showSubColumns: Show<SubColumns> = makeShow((x) =>
  pipe(
    C.toArray(x.value),
    A.map(String.split("")),
    transpose,
    A.map((xs) => `|${A.join_(xs, "")}`),
    A.join("\n")
  )
)
