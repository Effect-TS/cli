// ets_tracing: off

import { _A } from "@effect-ts/core/Effect"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export const CommandSymbol = Symbol()

export type CommandSymbol = typeof CommandSymbol

/**
 * A `Command` represents a command in a command-line application.
 *
 * Every command-line application will have at least one command: the
 * application itself. Other command-line applications may support multiple
 * commands.
 */
export interface Command<A> {
  readonly [CommandSymbol]: CommandSymbol
  readonly [_A]: () => A
}

export class Base<A> implements Command<A> {
  readonly [CommandSymbol]: CommandSymbol;
  readonly [_A]: () => A
}
