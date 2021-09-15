// ets_tracing: off

import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"

import type { Options } from "../Options"
import * as Opts from "../Options"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type ShellType = Bash | ZShell

export class Bash {
  readonly _tag = "Bash"
}

export class ZShell {
  readonly _tag = "ZShell"
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const bash: ShellType = new Bash()

export const zShell: ShellType = new ZShell()

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

export const option: Options<ShellType> = Opts.enumeration<ShellType>("shell-type", [
  Tp.tuple("sh", bash),
  Tp.tuple("bash", bash),
  Tp.tuple("zsh", zShell)
])
