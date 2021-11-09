// ets_tracing: off

import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents the absence of a command-line argument.
 */
export class None extends Base<void> {
  readonly _tag = "None"
}
