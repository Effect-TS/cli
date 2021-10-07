// ets_tracing: off

import type * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"

import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import * as NewType from "../../Internal/NewType"
import { Base } from "./Base"
import { attemptParse } from "./utils"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A primitive type representing integer values.
 */
export class Integer extends Base<NewType.Integer> {
  readonly _tag = "Integer"
}

// -----------------------------------------------------------------------------
// Type Name
// -----------------------------------------------------------------------------

export const integerTypeName = "integer"

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export const integerHelpDoc: HelpDoc = Help.text("An integer.")

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validateInteger(value: Option<string>): T.IO<string, NewType.Integer> {
  return attemptParse(value, NewType.parseInteger, integerTypeName)
}
