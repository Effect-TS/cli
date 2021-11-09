// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"

import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { PrimType } from "../../PrimType"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a single command-line option.
 */
export class Single<A> extends Base<A> {
  readonly _tag = "Single"

  constructor(
    /**
     * The name of the command-line option.
     */
    readonly name: string,
    /**
     * Aliases for the command-line option.
     */
    readonly aliases: Array<string>,
    /**
     * The backing primitive type of the command-line option.
     */
    readonly primType: PrimType<A>,
    /**
     * The description of the command-line option.
     */
    readonly description: HelpDoc = Help.empty
  ) {
    super()
  }
}

/**
 * A modifier function which can be applied to `Single` command-line options.
 */
export interface SingleModifier {
  <A>(single: Single<A>): Single<A>
}
