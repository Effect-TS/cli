import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

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
 * Represents a sequence of two options.
 *
 * The `head` option will be validated first, followed by the `tail` option.
 */
export class Cons<A, B> implements Options<Tuple<[A, B]>> {
  constructor(
    /**
     * The first command-line argument to validate.
     */
    readonly head: Options<A>,
    /**
     * The second command-line argument to validate.
     */
    readonly tail: Options<B>
  ) {}

  get uid(): Option<string> {
    const uids = A.compact([this.head.uid, this.tail.uid])
    return uids.length === 0 ? O.none : O.some(uids.join(", "))
  }

  get helpDoc(): HelpDoc {
    return Help.sequence_(this.head.helpDoc, this.tail.helpDoc)
  }

  get synopsis(): UsageSynopsis {
    return Synopsis.concat_(this.head.synopsis, this.tail.synopsis)
  }

  validate(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<ValidationError, Tuple<[Array<string>, Tuple<[A, B]>]>> {
    return T.chain_(
      T.catchAll_(this.head.validate(args, config), (err1) =>
        T.foldM_(
          this.tail.validate(args, config),
          (err2) =>
            T.fail(
              Validation.missingValueError(Help.sequence_(err1.error, err2.error))
            ),
          () => T.fail(err1)
        )
      ),
      ({ tuple: [args1, a] }) => {
        return T.map_(this.tail.validate(args1, config), ({ tuple: [args2, b] }) => {
          return Tp.tuple(args2, Tp.tuple(a, b))
        })
      }
    )
  }

  modifySingle(modifier: SingleModifier): Options<Tuple<[A, B]>> {
    return new Cons(this.head.modifySingle(modifier), this.tail.modifySingle(modifier))
  }
}
