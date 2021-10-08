// ets_tracing: off

import { _A } from "@effect-ts/core/Effect"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export const PrimTypeSymbol = Symbol()

export type PrimTypeSymbol = typeof PrimTypeSymbol

/**
 * A `PrimType` represents the primitive types supported by Effect-TS CLI.
 *
 * Each primitive type has a way to parse and validate itself from a string.
 */
export interface PrimType<A> {
  readonly [PrimTypeSymbol]: PrimTypeSymbol
  readonly [_A]: () => A
}

export class Base<A> implements PrimType<A> {
  readonly [PrimTypeSymbol]: PrimTypeSymbol;
  readonly [_A]: () => A
}
