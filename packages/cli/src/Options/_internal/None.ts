// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"

import type { ValidationError } from "../../Validation"
import type { Options } from "./Base"
import { Base } from "./Base"
import type { SingleModifier } from "./Single"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a command-line application that takes no options.
 */
export class None extends Base<void> {
  readonly _tag = "None"
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validate(
  args: Array<string>
): T.IO<ValidationError, Tuple<[Array<string>, void]>> {
  return T.succeed(Tp.tuple(args, undefined))
}

// -----------------------------------------------------------------------------
// Modification
// -----------------------------------------------------------------------------

/**
 * @ets_optimize identity
 */
export function modifySingle_(self: None, modifier: SingleModifier): Options<void> {
  return self
}

/**
 * @ets_data_first modifySingle_
 */
export function modifySingle(modifier: SingleModifier) {
  return (self: None): Options<void> => modifySingle_(self, modifier)
}
