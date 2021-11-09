// ets_tracing: off

import type { Option } from "@effect-ts/core/Option"

import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A primitive type representing a boolean value.
 * - Truthy values can be passed as `"true"`, `"1"`, `"y"`, `"yes"` or `"on"`.
 * - Falsy values can be passed as `"false"`, `"o"`, `"n"`, `"no"` or `"off"`.
 */
export class Bool extends Base<boolean> {
  readonly _tag = "Bool"

  constructor(
    /**
     * The default value that should be used when the command-line argument is
     * not provided.
     */
    readonly defaultValue: Option<boolean>
  ) {
    super()
  }
}
