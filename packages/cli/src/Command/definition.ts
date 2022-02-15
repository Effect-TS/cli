// ets_tracing: off

import { Command } from "./_internal/Base.js"
import { Map } from "./_internal/Map.js"
import { OrElse } from "./_internal/OrElse.js"
import { Single } from "./_internal/Single.js"
import { Subcommands } from "./_internal/Subcommands.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type Instruction =
  | Map<any, any>
  | OrElse<any>
  | Single<any, any>
  | Subcommands<any, any>

export { Command, Map, OrElse, Single, Subcommands }
