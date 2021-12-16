// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"

import type { Args } from "../../Args"
import type { Completion } from "../../Completion"
import type { HelpDoc } from "../../Help"
import type { Options } from "../../Options"
import type { Reducable } from "../../Reducable"
import type { Command } from "../definition"
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
    readonly args: Args<ArgsType>,
    /**
     * An array of custom shell completions which can be provided for a command.
     */
    readonly completions: Array<Completion<Command<Reducable<OptionsType, ArgsType>>>>
  ) {
    super()
  }
}
