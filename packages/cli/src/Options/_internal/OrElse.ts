// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import type { Either } from "@effect-ts/core/Either"
import * as E from "@effect-ts/core/Either"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

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
 * Represents alternative command-line options.
 *
 * In the event that the `left` command cannot be validated successfully, the
 * command-line application will attempt to validate the `right` command from
 * the provided arguments.
 */
export class OrElse<A, B> extends Base<Either<A, B>> {
  readonly _tag = "OrElse"

  constructor(
    /**
     * The first command-line option to attempt.
     */
    readonly left: Options<A>,
    /**
     * The second command-line option to attempt.
     */
    readonly right: Options<B>
  ) {
    super()
  }
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validate_<A, B>(
  self: OrElse<A, B>,
  args: Array<string>,
  cont: (
    a: Options<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<ValidationError, Tuple<[Array<string>, any]>>,
  uid: (a: Options<any>) => Option<string>,
  config: CliConfig = Config.defaultConfig
): T.IO<ValidationError, Tuple<[Array<string>, Either<A, B>]>> {
  return T.foldM_(
    cont(self.left, args, config),
    (err1) =>
      T.foldM_(
        cont(self.right, args, config),
        (err2) => {
          if (err1.type._tag === "MissingValue" && err2.type._tag === "MissingValue") {
            return T.fail(
              Validation.missingValueError(Help.sequence_(err1.error, err2.error))
            )
          } else {
            return T.fail(
              Validation.invalidValueError(Help.sequence_(err1.error, err2.error))
            )
          }
        },
        (success) =>
          T.succeed(Tp.tuple(Tp.get_(success, 0), E.right(Tp.get_(success, 1))))
      ),
    (result) =>
      T.foldM_(
        cont(self.right, result.get(0), config),
        (_) => T.succeed(Tp.tuple(Tp.get_(result, 0), E.left(Tp.get_(result, 1)))),
        (_) =>
          T.fail(
            Validation.invalidValueError(
              Help.p(
                Help.error(
                  "Options collision detected. You can only specify " +
                    `either '${O.getOrElse_(uid(self.left), () => "unknown")}' ` +
                    `or '${O.getOrElse_(uid(self.right), () => "unknown")}'.`
                )
              )
            )
          )
      )
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
  uid: (a: Options<any>) => Option<string>,
  config: CliConfig = Config.defaultConfig
) {
  return <A, B>(
    self: OrElse<A, B>
  ): T.IO<ValidationError, Tuple<[Array<string>, Either<A, B>]>> =>
    validate_(self, args, cont, uid, config)
}

// -----------------------------------------------------------------------------
// Modification
// -----------------------------------------------------------------------------

export function modifySingle_<A, B>(
  self: OrElse<A, B>,
  modifier: SingleModifier,
  cont: (a: Options<any>, modifier: SingleModifier) => Options<any>
): Options<Either<A, B>> {
  return new OrElse(cont(self.left, modifier), cont(self.right, modifier))
}

/**
 * @ets_data_first modifySingle_
 */
export function modifySingle(
  modifier: SingleModifier,
  cont: (a: Options<any>, modifier: SingleModifier) => Options<any>
) {
  return <A, B>(self: OrElse<A, B>): Options<Either<A, B>> =>
    modifySingle_(self, modifier, cont)
}
