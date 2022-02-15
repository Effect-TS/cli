// ets_tracing: off

import type * as NewType from "../../Internal/NewType/index.js"
import { Base } from "./Base.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A primitive type representing integer values.
 */
export class Integer extends Base<NewType.Integer> {
  readonly _tag = "Integer"
}
