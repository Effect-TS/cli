// ets_tracing: off

import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import type { UIO } from "@effect-ts/core/Effect"

import type { ShellType } from "../ShellType/index.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a custom shell completion which can be registered for a CLI
 * element.
 *
 * Currently completions are supported for `Command`s and `Options`.
 */
export interface Completion<A> {
  (element: A, args: NonEmptyArray<string>, shellType: ShellType): UIO<Set<string>>
}
