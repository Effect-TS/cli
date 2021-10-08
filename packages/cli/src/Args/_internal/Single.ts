// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { PrimType } from "../../PrimType"
import * as Primitive from "../../PrimType"
import type { UsageSynopsis } from "../../UsageSynopsis"
import * as Synopsis from "../../UsageSynopsis"
import type { Args } from "./Base"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

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
    return `<${O.getOrElse_(this.pseudoName, () => Primitive.typeName(this.primType))}>`
  }
}

// -----------------------------------------------------------------------------
// Minimum Size
// -----------------------------------------------------------------------------

export const singleMinSize = 1

// -----------------------------------------------------------------------------
// Maximum Size
// -----------------------------------------------------------------------------

export const singleMaxSize = 1

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export function getSingleHelpDoc<A>(self: Single<A>): HelpDoc {
  return Help.descriptionList(
    A.single(
      Tp.tuple(
        Help.text(self.name),
        Help.orElse_(self.description, () => Help.p(Primitive.helpDoc(self.primType)))
      )
    )
  )
}

// -----------------------------------------------------------------------------
// UsageSynopsis
// -----------------------------------------------------------------------------

export function getSingleUsageSynopsis<A>(self: Single<A>): UsageSynopsis {
  return Synopsis.named(self.name, Primitive.choices(self.primType))
}

// -----------------------------------------------------------------------------
// Description
// -----------------------------------------------------------------------------

export function addSingleDescription_<A>(self: Single<A>, text: string): Args<A> {
  return new Single(
    self.pseudoName,
    self.primType,
    Help.concat_(self.description, Help.p(text))
  )
}

/**
 * @ets_data_first addSingleDescription_
 */
export function addSingleDescription(text: string) {
  return <A>(self: Single<A>): Args<A> => addSingleDescription_(self, text)
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validateSingle_<A>(
  self: Single<A>,
  args: Array<string>,
  config: CliConfig = Config.defaultConfig
): T.IO<HelpDoc, Tuple<[Array<string>, A]>> {
  return A.foldLeft_(
    args,
    () =>
      T.fail(
        Help.p(
          `Missing argument ${self.name} with values ` +
            `${O.getOrElse_(Primitive.choices(self.primType), () => "")}`
        )
      ),
    (head, tail) =>
      T.bimap_(Primitive.validate_(self.primType, O.some(head), config), Help.p, (a) =>
        Tp.tuple(tail, a)
      )
  )
}

/**
 * @ets_data_first validateSingle_
 */
export function validateSingle(
  args: Array<string>,
  config: CliConfig = Config.defaultConfig
) {
  return <A>(self: Single<A>): T.IO<HelpDoc, Tuple<[Array<string>, A]>> =>
    validateSingle_(self, args, config)
}
