// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import type { Show } from "@effect-ts/core/Show"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { HelpDoc } from "../../Help"
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
 * Represents an option that has a default value.
 */
export class WithDefault<A> extends Base<A> {
  readonly _tag = "WithDefault"

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
  ) {
    super()
  }
}

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export function helpDoc_<A>(
  self: WithDefault<A>,
  cont: (a: Options<any>) => HelpDoc
): HelpDoc {
  return Help.mapDescriptionList_(cont(self.options), (definition) => {
    const span = definition.get(0)
    const block = definition.get(1)
    return Tp.tuple(
      span,
      Help.sequence_(
        block,
        Help.p(
          `This setting is optional. If unspecified, the default value of ` +
            `this option is '${self.showDefaultValue.show(self.defaultValue)}'` +
            `. ${self.defaultDescription}`
        )
      )
    )
  })
}

/**
 * @ets_data_first helpDoc_
 */
export function helpDoc(cont: (a: Options<any>) => HelpDoc) {
  return <A>(self: WithDefault<A>): HelpDoc => helpDoc_(self, cont)
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validate_<A>(
  self: WithDefault<A>,
  args: Array<string>,
  cont: (
    a: Options<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<ValidationError, Tuple<[Array<string>, any]>>,
  config: CliConfig = Config.defaultConfig
): T.IO<ValidationError, Tuple<[Array<string>, A]>> {
  return T.foldM_(
    cont(self.options, args, config),
    (invalid) =>
      Validation.isOptionMissing(invalid)
        ? T.succeed(Tp.tuple(args, self.defaultValue))
        : T.fail(invalid),
    T.succeed
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
  return <A>(self: WithDefault<A>): T.IO<ValidationError, Tuple<[Array<string>, A]>> =>
    validate_(self, args, cont, config)
}

// -----------------------------------------------------------------------------
// Modification
// -----------------------------------------------------------------------------

export function modifySingle_<A>(
  self: WithDefault<A>,
  modifier: SingleModifier,
  cont: (a: Options<any>, modifier: SingleModifier) => Options<any>
): Options<A> {
  return new WithDefault(
    cont(self.options, modifier),
    self.defaultValue,
    self.defaultDescription,
    self.showDefaultValue
  )
}

/**
 * @ets_data_first modifySingle_
 */
export function modifySingle(
  modifier: SingleModifier,
  cont: (a: Options<any>) => Options<any>
) {
  return <A>(self: WithDefault<A>): Options<A> => modifySingle_(self, modifier, cont)
}
