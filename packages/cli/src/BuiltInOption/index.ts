// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import { pipe } from "@effect-ts/core/Function"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import * as Show from "@effect-ts/core/Show"

import type { HelpDoc } from "../Help"
import type { Integer } from "../Internal/NewType"
import type { Options } from "../Options"
import * as Opts from "../Options"
import type { ShellType } from "../ShellType"
import * as Shell from "../ShellType"

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
  readonly index: Integer
  readonly shellType: ShellType
}> {}

export interface BuiltIn {
  readonly help: boolean
  readonly shellCompletionScriptPath: Option<string>
  readonly shellCompletions: Option<ShellType>
  readonly shellCompletionIndex: Option<Integer>
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

export function showCompletions(index: Integer, shellType: ShellType): BuiltInOption {
  return new ShowCompletions({ index, shellType })
}

export const builtInOptions: Options<BuiltIn> = Opts.struct({
  help: Opts.boolean("help"),
  shellCompletionScriptPath: pipe(
    Opts.file("shell-completion-script"),
    Opts.optionalDescription(Show.string, "N/A")
  ),
  shellCompletions: pipe(
    Shell.option,
    Opts.optionalDescription(Shell.showShellType, "N/A")
  ),
  shellCompletionIndex: pipe(
    Opts.integer("shell-completion-index"),
    Opts.optionalDescription<Integer>(Show.number, "N/A")
  )
})

export function withHelp(helpDoc: HelpDoc): Options<Option<BuiltInOption>> {
  return pipe(
    builtInOptions,
    Opts.map((builtIn) => {
      if (builtIn.help) {
        return O.some(showHelp(helpDoc))
      }
      if (
        O.isSome(builtIn.shellCompletionScriptPath) &&
        O.isSome(builtIn.shellCompletions)
      ) {
        return O.some(
          showCompletionScript(
            builtIn.shellCompletionScriptPath.value,
            builtIn.shellCompletions.value
          )
        )
      }
      if (
        O.isSome(builtIn.shellCompletionIndex) &&
        O.isSome(builtIn.shellCompletions)
      ) {
        return O.some(
          showCompletions(
            builtIn.shellCompletionIndex.value,
            builtIn.shellCompletions.value
          )
        )
      }
      return O.none
    })
  )
}
