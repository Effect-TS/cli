// ets_tracing: off

import type * as NewType from "../../Internal/NewType"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A primitive type representing float values.
 */
export class Float extends Base<NewType.Float> {
  readonly _tag = "Float"
}
