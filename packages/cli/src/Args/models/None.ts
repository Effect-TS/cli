// ets_tracing: off

import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { UsageSynopsis } from "../../UsageSynopsis"
import * as Synopsis from "../../UsageSynopsis"
import type { Args } from "../definition"

/**
 * Represents the absence of a command-line argument.
 */
export class None implements Args<void> {
  get minSize(): number {
    return 0
  }

  get maxSize(): number {
    return 0
  }

  get helpDoc(): HelpDoc {
    return Help.empty
  }

  get synopsis(): UsageSynopsis {
    return Synopsis.none
  }

  addDescription(text: string): Args<void> {
    return this
  }

  validate(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<any, Tuple<[Array<string>, void]>> {
    return T.succeed(Tp.tuple(args, undefined))
  }
}
