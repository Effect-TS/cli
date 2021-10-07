// ets_tracing: off

import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"

import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import { Base } from "./Base"
import { attemptParse } from "./utils"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export class Text extends Base<string> {
  readonly _tag = "Text"

  constructor() {
    super()
  }
}

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export const textHelpDoc: HelpDoc = Help.text("A user-defined piece of text.")

// -----------------------------------------------------------------------------
// Type Name
// -----------------------------------------------------------------------------

export const textTypeName = "text"

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validateText(value: Option<string>): T.IO<string, string> {
  return attemptParse(value, T.succeed, textTypeName)
}
