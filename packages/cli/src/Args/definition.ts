// ets_tracing: off

import { Args } from "./_internal/Base.js"
import { Both } from "./_internal/Both.js"
import { Map } from "./_internal/Map.js"
import { None } from "./_internal/None.js"
import { Single } from "./_internal/Single.js"
import { Variadic } from "./_internal/Variadic.js"

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
