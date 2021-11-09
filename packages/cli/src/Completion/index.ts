// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import { pipe } from "@effect-ts/core/Function"

import type { Integer } from "../Internal/NewType"
import type { ShellType } from "../ShellType"
import { showShellType } from "../ShellType"

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

export function complete(
  shellType: ShellType,
  words: Array<string>,
  index: Integer
): Array<string> {
  // TODO: The dummy completions below are just a proof-of-concept. They should
  // be replaced with legitimate completions.
  return pipe(
    A.mapWithIndex_(words, (i, word) => `${word}-${i}`),
    A.concat([`cursor-index-${index}`, `shell-is-${showShellType.show(shellType)}`])
  )
}
