// ets_tracing: off

import { Options } from "./_internal/Base.js"
import { Both } from "./_internal/Both.js"
import { Map } from "./_internal/Map.js"
import { Mapping } from "./_internal/Mapping.js"
import { None } from "./_internal/None.js"
import { OrElse } from "./_internal/OrElse.js"
import { Single, SingleModifier } from "./_internal/Single.js"
import { WithDefault } from "./_internal/WithDefault.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type Instruction =
  | Both<any, any>
  | Map<any, any>
  | Mapping
  | None
  | OrElse<any, any>
  | Single<any>
  | WithDefault<any>

export {
  Both,
  Map,
  Mapping,
  None,
  Options,
  OrElse,
  Single,
  SingleModifier,
  WithDefault
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
