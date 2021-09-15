// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import type { IO } from "@effect-ts/core/Effect"

import type { CliConfig } from "../CliConfig"
import type { CommandDirective } from "../CommandDirective"
import type { HelpDoc } from "../Help"
import type { UsageSynopsis } from "../UsageSynopsis"
import type { ValidationError } from "../Validation"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A `Command` represents a command in a command-line application.
 *
 * Every command-line application will have at least one command: the
 * application itself. Other command-line applications may support multiple
 * commands.
 */
export interface Command<A> {
  /**
   * The names that can be use to invoke the command from the command-line.
   */
  get names(): Set<string>
  /**
   * The `HelpDoc` for the command.
   */
  get helpDoc(): HelpDoc
  /**
   * The `UsageSynopsis` for the command.
   */
  get synopsis(): UsageSynopsis
  /**
   * Parses the command from the provided command-line arguments.
   *
   * @param args The command-line arguments to parse.
   * @param config The `CliConfig` to use for validation.
   */
  parse(
    args: Array<string>,
    config?: CliConfig
  ): IO<ValidationError, CommandDirective<A>>
  /**
   * Parses the command from the provided command-line arguments.
   *
   * @param args The command-line arguments to parse.
   */
  parse(args: Array<string>): IO<ValidationError, CommandDirective<A>>
}
