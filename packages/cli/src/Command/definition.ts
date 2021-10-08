// ets_tracing: off

import { Base, Command, Map, OrElse, Single, Subcommands } from "./_internal"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type Instruction =
  | Map<any, any>
  | OrElse<any>
  | Single<any, any>
  | Subcommands<any, any>

export { Base, Command, Map, OrElse, Single, Subcommands }
