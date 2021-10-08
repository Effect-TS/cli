// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import * as Equal from "@effect-ts/core/Equal"
import * as O from "@effect-ts/core/Option"

import * as AutoCorrect from "../../AutoCorrect"
import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { PrimType } from "../../PrimType"
import * as Primitive from "../../PrimType"
import type { UsageSynopsis } from "../../UsageSynopsis"
import * as Synopsis from "../../UsageSynopsis"
import type { ValidationError } from "../../Validation"
import * as Validation from "../../Validation"
import type { Options } from "./Base"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a single command-line option.
 */
export class Single<A> extends Base<A> {
  readonly _tag = "Single"

  constructor(
    /**
     * The name of the command-line option.
     */
    readonly name: string,
    /**
     * Aliases for the command-line option.
     */
    readonly aliases: Array<string>,
    /**
     * The backing primitive type of the command-line option.
     */
    readonly primType: PrimType<A>,
    /**
     * The description of the command-line option.
     */
    readonly description: HelpDoc = Help.empty
  ) {
    super()
  }
}

/**
 * A modifier function which can be applied to `Single` command-line options.
 */
export interface SingleModifier {
  <A>(single: Single<A>): Single<A>
}

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export function getSingleHelpDoc<A>(self: Single<A>): HelpDoc {
  const allNames = A.cons_(
    A.map_(self.aliases, (alias) => `--${alias}`),
    `--${self.name}`
  )

  const names = Help.spans(
    A.mapWithIndex_(allNames, (index, span) =>
      index !== allNames.length - 1
        ? Help.concat_(Help.text(span), Help.text(", "))
        : Help.text(span)
    )
  )

  return Help.descriptionList(
    A.single(
      Tp.tuple(
        names,
        Help.sequence_(Help.p(Primitive.helpDoc(self.primType)), self.description)
      )
    )
  )
}

// -----------------------------------------------------------------------------
// UsageSynopsis
// -----------------------------------------------------------------------------

export function getSingleUsageSynopsis<A>(self: Single<A>): UsageSynopsis {
  return Synopsis.named(getSingleFullName(self), Primitive.choices(self.primType))
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validateSingle_<A>(
  self: Single<A>,
  args: Array<string>,
  config: CliConfig = Config.defaultConfig
): T.IO<ValidationError, Tuple<[Array<string>, A]>> {
  const fullName = getSingleFullName(self)
  const names = A.cons_(A.map_(self.aliases, makeFullName), fullName)
  return A.foldLeft_(
    args,
    () =>
      T.fail(
        Validation.missingValueError(
          Help.p(Help.error(`Expected to find '${fullName}' option.`))
        )
      ),
    (head, tail) => {
      if (supports(head, names, config)) {
        const PrimitiveInstruction = Primitive.instruction(self.primType)
        if (PrimitiveInstruction._tag === "Bool")
          return T.bimap_(
            Primitive.validate_(self.primType as PrimType<A>, O.none, config),
            (e) => Validation.invalidValueError(Help.p(e)),
            (a) => Tp.tuple(tail, a)
          )
        return T.bimap_(
          A.foldLeft_(
            tail,
            () => Primitive.validate_(self.primType, O.none, config),
            (head) => Primitive.validate_(self.primType, O.some(head), config)
          ),
          (e) => Validation.invalidValueError(Help.p(e)),
          (a) => Tp.tuple(A.dropLeft_(tail, 1), a)
        )
      }
      if (
        self.name.length > config.autoCorrectLimit + 1 &&
        AutoCorrect.levensteinDistance(head, fullName, config) <=
          config.autoCorrectLimit
      ) {
        return T.fail(
          Validation.missingValueError(
            Help.p(
              Help.error(
                `The flag '${head}' is not recognized. Did you mean '${fullName}'?`
              )
            )
          )
        )
      }
      return T.map_(validateSingle_(self, tail, config), Tp.update(0, A.cons(head)))
    }
  )
}

/**
 * @ets_data_first validateSingle_
 */
export function validateSingle(
  args: Array<string>,
  config: CliConfig = Config.defaultConfig
) {
  return <A>(self: Single<A>): T.IO<ValidationError, Tuple<[Array<string>, A]>> =>
    validateSingle_(self, args, config)
}

// -----------------------------------------------------------------------------
// Modification
// -----------------------------------------------------------------------------

export function modifySingle_<A>(
  self: Single<A>,
  modifier: SingleModifier
): Options<A> {
  return modifier(self)
}

/**
 * @ets_data_first modifySingle_
 */
export function modifySingle(modifier: SingleModifier) {
  return <A>(self: Single<A>): Options<A> => modifySingle_(self, modifier)
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function makeFullName(name: string): string {
  return name.length === 1 ? `-${name}` : `--${name}`
}

/**
 * Return the full name for a `Single` option.
 */
export function getSingleFullName<A>(self: Single<A>): string {
  return makeFullName(self.name)
}

const equalsIgnoreCase: Equal.Equal<string> = Equal.contramap((s: string) =>
  s.toLowerCase()
)(Equal.string)

function supports(s: string, names: Array<string>, config: CliConfig): boolean {
  return config.caseSensitive
    ? A.elem_(Equal.string)(names, s)
    : A.elem_(equalsIgnoreCase)(names, s)
}
