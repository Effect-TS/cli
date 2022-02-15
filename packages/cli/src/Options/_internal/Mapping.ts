// ets_tracing: off

import type { Map } from "@effect-ts/core/Collections/Immutable/Map"

import { Base } from "./Base.js"
import type { Single } from "./Single.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a command-line option which takes a property flag as an option
 * and allows passing of multiple of key-value pairs as arguments.
 */
export class Mapping extends Base<Map<string, string>> {
  readonly _tag = "Mapping"

  constructor(
    /**
     * The command-line option which specified the property flag.
     */
    readonly argumentName: string,
    /**
     * The command-line option which specifies the key-value pairs.
     */
    readonly argumentOption: Single<string>
  ) {
    super()
  }
}
