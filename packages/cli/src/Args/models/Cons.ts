// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import type { Tuple } from "@effect-ts/system/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/system/Collections/Immutable/Tuple"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { UsageSynopsis } from "../../UsageSynopsis"
import * as Synopsis from "../../UsageSynopsis"
import type { Args } from "../definition"

/**
 * Represents a sequence of two arguments.
 *
 * The `head` option will be validated first, followed by the `tail` option.
 */
export class Cons<A, B> implements Args<Tuple<[A, B]>> {
  constructor(
    /**
     * The first command-line argument to validate.
     */
    readonly head: Args<A>,
    /**
     * The second command-line argument to validate.
     */
    readonly tail: Args<B>
  ) {}

  get minSize(): number {
    return this.head.minSize + this.tail.minSize
  }

  get maxSize(): number {
    return this.head.maxSize + this.tail.maxSize
  }

  get helpDoc(): HelpDoc {
    return Help.concat_(this.head.helpDoc, this.tail.helpDoc)
  }

  get synopsis(): UsageSynopsis {
    return Synopsis.concat_(this.head.synopsis, this.tail.synopsis)
  }

  addDescription(text: string): Args<Tuple<[A, B]>> {
    return new Cons(this.head.addDescription(text), this.tail.addDescription(text))
  }

  validate(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<HelpDoc, Tuple<[Array<string>, Tuple<[A, B]>]>> {
    return T.chain_(this.head.validate(args, config), ({ tuple: [args1, a] }) =>
      T.map_(this.tail.validate(args1, config), ({ tuple: [args2, b] }) =>
        Tp.tuple(args2, Tp.tuple(a, b))
      )
    )
  }
}
