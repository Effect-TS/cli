// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import type { Either } from "@effect-ts/core/Either"
import * as E from "@effect-ts/core/Either"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { ValidationError } from "../../Validation"
import type { Options } from "./Base"
import { Base } from "./Base"
import type { SingleModifier } from "./Single"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents the mapping of the value of an option from one type to
 * another.
 */
export class Map<A, B> extends Base<B> {
  readonly _tag = "Map"

  constructor(
    /**
     * The command-line option.
     */
    readonly value: Options<A>,
    /**
     * The mapping function to be applied to the value of the command-line
     * option.
     */
    readonly map: (a: A) => Either<ValidationError, B>
  ) {
    super()
  }
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validateMap_<A, B>(
  self: Map<A, B>,
  args: Array<string>,
  cont: (
    a: Options<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<ValidationError, Tuple<[Array<string>, any]>>,
  config: CliConfig = Config.defaultConfig
): T.IO<ValidationError, Tuple<[Array<string>, B]>> {
  return T.chain_(cont(self.value, args, config), (result) =>
    E.fold_(
      self.map(result.get(1)),
      (e) => T.fail(e),
      (s) => T.succeed(Tp.tuple(result.get(0), s))
    )
  )
}

/**
 * @ets_data_first validateMap_
 */
export function validateMap<A, B>(
  self: Map<A, B>,
  args: Array<string>,
  cont: (
    a: Options<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<ValidationError, Tuple<[Array<string>, any]>>,
  config: CliConfig = Config.defaultConfig
) {
  return <A, B>(self: Map<A, B>): T.IO<ValidationError, Tuple<[Array<string>, B]>> =>
    validateMap_(self, args, cont, config)
}

// -----------------------------------------------------------------------------
// Modification
// -----------------------------------------------------------------------------

export function modifyMap_<A, B>(
  self: Map<A, B>,
  modifier: SingleModifier,
  cont: (a: Options<any>, modifier: SingleModifier) => Options<any>
): Options<B> {
  return new Map(cont(self.value, modifier), self.map)
}

/**
 * @ets_data_first modifyMap_
 */
export function modifyMap(
  modifier: SingleModifier,
  cont: (a: Options<any>, modifier: SingleModifier) => Options<any>
) {
  return <A, B>(self: Map<A, B>): Options<B> => modifyMap_(self, modifier, cont)
}
