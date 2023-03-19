import * as options from "@effect/cli/internal_effect_untraced/options"
import type * as Options from "@effect/cli/Options"
import type * as ShellType from "@effect/cli/ShellType"

/** @internal */
export const bash: ShellType.ShellType = {
  _tag: "Bash"
}

/** @internal */
export const zShell: ShellType.ShellType = {
  _tag: "ZShell"
}

/** @internal */
export const shellOption: Options.Options<ShellType.ShellType> = options.choice("shell-type", [
  ["sh", bash],
  ["bash", bash],
  ["zsh", zShell]
])
