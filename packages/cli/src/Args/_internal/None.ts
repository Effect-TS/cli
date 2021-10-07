// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"

import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { UsageSynopsis } from "../../UsageSynopsis"
import * as Synopsis from "../../UsageSynopsis"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents the absence of a command-line argument.
 */
export class None extends Base<void> {
  readonly _tag = "None"
}

// -----------------------------------------------------------------------------
// Minimum Size
// -----------------------------------------------------------------------------

export const noneMinSize = 0

// -----------------------------------------------------------------------------
// Maximum Size
// -----------------------------------------------------------------------------

export const noneMaxSize = 0

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export const noneHelpDoc: HelpDoc = Help.empty

// -----------------------------------------------------------------------------
// UsageSynopsis
// -----------------------------------------------------------------------------

export const noneUsageSynopsis: UsageSynopsis = Synopsis.none

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validateNone(
  args: Array<string>
): T.IO<HelpDoc, Tuple<[Array<string>, void]>> {
  return T.succeed(Tp.tuple(args, undefined))
}
