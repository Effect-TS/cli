// ets_tracing: off

import { Base } from "./Base.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a command-line application that takes no options.
 */
export class None extends Base<void> {
  readonly _tag = "None"
}
