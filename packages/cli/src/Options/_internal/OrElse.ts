// ets_tracing: off

import type { Either } from "@effect-ts/core/Either"

import type { Options } from "./Base"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents alternative command-line options.
 *
 * In the event that the `left` command cannot be validated successfully, the
 * command-line application will attempt to validate the `right` command from
 * the provided arguments.
 */
export class OrElse<A, B> extends Base<Either<A, B>> {
  readonly _tag = "OrElse"

  constructor(
    /**
     * The first command-line option to attempt.
     */
    readonly left: Options<A>,
    /**
     * The second command-line option to attempt.
     */
    readonly right: Options<B>
  ) {
    super()
  }
}
