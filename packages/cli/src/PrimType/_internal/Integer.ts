// ets_tracing: off

import type * as NewType from "../../Internal/NewType"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A primitive type representing integer values.
 */
export class Integer extends Base<NewType.Integer> {
  readonly _tag = "Integer"
}
