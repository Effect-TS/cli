// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import type { IO } from "@effect-ts/core/Effect"

import type { CliConfig } from "../CliConfig"
import type { HelpDoc } from "../Help"
import type { UsageSynopsis } from "../UsageSynopsis"

/**
 * Represents arguments that can be passed to a command-line application.
 */
export interface Args<A> {
  /**
   * The minimum number of times that the argument can appear.
   */
  get minSize(): number
  /**
   * The maximum number of times that the argument can appear.
   */
  get maxSize(): number
  /**
   * The `HelpDoc` for the argument.
   */
  get helpDoc(): HelpDoc
  /**
   * The `UsageSynopsis` for the argument.
   */
  get synopsis(): UsageSynopsis
  /**
   * Adds an additional description block to the `HelpDoc` for the argument.
   *
   * @param text The description to add.
   */
  addDescription(text: string): Args<A>
  /**
   * Validates the argument against the provided command-line arguments.
   *
   * @param args The command-line arguments to validate.
   * @param config The `CliConfig` to use for validation.
   */
  validate(
    args: Array<string>,
    config?: CliConfig
  ): IO<HelpDoc, Tuple<[Array<string>, A]>>
  /**
   * Validates the argument against the provided command-line arguments.
   *
   * @param args The command-line arguments to validate.
   */
  validate(args: Array<string>): IO<HelpDoc, Tuple<[Array<string>, A]>>
}
