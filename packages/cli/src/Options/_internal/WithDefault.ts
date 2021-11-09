// ets_tracing: off

import type { Option } from "@effect-ts/core/Option"
import type { Show } from "@effect-ts/core/Show"

import type { Options } from "./Base"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents an option that has a default value.
 */
export class WithDefault<A> extends Base<A> {
  readonly _tag = "WithDefault"

  constructor(
    /**
     * The command-line option which will be give a default value.
     */
    readonly options: Options<A>,
    /**
     * The default value for the command-line option.
     */
    readonly defaultValue: A,
    /**
     * An instance of `Show` for the default value.
     *
     * Used when rendering help messages.
     */
    readonly showDefaultValue: Show<A>,
    /**
     * The optional description for the default value.
     */
    readonly defaultDescription: Option<string>
  ) {
    super()
  }
}
