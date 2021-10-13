// ets_tracing: off

import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"

import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import { Base } from "./Base"
import { attemptParse } from "./utils"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A primitive type representing a date (i.e. `"2007-12-03T10:15:30.00Z"`).
 *
 * The string passed as a date parameter must be parseable by the static `parse`
 * method on the `Date` object.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
 * for more detail on valid date strings.
 */
export class Date extends Base<globalThis.Date> {
  readonly _tag = "Date"
}

// -----------------------------------------------------------------------------
// Type Name
// -----------------------------------------------------------------------------

export const typeName = "date"

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export const helpDoc: HelpDoc = Help.text("A valid string representation of a date.")

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validate(value: Option<string>): T.IO<string, globalThis.Date> {
  return attemptParse(
    value,
    (u) => {
      const ms = globalThis.Date.parse(u)
      return Number.isNaN(ms)
        ? T.fail("invalid date")
        : T.succeed(new globalThis.Date(ms))
    },
    typeName
  )
}
