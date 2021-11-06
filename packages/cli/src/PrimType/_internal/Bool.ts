// ets_tracing: off

import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A primitive type representing a boolean value.
 * - Truthy values can be passed as `"true"`, `"1"`, `"y"`, `"yes"` or `"on"`.
 * - Falsy values can be passed as `"false"`, `"o"`, `"n"`, `"no"` or `"off"`.
 */
export class Bool extends Base<boolean> {
  readonly _tag = "Bool"

  constructor(
    /**
     * The default value that should be used when the command-line argument is
     * not provided.
     */
    readonly defaultValue: Option<boolean>
  ) {
    super()
  }
}

// -----------------------------------------------------------------------------
// Type Name
// -----------------------------------------------------------------------------

export const typeName = "boolean"

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export const helpDoc: HelpDoc = Help.text("A true or false value.")

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validate_(
  self: Bool,
  value: Option<string>,
  config: CliConfig = Config.defaultConfig
): T.IO<string, boolean> {
  return O.fold_(
    O.map_(value, (text) => Config.normalizeCase_(config, text)),
    () =>
      T.orElseFail_(
        T.fromOption(self.defaultValue),
        `Missing default value for boolean parameter`
      ),
    (s) =>
      ["true", "1", "y", "yes", "on"].indexOf(s) !== -1
        ? T.succeed(true)
        : ["false", "0", "n", "no", "off"].indexOf(s) !== -1
        ? T.succeed(false)
        : T.fail(`'${s}' was not recognized as a valid boolean`)
  )
}

/**
 * @ets_data_first validate_
 */
export function validate(
  value: Option<string>,
  config: CliConfig = Config.defaultConfig
) {
  return (self: Bool): T.IO<string, boolean> => validate_(self, value, config)
}
