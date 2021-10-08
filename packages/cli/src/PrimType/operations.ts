// ets_tracing: off

import type * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import { matchTag_ } from "@effect-ts/core/Utils"

import type { CliConfig } from "../CliConfig"
import * as Config from "../CliConfig"
import type { HelpDoc } from "../Help"
import * as Primitives from "./_internal"
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
 * Returns the `HelpDoc` for the specified `PrimType`.
 */
export function helpDoc<A>(self: PrimType<A>): HelpDoc {
  return matchTag_(instruction(self), {
    Bool: () => Primitives.boolHelpDoc,
    Date: () => Primitives.dateHelpDoc,
    Enumeration: (_) => Primitives.getEnumerationHelpDoc(_),
    Float: () => Primitives.floatHelpDoc,
    Integer: () => Primitives.integerHelpDoc,
    Path: (_) => Primitives.getPathHelpDoc(_),
    Text: () => Primitives.textHelpDoc
  })
}

/**
 * Returns the type name for the specified `PrimType`.
 */
export function typeName<A>(self: PrimType<A>): string {
  return matchTag_(instruction(self), {
    Bool: () => Primitives.boolTypeName,
    Date: () => Primitives.dateTypeName,
    Enumeration: (_) => Primitives.enumerationTypeName,
    Float: () => Primitives.floatTypeName,
    Integer: () => Primitives.integerTypeName,
    Path: (_) => Primitives.getPathTypeName(_),
    Text: () => Primitives.textTypeName
  })
}

/**
 * Returns the valid choices for the specified `PrimType`.
 */
export function choices<A>(self: PrimType<A>): Option<string> {
  const I = instruction(self)
  return I._tag === "Enumeration" ? O.some(Primitives.getEnumerationChoices(I)) : O.none
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
    Bool: Primitives.validateBool(value, config),
    Date: () => Primitives.validateDate(value),
    Enumeration: Primitives.validateEnumeration(value),
    Float: () => Primitives.validateFloat(value),
    Integer: () => Primitives.validateInteger(value),
    Path: Primitives.validatePath(value),
    Text: () => Primitives.validateText(value)
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
