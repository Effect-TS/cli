// ets_tracing: off

import { Command } from "./_internal/Base"
import { Map } from "./_internal/Map"
import { OrElse } from "./_internal/OrElse"
import { Single } from "./_internal/Single"
import { Subcommands } from "./_internal/Subcommands"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type Instruction =
  | Map<any, any>
  | OrElse<any>
  | Single<any, any>
  | Subcommands<any, any>

export { Command, Map, OrElse, Single, Subcommands }
