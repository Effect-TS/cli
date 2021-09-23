// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import { makeShow } from "@effect-ts/core/Show"

import type { HelpDoc } from "../Help"
import type { Options } from "../Options"
import * as Opts from "../Options"
import type { ShellType } from "../ShellType"
import * as Shell from "../ShellType"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type BuiltInOption = ShowHelp | ShowCompletions

export class ShowHelp extends Tagged("ShowHelp")<{
  readonly helpDoc: HelpDoc
}> {}

export class ShowCompletions extends Tagged("ShowCompletions")<{
  readonly completions: Set<Array<string>>
}> {}

export interface BuiltIn {
  readonly help: boolean
  readonly shellCompletions: Option<ShellType>
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export function showHelp(helpDoc: HelpDoc): BuiltInOption {
  return new ShowHelp({ helpDoc })
}

export function showCompletions(completions: Set<Array<string>>): BuiltInOption {
  return new ShowCompletions({ completions })
}

export const helpOption: Options<boolean> = Opts.boolean("help")

export const shellCompletionsOption: Options<Option<ShellType>> = Opts.optional_(
  Shell.option,
  "N/A",
  makeShow(() => "N/A")
)

export const builtInOptions: Options<BuiltIn> = Opts.map_(
  Opts.zip_(helpOption, shellCompletionsOption),
  ({ tuple: [help, shellCompletions] }) => ({ help, shellCompletions })
)

export function builtInOptionsFrom(
  helpDoc: HelpDoc,
  completions: (shellType: ShellType) => Set<Array<string>>
): Options<Option<BuiltInOption>> {
  return Opts.map_(builtInOptions, (builtIn) => {
    if (builtIn.help) {
      return O.some(new ShowHelp({ helpDoc }))
    }
    if (O.isSome(builtIn.shellCompletions)) {
      return O.some(
        new ShowCompletions({
          completions: completions(builtIn.shellCompletions.value)
        })
      )
    }
    return O.none
  })
}
