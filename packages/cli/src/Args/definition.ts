// ets_tracing: off

import { Args, Both, Map, None, Single, Variadic } from "./_internal"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type Instruction =
  | None
  | Single<any>
  | Both<any, any>
  | Map<any, any>
  | Variadic<any>

export { Args, Both, Map, None, Single, Variadic }
