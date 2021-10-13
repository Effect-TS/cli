// ets_tracing: off

import type * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import { matchTag_ } from "@effect-ts/core/Utils"

import type { CliConfig } from "../CliConfig"
import * as Config from "../CliConfig"
import type { HelpDoc } from "../Help"
import * as Bool from "./_internal/Bool"
import * as Date from "./_internal/Date"
import * as Enumeration from "./_internal/Enumeration"
import * as Float from "./_internal/Float"
import * as Integer from "./_internal/Integer"
import * as Path from "./_internal/Path"
import * as Text from "./_internal/Text"
import type { Instruction, PrimType } from "./definition"

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

/**
 * @ets_tagtimize identity
 */
export function instruction<A>(self: PrimType<A>): Instruction {
  // @ts-expect-error
  return self
}

/**
 * Returns the type name for the specified `PrimType`.
 */
export function typeName<A>(self: PrimType<A>): string {
  return matchTag_(instruction(self), {
    Bool: () => Bool.typeName,
    Date: () => Date.typeName,
    Enumeration: (_) => Enumeration.typeName,
    Float: () => Float.typeName,
    Integer: () => Integer.typeName,
    Path: (_) => Path.typeName(_),
    Text: () => Text.typeName
  })
}

/**
 * Returns the `HelpDoc` for the specified `PrimType`.
 */
export function helpDoc<A>(self: PrimType<A>): HelpDoc {
  return matchTag_(instruction(self), {
    Bool: () => Bool.helpDoc,
    Date: () => Date.helpDoc,
    Enumeration: (_) => Enumeration.helpDoc(_),
    Float: () => Float.helpDoc,
    Integer: () => Integer.helpDoc,
    Path: (_) => Path.helpDoc(_),
    Text: () => Text.helpDoc
  })
}

/**
 * Returns the valid choices for the specified `PrimType`.
 */
export function choices<A>(self: PrimType<A>): Option<string> {
  const I = instruction(self)
  return I._tag === "Enumeration" ? O.some(Enumeration.choices(I)) : O.none
}

/**
 * Validate the provided value against the specified `PrimType`.
 */
export function validate_<A>(
  self: PrimType<A>,
  value: Option<string>,
  config: CliConfig = Config.defaultConfig
): T.IO<string, A> {
  return matchTag_(instruction(self), {
    Bool: (_) => Bool.validate_(_, value, config),
    Date: () => Date.validate(value),
    Enumeration: (_) => Enumeration.validate_(_, value),
    Float: () => Float.validate(value),
    Integer: () => Integer.validate(value),
    Path: (_) => Path.validate_(_, value),
    Text: () => Text.validate(value)
  }) as T.IO<string, A>
}

/**
 * Validate the provided value against the specified `PrimType`.
 *
 * @ets_data_first validate_
 */
export function validate(
  value: Option<string>,
  config: CliConfig = Config.defaultConfig
) {
  return <A>(self: PrimType<A>): T.IO<string, A> => validate_(self, value, config)
}
