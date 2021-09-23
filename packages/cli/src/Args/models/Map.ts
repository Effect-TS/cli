// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import type { Either } from "@effect-ts/core/Either"
import * as E from "@effect-ts/core/Either"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { HelpDoc } from "../../Help"
import type { UsageSynopsis } from "../../UsageSynopsis"
import type { Args } from "../definition"

/**
 * Represents the mapping of the value of a command-line argument from one
 * type to another.
 */
export class Map<A, B> implements Args<B> {
  constructor(
    /**
     * The command-line argument.
     */
    readonly value: Args<A>,
    /**
     * The mapping function to be applied to the value of the command-line
     * argument.
     */
    readonly map: (a: A) => Either<HelpDoc, B>
  ) {}

  get minSize(): number {
    return this.value.minSize
  }

  get maxSize(): number {
    return this.value.maxSize
  }

  get helpDoc(): HelpDoc {
    return this.value.helpDoc
  }

  get synopsis(): UsageSynopsis {
    return this.value.synopsis
  }

  addDescription(text: string): Args<B> {
    return new Map(this.value.addDescription(text), this.map)
  }

  validate(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<HelpDoc, Tuple<[Array<string>, B]>> {
    return T.chain_(this.value.validate(args, config), ({ tuple: [args, value] }) => {
      return E.fold_(this.map(value), T.fail, (b) => T.succeed(Tp.tuple(args, b)))
    })
  }
}
