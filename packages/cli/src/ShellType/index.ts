// ets_tracing: off

import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import type { Show } from "@effect-ts/core/Show"
import { makeShow } from "@effect-ts/core/Show"

import type { Options } from "../Options/index.js"
import * as Opts from "../Options/index.js"

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

// -----------------------------------------------------------------------------
// Instances
// -----------------------------------------------------------------------------

export const showShellType: Show<ShellType> = makeShow((x) => x._tag.toLowerCase())
