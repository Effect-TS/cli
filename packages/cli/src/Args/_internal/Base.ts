// ets_tracing: off

import { _A } from "@effect-ts/core/Effect"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export const ArgsSymbol = Symbol()

export type ArgsSymbol = typeof ArgsSymbol

/**
 * Represents arguments that can be passed to a command-line application.
 */
export interface Args<A> {
  readonly [ArgsSymbol]: ArgsSymbol
  readonly [_A]: () => A
}

export class Base<A> implements Args<A> {
  readonly [ArgsSymbol]: ArgsSymbol;
  readonly [_A]: () => A
}
