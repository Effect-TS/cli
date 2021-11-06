// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import * as Help from "../../Help"
import type { ValidationError } from "../../Validation"
import * as Validation from "../../Validation"
import type { Options } from "./Base"
import { Base } from "./Base"
import type { SingleModifier } from "./Single"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a sequence of two options.
 *
 * The `head` option will be validated first, followed by the `tail` option.
 */
export class Both<A, B> extends Base<Tuple<[A, B]>> {
  readonly _tag = "Both"

  constructor(
    /**
     * The first command-line argument to validate.
     */
    readonly head: Options<A>,
    /**
     * The second command-line argument to validate.
     */
    readonly tail: Options<B>
  ) {
    super()
  }
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validate_<A, B>(
  self: Both<A, B>,
  args: Array<string>,
  cont: (
    a: Options<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<ValidationError, Tuple<[Array<string>, any]>>,
  config: CliConfig = Config.defaultConfig
): T.IO<ValidationError, Tuple<[Array<string>, Tuple<[A, B]>]>> {
  return T.chain_(
    T.catchAll_(cont(self.head, args, config), (err1) =>
      T.foldM_(
        cont(self.tail, args, config),
        (err2) =>
          T.fail(Validation.missingValueError(Help.sequence_(err1.error, err2.error))),
        () => T.fail(err1)
      )
    ),
    ({ tuple: [args1, a] }) => {
      return T.map_(cont(self.tail, args1, config), ({ tuple: [args2, b] }) => {
        return Tp.tuple(args2, Tp.tuple(a, b))
      })
    }
  )
}

/**
 * @ets_data_first validate_
 */
export function validate(
  args: Array<string>,
  cont: (
    a: Options<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<ValidationError, Tuple<[Array<string>, any]>>,
  config: CliConfig = Config.defaultConfig
) {
  return <A, B>(
    self: Both<A, B>
  ): T.IO<ValidationError, Tuple<[Array<string>, Tuple<[A, B]>]>> =>
    validate_(self, args, cont, config)
}

// -----------------------------------------------------------------------------
// Modification
// -----------------------------------------------------------------------------

export function modifySingle_<A, B>(
  self: Both<A, B>,
  modifier: SingleModifier,
  cont: (a: Options<any>, modifier: SingleModifier) => Options<any>
): Options<Tuple<[A, B]>> {
  return new Both(cont(self.head, modifier), cont(self.tail, modifier))
}

/**
 * @ets_data_first modifySingle_
 */
export function modifySingle(
  modifier: SingleModifier,
  cont: (a: Options<any>, modifier: SingleModifier) => Options<any>
) {
  return <A, B>(self: Both<A, B>): Options<Tuple<[A, B]>> =>
    modifySingle_(self, modifier, cont)
}
