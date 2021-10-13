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
// Type Name
// -----------------------------------------------------------------------------

export const typeName = "text"

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export const helpDoc: HelpDoc = Help.text("A user-defined piece of text.")

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validate(value: Option<string>): T.IO<string, string> {
  return attemptParse(value, T.succeed, typeName)
}
