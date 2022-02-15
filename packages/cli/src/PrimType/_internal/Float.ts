// ets_tracing: off

import type * as NewType from "../../Internal/NewType/index.js"
import { Base } from "./Base.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A primitive type representing float values.
 */
export class Float extends Base<NewType.Float> {
  readonly _tag = "Float"
}
