// ets_tracing: off

import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { PrimType } from "../../PrimType"
import * as Primitive from "../../PrimType"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a single command-line argument.
 */
export class Single<A> extends Base<A> {
  readonly _tag = "Single"

  constructor(
    /**
     * The pseudo-name used to refer to the command-line argument.
     */
    readonly pseudoName: Option<string>,
    /**
     * The backing primitive type for the command-line argument.
     */
    readonly primType: PrimType<A>,
    /**
     * The description of the command-line argument.
     */
    readonly description: HelpDoc = Help.empty
  ) {
    super()
  }

  get name(): string {
    return `<${O.getOrElse_(this.pseudoName, () => Primitive.typeName(this.primType))}>`
  }
}
