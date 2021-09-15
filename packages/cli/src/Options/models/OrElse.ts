import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import type { Either } from "@effect-ts/core/Either"
import * as E from "@effect-ts/core/Either"
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
import type { ValidationError } from "../../Validation"
import * as Validation from "../../Validation"
import type { Options } from "../definition"
import type { SingleModifier } from "./Single"

/**
 * Represents alternative command-line options.
 *
 * In the event that the `left` command cannot be validated successfully, the
 * command-line application will attempt to validate the `right` command from
 * the provided arguments.
 */
export class OrElse<A, B> implements Options<Either<A, B>> {
  constructor(readonly left: Options<A>, readonly right: Options<B>) {}

  get uid(): Option<string> {
    const uids = A.compact([this.left.uid, this.right.uid])
    return uids.length === 0 ? O.none : O.some(uids.join(", "))
  }

  get helpDoc(): HelpDoc {
    return Help.sequence_(this.left.helpDoc, this.right.helpDoc)
  }

  get synopsis(): UsageSynopsis {
    return Synopsis.concat_(this.left.synopsis, this.right.synopsis)
  }

  validate(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<ValidationError, Tuple<[Array<string>, Either<A, B>]>> {
    return T.foldM_(
      this.left.validate(args, config),
      (err1) =>
        T.foldM_(
          this.right.validate(args, config),
          (err2) => {
            if (
              err1.type._tag === "MissingValue" &&
              err2.type._tag === "MissingValue"
            ) {
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
          this.right.validate(Tp.get_(result, 0), config),
          (_) => T.succeed(Tp.tuple(Tp.get_(result, 0), E.left(Tp.get_(result, 1)))),
          (_) =>
            T.fail(
              Validation.invalidValueError(
                Help.p(
                  Help.error(
                    "Options collision detected. You can only specify " +
                      `either '${O.getOrElse_(this.left.uid, () => "unknown")}' ` +
                      `or '${O.getOrElse_(this.right.uid, () => "unknown")}'.`
                  )
                )
              )
            )
        )
    )
  }

  modifySingle(modifier: SingleModifier): Options<Either<A, B>> {
    return new OrElse(
      this.left.modifySingle(modifier),
      this.right.modifySingle(modifier)
    )
  }
}

// -----------------------------------------------------------------------------
// Both
// -----------------------------------------------------------------------------

export class Both<A, B> implements Options<Tuple<[A, B]>> {
  constructor(readonly left: Options<A>, readonly right: Options<B>) {}

  get uid(): Option<string> {
    const uids = A.compact([this.left.uid, this.right.uid])
    return uids.length === 0 ? O.none : O.some(uids.join(", "))
  }

  get helpDoc(): HelpDoc {
    return Help.sequence_(this.left.helpDoc, this.right.helpDoc)
  }

  get synopsis(): UsageSynopsis {
    return Synopsis.concat_(this.left.synopsis, this.right.synopsis)
  }

  validate(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<ValidationError, Tuple<[Array<string>, Tuple<[A, B]>]>> {
    return T.chain_(
      T.catchAll_(this.left.validate(args, config), (err1) =>
        T.foldM_(
          this.right.validate(args, config),
          (err2) =>
            T.fail(
              Validation.missingValueError(Help.sequence_(err1.error, err2.error))
            ),
          () => T.fail(err1)
        )
      ),
      (tuple1) => {
        const args1 = Tp.get_(tuple1, 0)
        const a = Tp.get_(tuple1, 1)
        return T.map_(this.right.validate(args1, config), (tuple2) => {
          const args2 = Tp.get_(tuple2, 0)
          const b = Tp.get_(tuple2, 1)
          return Tp.tuple(args2, Tp.tuple(a, b))
        })
      }
    )
  }

  modifySingle(modifier: SingleModifier): Options<Tuple<[A, B]>> {
    return new Both(this.left.modifySingle(modifier), this.right.modifySingle(modifier))
  }
}
