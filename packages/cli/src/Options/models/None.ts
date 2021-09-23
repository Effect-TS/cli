import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { UsageSynopsis } from "../../UsageSynopsis"
import * as Synopsis from "../../UsageSynopsis"
import type { ValidationError } from "../../Validation"
import type { Options } from "../definition"
import type { SingleModifier } from "./Single"

/**
 * Represents a command-line application that takes no options.
 */
export class None implements Options<void> {
  get uid(): Option<string> {
    return O.none
  }

  get helpDoc(): HelpDoc {
    return Help.empty
  }

  get synopsis(): UsageSynopsis {
    return Synopsis.none
  }

  validate(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<ValidationError, Tuple<[Array<string>, void]>> {
    return T.succeed(Tp.tuple(args, undefined))
  }

  modifySingle(modifier: SingleModifier): Options<void> {
    return this
  }
}
