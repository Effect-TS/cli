// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
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
 * Represents a variable number of arguments.
 */
export class Variadic<A> implements Args<Array<A>> {
  constructor(
    /**
     * The command-line argument which can be repeated.
     */
    readonly value: Args<A>,
    /**
     * The minimum number of allowed repetitions of the command-line argument.
     */
    readonly min: Option<number>,
    /**
     * The maximum number of allowed repetitions of the command-line argument.
     */
    readonly max: Option<number>
  ) {}

  get minSize(): number {
    return O.getOrElse_(this.min, () => 0) * this.value.minSize
  }

  get maxSize(): number {
    return (
      O.getOrElse_(this.max, () => Number.MAX_SAFE_INTEGER / 2) * this.value.maxSize
    )
  }

  get helpDoc(): HelpDoc {
    return Help.mapDescriptionList_(this.value.helpDoc, ({ tuple: [name, desc] }) => {
      const newName = Help.concat_(
        name,
        Help.text(
          O.isSome(this.max)
            ? ` ${this.minSize} - ${this.maxSize}`
            : this.minSize === 0
            ? "..."
            : ` ${this.minSize}+`
        )
      )

      const newDesc = Help.blocksT(
        desc,
        Help.empty,
        Help.p(
          O.isSome(this.max)
            ? `This argument must be repeated at least ${this.minSize} ` +
                `times and may be repeated up to ${this.maxSize} times.`
            : this.minSize === 0
            ? `This argument may be repeated zero or more times.`
            : `This argument must be repeated at least ${this.minSize} times.`
        )
      )

      return Tp.tuple(newName, newDesc)
    })
  }

  get synopsis(): UsageSynopsis {
    return Synopsis.repeated(this.value.synopsis)
  }

  addDescription(text: string): Args<Array<A>> {
    return new Variadic(this.value.addDescription(text), this.min, this.max)
  }

  validate(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<HelpDoc, Tuple<[Array<string>, Array<A>]>> {
    const min = O.getOrElse_(this.min, () => 0)
    const max = O.getOrElse_(this.max, () => Number.MAX_SAFE_INTEGER)
    const value = this.value

    function loop(
      args: Array<string>,
      acc: Array<A>
    ): IO<HelpDoc, Tuple<[Array<string>, Array<A>]>> {
      if (acc.length >= max) {
        return T.succeed(Tp.tuple(args, acc))
      } else {
        return T.foldM_(
          value.validate(args, config),
          (failure) =>
            acc.length >= min && A.isEmpty(args)
              ? T.succeed(Tp.tuple(args, acc))
              : T.fail(failure),
          ({ tuple: [args, a] }) => loop(args, A.cons_(acc, a))
        )
      }
    }

    return T.map_(loop(args, A.emptyOf<A>()), Tp.update(1, A.reverse))
  }
}
