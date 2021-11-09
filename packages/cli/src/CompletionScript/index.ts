// ets_tracing: off

import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import * as S from "@effect-ts/core/Collections/Immutable/Set"
import * as Equal from "@effect-ts/core/Equal"
import { pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import * as Ord from "@effect-ts/core/Ord"
import { matchTag_ } from "@effect-ts/core/Utils"
import { EOL } from "os"

import type { ShellType } from "../ShellType"

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

function makeBashCompletions(
  pathToExecutable: string,
  programNames: Set<string>
): string {
  const generator = pipe(
    programNames,
    S.toArray(Ord.string),
    A.head,
    O.getOrElse(() => "unknown")
  )

  const script = `
#!/user/bin/env bash

function _${generator}() {
  local CMDLINE
  local INDEX
  local IFS=$'\\n'

  CMDLINE=(--shell-type bash --shell-completion-index $COMP_CWORD)

  INDEX=0
  for arg in "\${COMP_WORDS[@]}"; do
    export "COMP_WORD_\${INDEX}"="\${arg}"
    (( INDEX++ ))
  done

  COMPREPLY=( $(${pathToExecutable} "\${CMDLINE[@]}") )

  # Unset the environment variables
  unset $(compgen -v | grep "^COMP_WORD_")
}`.trim()

  const completions = pipe(
    programNames,
    S.map(Equal.string)((programName) => `complete -F _${generator} ${programName}`),
    S.toArray(Ord.string),
    A.join(EOL)
  )

  return script + EOL.repeat(2) + completions
}

export function make(
  pathToExecutable: string,
  programNames: Set<string>,
  shellType: ShellType
): string {
  return matchTag_(shellType, {
    Bash: (_) => makeBashCompletions(pathToExecutable, programNames),
    ZShell: () => {
      throw new Error("Not implemented!")
    }
  })
}
