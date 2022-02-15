// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import { pipe } from "@effect-ts/core/Function"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import * as Show from "@effect-ts/core/Show"

import type { HelpDoc } from "../Help/index.js"
import type { Options } from "../Options/index.js"
import * as Opts from "../Options/index.js"
import type { ShellType } from "../ShellType/index.js"
import * as Shell from "../ShellType/index.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type BuiltInOption = ShowHelp | ShowCompletionScript | ShowCompletions

export class ShowHelp extends Tagged("ShowHelp")<{
  readonly helpDoc: HelpDoc
}> {}

export class ShowCompletionScript extends Tagged("ShowCompletionScript")<{
  readonly pathToExecutable: string
  readonly shellType: ShellType
}> {}

export class ShowCompletions extends Tagged("ShowCompletions")<{
  readonly args: string
  readonly shellType: ShellType
}> {}

export interface BuiltIn {
  readonly help: boolean
  readonly shellCompletionScriptPath: Option<string>
  readonly shellCompletions: Option<string>
  readonly shellType: Option<ShellType>
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export function showHelp(helpDoc: HelpDoc): BuiltInOption {
  return new ShowHelp({ helpDoc })
}

export function showCompletionScript(
  pathToExecutable: string,
  shellType: ShellType
): BuiltInOption {
  return new ShowCompletionScript({ pathToExecutable, shellType })
}

export function showCompletions(args: string, shellType: ShellType): BuiltInOption {
  return new ShowCompletions({ args, shellType })
}

export const builtInOptions: Options<BuiltIn> = Opts.struct({
  help: Opts.boolean("help"),
  shellCompletionScriptPath: pipe(
    Opts.file("shell-completion-script"),
    Opts.optional(Show.string, "N/A")
  ),
  shellCompletions: pipe(
    Opts.text("shell-completions"),
    Opts.optional(Show.string, "N/A")
  ),
  shellType: pipe(Shell.option, Opts.optional(Shell.showShellType, "N/A"))
})

export function withHelp(helpDoc: HelpDoc): Options<Option<BuiltInOption>> {
  return pipe(
    builtInOptions,
    Opts.map((builtIn) => {
      if (builtIn.help) {
        return O.some(showHelp(helpDoc))
      }
      if (O.isSome(builtIn.shellCompletionScriptPath) && O.isSome(builtIn.shellType)) {
        return O.some(
          showCompletionScript(
            builtIn.shellCompletionScriptPath.value,
            builtIn.shellType.value
          )
        )
      }
      if (O.isSome(builtIn.shellCompletions) && O.isSome(builtIn.shellType)) {
        return O.some(
          showCompletions(builtIn.shellCompletions.value, builtIn.shellType.value)
        )
      }
      return O.none
    })
  )
}
