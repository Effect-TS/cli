// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import type { Array } from "@effect-ts/core/Collections/Immutable/Array"

import type { BuiltInOption } from "../BuiltInOption/index.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type CommandDirective<A> = BuiltIn | UserDefined<A>

export class BuiltIn extends Tagged("BuiltIn")<{
  readonly option: BuiltInOption
}> {}

export class UserDefined<A> extends Tagged("UserDefined")<{
  readonly leftover: Array<string>
  readonly value: A
}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export function builtIn(option: BuiltInOption): CommandDirective<never> {
  return new BuiltIn({ option })
}

export function userDefined<A>(leftover: Array<string>, value: A): CommandDirective<A> {
  return new UserDefined({ leftover, value })
}

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

export function map_<A, B>(
  self: CommandDirective<A>,
  f: (a: A) => B
): CommandDirective<B> {
  switch (self._tag) {
    case "BuiltIn":
      return self
    case "UserDefined":
      return new UserDefined({ leftover: self.leftover, value: f(self.value) })
  }
}

/**
 * @ets_data_first map_
 */
export function map<A, B>(f: (a: A) => B) {
  return (self: CommandDirective<A>): CommandDirective<B> => map_(self, f)
}
