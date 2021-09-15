import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import type { Show } from "@effect-ts/core/Show"
import type { Tuple } from "@effect-ts/system/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/system/Collections/Immutable/Tuple"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { UsageSynopsis } from "../../UsageSynopsis"
import type { ValidationError } from "../../Validation"
import * as Validation from "../../Validation"
import type { Options } from "../definition"
import type { SingleModifier } from "./Single"

/**
 * Represents an option that has a default value.
 */
export class WithDefault<A> implements Options<A> {
  constructor(
    /**
     * The command-line option which will be give a default value.
     */
    readonly options: Options<A>,
    /**
     * The default value for the command-line option.
     */
    readonly defaultValue: A,
    /**
     * The description of the default value.
     */
    readonly defaultDescription: string,
    /**
     * An instance of `Show` for the default value.
     *
     * Used when rendering help messages.
     */
    readonly showDefaultValue: Show<A>
  ) {}

  get uid(): Option<string> {
    return this.options.uid
  }

  get helpDoc(): HelpDoc {
    return Help.mapDescriptionList_(this.options.helpDoc, (definition) => {
      const span = definition.get(0)
      const block = definition.get(1)
      return Tp.tuple(
        span,
        Help.sequence_(
          block,
          Help.p(
            `This setting is optional. If unspecified, the default value of ` +
              `this option is '${this.showDefaultValue.show(this.defaultValue)}'` +
              `. ${this.defaultDescription}`
          )
        )
      )
    })
  }

  get synopsis(): UsageSynopsis {
    return this.options.synopsis
  }

  validate(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<ValidationError, Tuple<[Array<string>, A]>> {
    return T.foldM_(
      this.options.validate(args, config),
      (invalid) =>
        Validation.isOptionMissing(invalid)
          ? T.succeed(Tp.tuple(args, this.defaultValue))
          : T.fail(invalid),
      T.succeed
    )
  }

  public modifySingle(modifier: SingleModifier): Options<A> {
    return new WithDefault(
      this.options.modifySingle(modifier),
      this.defaultValue,
      this.defaultDescription,
      this.showDefaultValue
    )
  }
}
