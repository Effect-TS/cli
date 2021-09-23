import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import type { Either } from "@effect-ts/core/Either"
import * as E from "@effect-ts/core/Either"
import type { Option } from "@effect-ts/core/Option"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { HelpDoc } from "../../Help"
import type { UsageSynopsis } from "../../UsageSynopsis"
import type { ValidationError } from "../../Validation"
import type { Options } from "../definition"
import type { SingleModifier } from "./Single"

export class Map<A, B> implements Options<B> {
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
  ) {}

  get uid(): Option<string> {
    return this.value.uid
  }

  get helpDoc(): HelpDoc {
    return this.value.helpDoc
  }

  get synopsis(): UsageSynopsis {
    return this.value.synopsis
  }

  validate(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<ValidationError, Tuple<[Array<string>, B]>> {
    return T.chain_(this.value.validate(args, config), (result) =>
      E.fold_(
        this.map(Tp.get_(result, 1)),
        (e) => T.fail(e),
        (s) => T.succeed(Tp.tuple(Tp.get_(result, 0), s))
      )
    )
  }

  modifySingle(modifier: SingleModifier): Options<B> {
    return new Map(this.value.modifySingle(modifier), this.map)
  }
}
