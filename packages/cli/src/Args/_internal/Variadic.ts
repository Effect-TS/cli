// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { UsageSynopsis } from "../../UsageSynopsis"
import * as Synopsis from "../../UsageSynopsis"
import type { Args } from "./Base"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a variable number of command-line arguments.
 */
export class Variadic<A> extends Base<Array<A>> {
  readonly _tag = "Variadic"

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
  ) {
    super()
  }
}

// -----------------------------------------------------------------------------
// Minimum Size
// -----------------------------------------------------------------------------

export function minSize_<A>(self: Variadic<A>, cont: (a: Args<any>) => number): number {
  return O.getOrElse_(self.min, () => 0) * cont(self.value)
}

/**
 * @ets_data_first minSize_
 */
export function minSize(cont: (a: Args<any>) => number) {
  return <A>(self: Variadic<A>): number => minSize_(self, cont)
}

// -----------------------------------------------------------------------------
// Maximum Size
// -----------------------------------------------------------------------------

export function maxSize_<A>(self: Variadic<A>, cont: (a: Args<any>) => number): number {
  return O.getOrElse_(self.min, () => Number.MAX_SAFE_INTEGER / 2) * cont(self.value)
}

/**
 * @ets_data_first maxSize_
 */
export function maxSize(cont: (a: Args<any>) => number) {
  return <A>(self: Variadic<A>): number => maxSize_(self, cont)
}

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export function helpDoc_<A>(
  self: Variadic<A>,
  cont: (a: Args<any>) => HelpDoc,
  minSize: (a: Args<any>) => number,
  maxSize: (a: Args<any>) => number
): HelpDoc {
  return Help.mapDescriptionList_(cont(self.value), ({ tuple: [name, desc] }) =>
    Tp.tuple(
      Help.concat_(
        name,
        Help.text(
          O.isSome(self.max)
            ? ` ${minSize(self)} - ${maxSize(self)}`
            : minSize(self) === 0
            ? "..."
            : ` ${minSize(self)}+`
        )
      ),
      Help.blocksT(
        desc,
        Help.empty,
        Help.p(
          O.isSome(self.max)
            ? `This argument must be repeated at least ${minSize(self)} ` +
                `times and may be repeated up to ${maxSize(self)} times.`
            : minSize(self) === 0
            ? `This argument may be repeated zero or more times.`
            : `This argument must be repeated at least ${minSize(self)} times.`
        )
      )
    )
  )
}

/**
 * @ets_data_first helpDoc_
 */
export function helpDoc(
  cont: (a: Args<any>) => HelpDoc,
  minSize: (a: Args<any>) => number,
  maxSize: (a: Args<any>) => number
) {
  return <A>(self: Variadic<A>): HelpDoc => helpDoc_(self, cont, minSize, maxSize)
}

// -----------------------------------------------------------------------------
// UsageSynopsis
// -----------------------------------------------------------------------------

export function synopsis_<A>(
  self: Variadic<A>,
  cont: (a: Args<any>) => UsageSynopsis
): UsageSynopsis {
  return Synopsis.repeated(cont(self.value))
}

/**
 * @ets_data_first synopsis_
 */
export function synopsis(cont: (a: Args<any>) => UsageSynopsis) {
  return <A>(self: Variadic<A>): UsageSynopsis => synopsis_(self, cont)
}

// -----------------------------------------------------------------------------
// Description
// -----------------------------------------------------------------------------

export function addDescription_<A>(
  self: Variadic<A>,
  text: string,
  cont: (a: Args<any>, text: string) => Args<any>
): Args<Array<A>> {
  return new Variadic(cont(self.value, text), self.min, self.max)
}

/**
 * @ets_data_first addDescription_
 */
export function addDescription(
  text: string,
  cont: (a: Args<any>, text: string) => Args<any>
) {
  return <A>(self: Variadic<A>): Args<Array<A>> => addDescription_(self, text, cont)
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validate_<A>(
  self: Variadic<A>,
  args: Array<string>,
  config: CliConfig = Config.defaultConfig,
  cont: (
    a: Args<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<HelpDoc, Tuple<[Array<string>, any]>>
): T.IO<HelpDoc, Tuple<[Array<string>, Array<A>]>> {
  const min = O.getOrElse_(self.min, () => 0)
  const max = O.getOrElse_(self.max, () => Number.MAX_SAFE_INTEGER)
  const value = self.value

  function loop(
    args: Array<string>,
    acc: Array<A>
  ): T.IO<HelpDoc, Tuple<[Array<string>, Array<A>]>> {
    if (acc.length >= max) {
      return T.succeed(Tp.tuple(args, acc))
    } else {
      return T.foldM_(
        cont(value, args, config),
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

/**
 * @ets_data_first validate_
 */
export function validate(
  args: Array<string>,
  config: CliConfig = Config.defaultConfig,
  cont: (
    a: Args<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<HelpDoc, Tuple<[Array<string>, any]>>
) {
  return <A>(self: Variadic<A>): T.IO<HelpDoc, Tuple<[Array<string>, Array<A>]>> =>
    validate_(self, args, config, cont)
}
