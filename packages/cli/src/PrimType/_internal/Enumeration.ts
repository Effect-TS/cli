// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A primitive type representing a value selected from a set of allowed values.
 */
export class Enumeration<A> extends Base<A> {
  readonly _tag = "Enumeration"

  constructor(
    /**
     * A list of allowed parameter-value pairs.
     */
    readonly cases: Array<Tuple<[string, A]>>
  ) {
    super()
  }
}

// -----------------------------------------------------------------------------
// Type Name
// -----------------------------------------------------------------------------

export const enumerationTypeName = "choice"

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export function getEnumerationHelpDoc<A>(self: Enumeration<A>): HelpDoc {
  return Help.text(
    `One of the following cases: ${A.join_(A.map_(self.cases, Tp.get(0)), ", ")}`
  )
}

// -----------------------------------------------------------------------------
// Choices
// -----------------------------------------------------------------------------

export function getEnumerationChoices<A>(self: Enumeration<A>): string {
  return A.join_(A.map_(self.cases, Tp.get(0)), " | ")
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validateEnumeration_<A>(
  self: Enumeration<A>,
  value: Option<string>
): T.IO<string, A> {
  return T.chain_(
    T.orElseFail_(
      T.fromOption(value),
      `Enumeration options do not have a default value`
    ),
    (value) =>
      O.fold_(
        A.findFirstMap_(self.cases, (c) => (c.get(0) === value ? O.some(c) : O.none)),
        () =>
          T.fail(
            "Expected one of the following cases: " +
              A.join_(A.map_(self.cases, Tp.get(0)), ", ")
          ),
        (c) => T.succeed(c.get(1))
      )
  )
}

/**
 * @ets_data_first validateEnumeration_
 */
export function validateEnumeration(value: Option<string>) {
  return <A>(self: Enumeration<A>): T.IO<string, A> => validateEnumeration_(self, value)
}
