// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import type { Either } from "@effect-ts/core/Either"
import * as E from "@effect-ts/core/Either"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { HelpDoc } from "../../Help"
import type { UsageSynopsis } from "../../UsageSynopsis"
import type { Args } from "./Base"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents the mapping of the value of a command-line argument from one
 * type to another.
 */
export class Map<A, B> extends Base<B> {
  readonly _tag = "Map"

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
  ) {
    super()
  }
}

// -----------------------------------------------------------------------------
// Minimum Size
// -----------------------------------------------------------------------------

export function minSize_<A, B>(
  self: Map<A, B>,
  cont: (a: Args<any>) => number
): number {
  return cont(self.value)
}

/**
 * @ets_data_first minSize_
 */
export function minSize(cont: (a: Args<any>) => number) {
  return <A, B>(self: Map<A, B>): number => minSize_(self, cont)
}

// -----------------------------------------------------------------------------
// Maximum Size
// -----------------------------------------------------------------------------

export function maxSize_<A, B>(
  self: Map<A, B>,
  cont: (a: Args<any>) => number
): number {
  return cont(self.value)
}

/**
 * @ets_data_first maxSize_
 */
export function maxSize(cont: (a: Args<any>) => number) {
  return <A, B>(self: Map<A, B>): number => maxSize_(self, cont)
}

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export function helpDoc_<A, B>(
  self: Map<A, B>,
  cont: (a: Args<any>) => HelpDoc
): HelpDoc {
  return cont(self.value)
}

/**
 * @ets_data_first helpDoc_
 */
export function helpDoc(cont: (a: Args<any>) => HelpDoc) {
  return <A, B>(self: Map<A, B>): HelpDoc => helpDoc_(self, cont)
}

// -----------------------------------------------------------------------------
// UsageSynopsis
// -----------------------------------------------------------------------------

export function synopsis_<A, B>(
  self: Map<A, B>,
  cont: (a: Args<any>) => UsageSynopsis
): UsageSynopsis {
  return cont(self.value)
}

/**
 * @ets_data_first synopsis_
 */
export function synopsis(cont: (a: Args<any>) => UsageSynopsis) {
  return <A, B>(self: Map<A, B>): UsageSynopsis => synopsis_(self, cont)
}

// -----------------------------------------------------------------------------
// Description
// -----------------------------------------------------------------------------

export function addDescription_<A, B>(
  self: Map<A, B>,
  text: string,
  cont: (a: Args<any>, text: string) => Args<any>
): Args<B> {
  return new Map(cont(self.value, text), self.map)
}

/**
 * @ets_data_first addDescription_
 */
export function addDescription(
  text: string,
  cont: (a: Args<any>, text: string) => Args<any>
) {
  return <A, B>(self: Map<A, B>): Args<B> => addDescription_(self, text, cont)
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validate_<A, B>(
  self: Map<A, B>,
  args: Array<string>,
  config: CliConfig = Config.defaultConfig,
  cont: (
    a: Args<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<HelpDoc, Tuple<[Array<string>, any]>>
): T.IO<HelpDoc, Tuple<[Array<string>, B]>> {
  return T.chain_(cont(self.value, args, config), ({ tuple: [args, value] }) =>
    E.fold_(self.map(value), T.fail, (b) => T.succeed(Tp.tuple(args, b)))
  )
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
  return <A, B>(self: Map<A, B>): T.IO<HelpDoc, Tuple<[Array<string>, B]>> =>
    validate_(self, args, config, cont)
}
