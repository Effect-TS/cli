// ets_tracing: off

import { Base } from "./Base"

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
