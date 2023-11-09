/**
 * @since 1.0.0
 */
import type { Effect } from "effect/Effect"
import type { Command } from "./Command.js"
import type { HelpDoc } from "./HelpDoc.js"
import type { Span } from "./HelpDoc/Span.js"
import * as InternalCliApp from "./internal/cliApp.js"
import type { ValidationError } from "./ValidationError.js"

/**
 * A `CliApp<A>` is a complete description of a command-line application.
 *
 * @since 1.0.0
 * @category models
 */
export interface CliApp<A> {
  readonly name: string
  readonly version: string
  readonly command: Command<A>
  readonly summary: Span
  readonly footer: HelpDoc
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: <A>(
  config: {
    name: string
    version: string
    command: Command<A>
    summary?: Span | undefined
    footer?: HelpDoc | undefined
  }
) => CliApp<A> = InternalCliApp.make

/**
 * @since 1.0.0
 * @category execution
 */
export const run: {
  <R, E, A>(
    args: ReadonlyArray<string>,
    f: (a: A) => Effect<R, E, void>
  ): (self: CliApp<A>) => Effect<R, E | ValidationError, void>
  <R, E, A>(
    self: CliApp<A>,
    args: ReadonlyArray<string>,
    f: (a: A) => Effect<R, E, void>
  ): Effect<R, ValidationError | E, void>
} = InternalCliApp.run
