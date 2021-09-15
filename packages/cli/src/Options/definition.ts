// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import type { IO } from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"

import type { CliConfig } from "../CliConfig"
import type { HelpDoc } from "../Help"
import type { UsageSynopsis } from "../UsageSynopsis"
import type { ValidationError } from "../Validation"
import type { SingleModifier } from "./models/Single"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents options that can be passed to a command-line application.
 */
export interface Options<A> {
  /**
   * The unique identifier for the command-line option.
   */
  get uid(): Option<string>
  /**
   * The `HelpDoc` for the command-line option.
   */
  get helpDoc(): HelpDoc
  /**
   * The `UsageSynopsis` for the command-line option.
   */
  get synopsis(): UsageSynopsis
  /**
   * Validates the option against the provided command-line arguments.
   *
   * @param args The command-line arguments to validate.
   * @param config The `CliConfig` to use for validation.
   */
  validate(
    args: Array<string>,
    config?: CliConfig
  ): IO<ValidationError, Tuple<[Array<string>, A]>>
  /**
   * Validates the option against the provided command-line arguments.
   *
   * @param args The command-line arguments to validate.
   */
  validate(args: Array<string>): IO<ValidationError, Tuple<[Array<string>, A]>>
  /**
   *
   * @param modifier The function which can be used to modify a `Single` option.
   */
  modifySingle(modifier: SingleModifier): Options<A>
}

// -----------------------------------------------------------------------------
// HKT
// -----------------------------------------------------------------------------

export const OptionsURI = "@effect-ts/cli/Options"

export type OptionsURI = typeof OptionsURI

declare module "@effect-ts/core/Prelude/HKT" {
  interface URItoKind<FC, TC, K, Q, W, X, I, S, R, E, A> {
    readonly [OptionsURI]: Options<A>
  }
}
