// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"

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
 * Represents a sequence of two arguments.
 *
 * The `head` `Args` will be validated first, followed by the `tail` `Args`.
 */
export class Both<A, B> extends Base<Tuple<[A, B]>> {
  readonly _tag = "Both"

  constructor(
    /**
     * The first command-line argument to validate.
     */
    readonly head: Args<A>,
    /**
     * The second command-line argument to validate.
     */
    readonly tail: Args<B>
  ) {
    super()
  }
}

// -----------------------------------------------------------------------------
// Minimum Size
// -----------------------------------------------------------------------------

export function getBothMinSize_<A, B>(
  self: Both<A, B>,
  cont: (a: Args<any>) => number
): number {
  return cont(self.head) + cont(self.tail)
}

/**
 * @ets_data_first getBothMinSize_
 */
export function getBothMinSize(cont: (a: Args<any>) => number) {
  return <A, B>(self: Both<A, B>): number => getBothMinSize_(self, cont)
}

// -----------------------------------------------------------------------------
// Maximum Size
// -----------------------------------------------------------------------------

export function getBothMaxSize_<A, B>(
  self: Both<A, B>,
  cont: (a: Args<any>) => number
): number {
  return cont(self.head) + cont(self.tail)
}

/**
 * @ets_data_first getBothMaxSize_
 */
export function getBothMaxSize(cont: (a: Args<any>) => number) {
  return <A, B>(self: Both<A, B>): number => getBothMaxSize_(self, cont)
}

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export function getBothHelpDoc_<A, B>(
  self: Both<A, B>,
  cont: (a: Args<any>) => HelpDoc
): HelpDoc {
  return Help.concat_(cont(self.head), cont(self.tail))
}

/**
 * @ets_data_first getBothHelpDoc_
 */
export function getBothHelpDoc(cont: (a: Args<any>) => HelpDoc) {
  return <A, B>(self: Both<A, B>): HelpDoc => getBothHelpDoc_(self, cont)
}

// -----------------------------------------------------------------------------
// UsageSynopsis
// -----------------------------------------------------------------------------

export function getBothUsageSynopsis_<A, B>(
  self: Both<A, B>,
  cont: (a: Args<any>) => UsageSynopsis
): UsageSynopsis {
  return Synopsis.concat_(cont(self.head), cont(self.tail))
}

/**
 * @ets_data_first getBothUsageSynopsis_
 */
export function getBothUsageSynopsis(cont: (a: Args<any>) => UsageSynopsis) {
  return <A, B>(self: Both<A, B>): UsageSynopsis => getBothUsageSynopsis_(self, cont)
}

// -----------------------------------------------------------------------------
// Description
// -----------------------------------------------------------------------------

export function addBothDescription_<A, B>(
  self: Both<A, B>,
  text: string,
  cont: (a: Args<any>, text: string) => Args<any>
): Args<Tuple<[A, B]>> {
  return new Both(cont(self.head, text), cont(self.tail, text))
}

/**
 * @ets_data_first addBothDescription_
 */
export function addBothDescription(
  text: string,
  cont: (a: Args<any>, text: string) => Args<any>
) {
  return <A, B>(self: Both<A, B>): Args<Tuple<[A, B]>> =>
    addBothDescription_(self, text, cont)
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validateBoth_<A, B>(
  self: Both<A, B>,
  args: Array<string>,
  config: CliConfig = Config.defaultConfig,
  cont: (
    a: Args<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<HelpDoc, Tuple<[Array<string>, any]>>
): T.IO<HelpDoc, Tuple<[Array<string>, Tuple<[A, B]>]>> {
  return T.chain_(cont(self.head, args, config), ({ tuple: [args1, a] }) =>
    T.map_(cont(self.tail, args1, config), ({ tuple: [args2, b] }) =>
      Tp.tuple(args2, Tp.tuple(a, b))
    )
  )
}

/**
 * @ets_data_first validateBoth_
 */
export function validateBoth(
  args: Array<string>,
  config: CliConfig = Config.defaultConfig,
  cont: (
    a: Args<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<HelpDoc, Tuple<[Array<string>, any]>>
) {
  return <A, B>(
    self: Both<A, B>
  ): T.IO<HelpDoc, Tuple<[Array<string>, Tuple<[A, B]>]>> =>
    validateBoth_(self, args, config, cont)
}
