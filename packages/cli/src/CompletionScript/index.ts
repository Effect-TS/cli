// ets_tracing: off

import { matchTag_ } from "@effect-ts/core/Utils"

import type { ShellType } from "../ShellType"

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

function makeBashCompletions(pathToExecutable: string, programName: string): string {
  return `###-begin-${programName}-completions-###
  #
  # Effect-TS CLI Command Completion Script
  #
  # Installation: ${pathToExecutable} --shell-completion-script >> ~/.bashrc
  #    or ${pathToExecutable} --shell-completion-script  >> ~/.bash_profile on OSX.
  #
  _${programName}_completions() {
    local args
    local cur_word
    local type_list

    cur_word="\${COMP_WORDS[COMP_CWORD]}"
    args=("\${COMP_WORDS[@]}")
    type_list="$(${pathToExecutable} --show-completions "\${args[@]}")"
    COMPREPLY=( $(compgen -W "\${type_list}" -- \${cur_word}) )

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

// export const completionZshTemplate = `#compdef {{app_name}}
// ###-begin-{{app_name}}-completions-###
// #
// # yargs command completion script
// #
// # Installation: {{app_path}} {{completion_command}} >> ~/.zshrc
// #    or {{app_path}} {{completion_command}} >> ~/.zsh_profile on OSX.
// #
// _{{app_name}}_yargs_completions()
// {
//   local reply
//   local si=$IFS
//   IFS=$'\n' reply=($(COMP_CWORD="$((CURRENT-1))" COMP_LINE="$BUFFER" COMP_POINT="$CURSOR" {{app_path}} --get-yargs-completions "\${words[@]}"))
//   IFS=$si
//   _describe 'values' reply
// }
// compdef _{{app_name}}_yargs_completions {{app_name}}
// ###-end-{{app_name}}-completions-###
// `

export function make(
  pathToExecutable: string,
  programName: string,
  shellType: ShellType
): string {
  return matchTag_(shellType, {
    Bash: (_) => makeBashCompletions(pathToExecutable, programName),
    ZShell: () => {
      throw new Error("Not implemented!")
    }
  })
}
