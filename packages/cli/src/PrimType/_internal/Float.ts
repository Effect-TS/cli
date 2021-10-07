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
 * A primitive type representing float values.
 */
export class Float extends Base<NewType.Float> {
  readonly _tag = "Float"
}

// -----------------------------------------------------------------------------
// Type Name
// -----------------------------------------------------------------------------

export const floatTypeName = "float"

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export const floatHelpDoc: HelpDoc = Help.text("A floating point number.")

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validateFloat(value: Option<string>): T.IO<string, NewType.Float> {
  return attemptParse(value, NewType.parseFloat, floatTypeName)
}
