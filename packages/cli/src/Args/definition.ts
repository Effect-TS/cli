// ets_tracing: off

import { Args } from "./_internal/Base"
import { Both } from "./_internal/Both"
import { Map } from "./_internal/Map"
import { None } from "./_internal/None"
import { Single } from "./_internal/Single"
import { Variadic } from "./_internal/Variadic"

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
