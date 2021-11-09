// ets_tracing: off

import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"

import type { Args } from "../../Args"
import type { HelpDoc } from "../../Help"
import type { Options } from "../../Options"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a single command.
 */
export class Single<OptionsType, ArgsType> extends Base<
  Tuple<[OptionsType, ArgsType]>
> {
  readonly _tag = "Single"

  constructor(
    /**
     * The name of the command.
     */
    readonly name: string,
    /**
     * The description for the command.
     */
    readonly help: HelpDoc,
    /**
     * The command-line options that can be passed to the command.
     */
    readonly options: Options<OptionsType>,
    /**
     * The command-line arguments that can be passed to the command.
     */
    readonly args: Args<ArgsType>
  ) {
    super()
  }
}
