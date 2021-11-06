// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as Map from "@effect-ts/core/Collections/Immutable/Map"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import * as Equal from "@effect-ts/core/Equal"
import { not, pipe } from "@effect-ts/core/Function"
import * as String from "@effect-ts/core/String"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { ValidationError } from "../../Validation"
import type { Options } from "./Base"
import { Base } from "./Base"
import type { Single, SingleModifier } from "./Single"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a command-line option which takes a property flag as an option
 * and allows passing of multiple of key-value pairs as arguments.
 */
export class Mapping extends Base<Map.Map<string, string>> {
  readonly _tag = "Mapping"

  constructor(
    /**
     * The command-line option which specified the property flag.
     */
    readonly argumentName: string,
    /**
     * The command-line option which specifies the key-value pairs.
     */
    readonly argumentOption: Single<string>
  ) {
    super()
  }
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

function createMapEntry(args: string): Tuple<[string, string]> {
  const arr = A.takeLeft_(args.split("="), 2)
  return Tp.tuple(arr[0], arr[1])
}

function createMapEntries(args: Array<string>): Array<Tuple<[string, string]>> {
  return pipe(args, A.filter(not(String.startsWith("-"))), A.map(createMapEntry))
}

function processArguments(
  self: Mapping,
  args: Array<string>,
  first: string,
  config: CliConfig
): Tuple<[Array<string>, Map.Map<string, string>]> {
  return pipe(
    args,
    A.spanLeft((name) => !name.startsWith("-") || supports(self, name, config)),
    ({ init, rest }) =>
      Tp.tuple(rest, Map.make(A.snoc_(createMapEntries(init), createMapEntry(first))))
  )
}

export function validate_(
  self: Mapping,
  args: Array<string>,
  cont: (
    a: Options<any>,
    args: Array<string>,
    config: CliConfig
  ) => T.IO<ValidationError, Tuple<[Array<string>, any]>>,
  config: CliConfig = Config.defaultConfig
): T.IO<ValidationError, Tuple<[Array<string>, Map.Map<string, string>]>> {
  return pipe(
    cont(self.argumentOption, args, config),
    T.map(({ tuple: [args, first] }) => processArguments(self, args, first, config))
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
  return (
    self: Mapping
  ): T.IO<ValidationError, Tuple<[Array<string>, Map.Map<string, string>]>> =>
    validate_(self, args, cont, config)
}

// -----------------------------------------------------------------------------
// Modification
// -----------------------------------------------------------------------------

export function modifySingle_(
  self: Mapping,
  modifier: SingleModifier
): Options<Map.Map<string, string>> {
  return new Mapping(self.argumentName, modifier(self.argumentOption))
}

/**
 * @ets_data_first modifySingle_
 */
export function modifySingle(modifier: SingleModifier) {
  return (self: Mapping): Options<Map.Map<string, string>> =>
    modifySingle_(self, modifier)
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function makeFullName(s: string): string {
  return s.length === 1 ? `-${s}` : `--${s}`
}

function fullName(self: Mapping): string {
  return makeFullName(self.argumentName)
}

function argumentNames(self: Mapping): Array<string> {
  return pipe(self.argumentOption.aliases, A.map(makeFullName), A.cons(fullName(self)))
}

const equalsIgnoreCase: Equal.Equal<string> = Equal.contramap((s: string) =>
  s.toLowerCase()
)(Equal.string)

function supports(self: Mapping, name: string, conf: CliConfig): boolean {
  const names = argumentNames(self)
  return conf.caseSensitive
    ? A.elem_(Equal.string)(names, name)
    : A.elem_(equalsIgnoreCase)(names, name)
}
