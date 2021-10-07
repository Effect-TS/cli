// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import { _A } from "@effect-ts/core/Effect"
import type { Either } from "@effect-ts/core/Either"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

import type { HelpDoc } from "../Help"
import * as Help from "../Help"
import type { PrimType } from "../PrimType"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export const ArgsSymbol = Symbol()

export type ArgsSymbol = typeof ArgsSymbol

/**
 * Represents arguments that can be passed to a command-line application.
 */
export interface Args<A> {
  readonly [ArgsSymbol]: ArgsSymbol
  readonly [_A]: () => A
}

export class Base<A> implements Args<A> {
  readonly [ArgsSymbol]: ArgsSymbol;
  readonly [_A]: () => A
}

/**
 * Represents the absence of a command-line argument.
 */
export class None extends Base<void> {
  readonly _tag = "None"
}

/**
 * Represents a single command-line argument.
 */
export class Single<A> extends Base<A> {
  readonly _tag = "Single"

  constructor(
    /**
     * The pseudo-name used to refer to the command-line argument.
     */
    readonly pseudoName: Option<string>,
    /**
     * The backing primitive type for the command-line argument.
     */
    readonly primType: PrimType<A>,
    /**
     * The description of the command-line argument.
     */
    readonly description: HelpDoc = Help.empty
  ) {
    super()
  }

  get name(): string {
    return `<${O.getOrElse_(this.pseudoName, () => this.primType.typeName)}>`
  }
}

/**
 * Represents the mapping of the value of a command-line argument from one
 * type to another.
 */
export class Map<A, B> extends Base<B> {
  readonly _tag = "Map"

  constructor(
    /**
     * The command-line argument.
     */
    readonly value: Args<A>,
    /**
     * The mapping function to be applied to the value of the command-line
     * argument.
     */
    readonly map: (a: A) => Either<HelpDoc, B>
  ) {
    super()
  }
}

/**
 * Represents a sequence of two arguments.
 *
 * The `head` `Args` will be validated first, followed by the `tail` `Args`.
 */
export class Both<A, B> extends Base<Tuple<[A, B]>> {
  readonly _tag = "Both"

  constructor(
    /**
     * The first command-line argument to validate.
     */
    readonly head: Args<A>,
    /**
     * The second command-line argument to validate.
     */
    readonly tail: Args<B>
  ) {
    super()
  }
}

/**
 * Represents a variable number of command-line arguments.
 */
export class Variadic<A> extends Base<Array<A>> {
  readonly _tag = "Variadic"

  constructor(
    /**
     * The command-line argument which can be repeated.
     */
    readonly value: Args<A>,
    /**
     * The minimum number of allowed repetitions of the command-line argument.
     */
    readonly min: Option<number>,
    /**
     * The maximum number of allowed repetitions of the command-line argument.
     */
    readonly max: Option<number>
  ) {
    super()
  }
}

export type Instruction =
  | None
  | Single<any>
  | Both<any, any>
  | Map<any, any>
  | Variadic<any>

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

/**
 * @ets_tagtimize identity
 */
export function instruction<A>(self: Args<A>): Instruction {
  // @ts-expect-error
  return self
}
