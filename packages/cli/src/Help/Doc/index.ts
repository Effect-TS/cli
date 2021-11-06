// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import type { Lazy } from "@effect-ts/core/Function"
import * as Identity from "@effect-ts/core/Identity"
import * as IO from "@effect-ts/core/IO"
import { matchTag } from "@effect-ts/core/Utils"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type HelpDoc =
  | Empty
  | Text
  | Code
  | Error
  | Strong
  | Link
  | Header
  | Paragraph
  | DescriptionList
  | Enumeration
  | Concat
  | Sequence

export class Empty {
  readonly _tag = "Empty"
}

export class Text {
  readonly _tag = "Text"
  constructor(readonly value: string) {}
}

export class Code {
  readonly _tag = "Code"
  constructor(readonly value: string) {}
}

export class Error {
  readonly _tag = "Error"
  constructor(readonly value: string) {}
}

export class Strong {
  readonly _tag = "Strong"
  constructor(readonly value: string) {}
}

export class Link {
  readonly _tag = "Link"
  constructor(readonly value: string) {}
}

export class Header {
  readonly _tag = "Header"
  constructor(readonly value: HelpDoc, readonly level: number) {}
}

export class Paragraph {
  readonly _tag = "Paragraph"
  constructor(readonly value: HelpDoc, readonly indentation: number) {}
}

export class DescriptionList {
  readonly _tag = "DescriptionList"
  constructor(readonly definitions: Array<Tuple<[HelpDoc, HelpDoc]>>) {}
}

export class Enumeration {
  readonly _tag = "Enumeration"
  constructor(readonly elements: Array<HelpDoc>) {}
}

export class Concat {
  readonly _tag = "Concat"
  constructor(readonly left: HelpDoc, readonly right: HelpDoc) {}
}

export class Sequence {
  readonly _tag = "Sequence"
  constructor(readonly left: HelpDoc, readonly right: HelpDoc) {}
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const empty: HelpDoc = new Empty()

export function text(value: string): HelpDoc {
  return new Text(value)
}

export function code(value: string): HelpDoc {
  return new Code(value)
}

export function error(value: string): HelpDoc {
  return new Error(value)
}

export function strong(value: string): HelpDoc {
  return new Strong(value)
}

export function link(value: string): HelpDoc {
  return new Link(value)
}

function header(value: string | HelpDoc, level: number): HelpDoc {
  return new Header(typeof value === "string" ? text(value) : value, level)
}

export function h1(value: string | HelpDoc): HelpDoc {
  return header(value, 1)
}

export function h2(value: string | HelpDoc): HelpDoc {
  return header(value, 2)
}

export function h3(value: string | HelpDoc): HelpDoc {
  return header(value, 3)
}

export function p(value: string | HelpDoc, indentation = 0): HelpDoc {
  return new Paragraph(typeof value === "string" ? text(value) : value, indentation)
}

export function descriptionList(
  definitions: Array<Tuple<[HelpDoc, HelpDoc]>>
): HelpDoc {
  return new DescriptionList(definitions)
}

export function enumeration(elements: Array<HelpDoc>): HelpDoc {
  return flatten(new Enumeration(elements))
}

export function concat_(left: HelpDoc, right: HelpDoc): HelpDoc {
  return new Concat(left, right)
}

/**
 * @ets_data_first concat_
 */
export function concat(right: HelpDoc) {
  return (left: HelpDoc): HelpDoc => concat_(left, right)
}

export function sequence_(left: HelpDoc, right: HelpDoc): HelpDoc {
  return new Sequence(left, right)
}

/**
 * @ets_data_first sequence_
 */
export function sequence(right: HelpDoc) {
  return (left: HelpDoc): HelpDoc => sequence_(left, right)
}

/**
 * Lays out a sequence of `HelpDoc`s horizontally.
 */
export function spans(ss: Array<HelpDoc>): HelpDoc {
  return A.foldLeft_(
    ss,
    () => empty,
    (head, tail) => A.reduce_(tail, head, concat_)
  )
}

/**
 * Lays out a sequence of `HelpDoc`s horizontally.
 */
export function spansT(...ss: Array<HelpDoc>): HelpDoc {
  return spans(ss)
}

/**
 * Lays out a sequence of `HelpDoc`s vertically.
 */
export function blocks(bs: Array<HelpDoc>): HelpDoc {
  return A.foldLeft_(
    bs,
    () => empty,
    (head, tail) => A.reduce_(tail, head, sequence_)
  )
}

/**
 * Lays out a sequence of `HelpDoc`s vertically.
 */
export function blocksT(...bs: Array<HelpDoc>): HelpDoc {
  return blocks(bs)
}

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

export function mapDescriptionList_(
  self: HelpDoc,
  f: (tuple: Tuple<[HelpDoc, HelpDoc]>) => Tuple<[HelpDoc, HelpDoc]>
): HelpDoc {
  switch (self._tag) {
    case "DescriptionList":
      return descriptionList(A.map_(self.definitions, f))
    default:
      return self
  }
}

/**
 * @ets_data_first mapDescriptionList_
 */
export function mapDescriptionList(
  f: (tuple: Tuple<[HelpDoc, HelpDoc]>) => Tuple<[HelpDoc, HelpDoc]>
) {
  return (self: HelpDoc): HelpDoc => mapDescriptionList_(self, f)
}

export function flatten(self: Enumeration): Enumeration {
  return new Enumeration(
    A.chain_(
      self.elements,
      matchTag(
        {
          Enumeration: (_) => _.elements
        },
        A.single
      )
    )
  )
}

export function orElse_(self: HelpDoc, that: Lazy<HelpDoc>): HelpDoc {
  return isEmpty(self) ? that() : self
}

/**
 * @ets_data_first orElse_
 */
export function orElse(that: Lazy<HelpDoc>) {
  return (self: HelpDoc): HelpDoc => orElse_(self, that)
}

function isEmptyRec(self: HelpDoc): IO.IO<boolean> {
  return IO.gen(function* (_) {
    switch (self._tag) {
      case "Empty":
        return true
      case "DescriptionList":
        return A.foldMap_(Identity.all)(self.definitions, (tuple) =>
          IO.run(isEmptyRec(tuple.get(1)))
        )
      case "Enumeration":
        return A.foldMap_(Identity.all)(self.elements, (a) => IO.run(isEmptyRec(a)))
      case "Concat": {
        const isEmptyLeft = yield* _(isEmptyRec(self.left))
        const isEmptyRight = yield* _(isEmptyRec(self.right))
        return isEmptyLeft && isEmptyRight
      }
      default:
        return false
    }
  })
}

export function isEmpty(self: HelpDoc): self is Empty {
  return IO.run(isEmptyRec(self))
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

export const space: HelpDoc = text(" ")
