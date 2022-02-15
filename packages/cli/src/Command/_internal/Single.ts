// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"

import type { Args } from "../../Args/index.js"
import type { Completion } from "../../Completion/index.js"
import type { HelpDoc } from "../../Help/index.js"
import type { Options } from "../../Options/index.js"
import type { Reducable } from "../../Reducable/index.js"
import type { Command } from "../definition.js"
import { Base } from "./Base.js"

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
