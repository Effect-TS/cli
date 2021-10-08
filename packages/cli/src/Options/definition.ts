// ets_tracing: off

import {
  Base,
  Both,
  Map,
  None,
  Options,
  OrElse,
  Single,
  WithDefault
} from "./_internal"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type Instruction =
  | Both<any, any>
  | Map<any, any>
  | None
  | OrElse<any, any>
  | Single<any>
  | WithDefault<any>

export { Base, Both, Map, None, Options, OrElse, Single, WithDefault }

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
