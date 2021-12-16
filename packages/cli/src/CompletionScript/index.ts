// ets_tracing: off

import { matchTag_ } from "@effect-ts/core/Utils"

import type { ShellType } from "../ShellType"

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

function makeBashCompletions(pathToExecutable: string, programName: string): string {
  return `#!/usr/bin/env bash

###-begin-${programName}-completions-###
#
# Effect-TS CLI Command Completion Script
#
# Installation:
#   ${pathToExecutable} \\
#     --shell-completion-script ${pathToExecutable} \\
#     --shell-type bash >> ~/.bashrc
#   OR
#   ${pathToExecutable} \\
#     --shell-completion-script ${pathToExecutable} \\
#     --shell-type bash >> ~/.bash_profile on OSX
#
_${programName}_completions() {
  local args
  local cur_word
  local type_list

  cur_word="\${COMP_WORDS[COMP_CWORD]}"
  args=("\${COMP_WORDS[@]}")
  type_list="$(${pathToExecutable} --shell-completions "\${args[*]}" --shell-type bash)"
  COMPREPLY=($(compgen -W "\${type_list}" -- \${cur_word}))

  # If no match was found, fall back to filename completion
  if [ \${#COMPREPLY[@]} -eq 0 ]; then
    COMPREPLY=()
  fi

  return 0
}

complete -o bashdefault -o default -F _${programName}_completions ${programName}

###-end-${programName}-completions-###
`
}

function makeZshCompletions(pathToExecutable: string, programName: string): string {
  return `#compdef ${programName}
###-begin-${programName}-completions-###
#
# Effect-TS CLI Command Completion Script
#
# Installation:
#   ${pathToExecutable} \\
#     --shell-completion-script ${pathToExecutable} \\
#     --shell-type zsh >> ~/.zshrc
#   OR
#   ${pathToExecutable} \\
#     --shell-completion-script ${pathToExecutable} \\
#     --shell-type zsh >> ~/.zsh_profile on OSX
#
_${programName}_completions() {
  local reply
  local si="\${IFS}"

  IFS=$'\n' reply=($(COMP_CWORD="$((CURRENT-1))" COMP_LINE="\${BUFFER}" COMP_POINT="\${CURSOR}" ${pathToExecutable} --shell-completions "\${words[*]}" --shell-type zsh))

  IFS="\${si}"

  _describe 'values' reply
}

compdef _${programName}_completions ${programName}

###-end-${programName}-completions-###
`
}

export function make(
  pathToExecutable: string,
  programName: string,
  shellType: ShellType
): string {
  return matchTag_(shellType, {
    Bash: () => makeBashCompletions(pathToExecutable, programName),
    ZShell: () => makeZshCompletions(pathToExecutable, programName)
  })
}
