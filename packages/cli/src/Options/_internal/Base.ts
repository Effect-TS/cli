// ets_tracing: off

import { _A } from "@effect-ts/core/Effect"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export const OptionsSymbol = Symbol()

export type OptionsSymbol = typeof OptionsSymbol

/**
 * Represents options that can be passed to a command-line application.
 */
export interface Options<A> {
  readonly [OptionsSymbol]: OptionsSymbol
  readonly [_A]: () => A
}

export class Base<A> implements Options<A> {
  readonly [OptionsSymbol]: OptionsSymbol;
  readonly [_A]: () => A
}
