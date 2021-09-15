// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

import type { CliConfig } from "../../CliConfig"
import * as Config from "../../CliConfig"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import type { PrimType } from "../../PrimType"
import type { UsageSynopsis } from "../../UsageSynopsis"
import * as Synopsis from "../../UsageSynopsis"
import type { Args } from "../definition"

/**
 * Represents a single command-line argument.
 */
export class Single<A> implements Args<A> {
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
  ) {}

  get minSize(): number {
    return 1
  }

  get maxSize(): number {
    return 1
  }

  get helpDoc(): HelpDoc {
    return Help.descriptionList(
      A.single(
        Tp.tuple(
          Help.text(this.name),
          Help.orElse_(this.description, () => Help.p(this.primType.helpDoc))
        )
      )
    )
  }

  get synopsis(): UsageSynopsis {
    return Synopsis.named(this.name, this.primType.choices)
  }

  addDescription(text: string): Args<A> {
    return new Single(
      this.pseudoName,
      this.primType,
      Help.concat_(this.description, Help.p(text))
    )
  }

  validate(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<HelpDoc, Tuple<[Array<string>, A]>> {
    return A.foldLeft_(
      args,
      () =>
        T.fail(
          Help.p(
            `Missing argument ${this.name} with values ${O.getOrElse_(
              this.primType.choices,
              () => ""
            )}`
          )
        ),
      (head, tail) =>
        T.bimap_(this.primType.validate(O.some(head), config), Help.p, (a) =>
          Tp.tuple(tail, a)
        )
    )
  }

  private get name(): string {
    return `<${O.getOrElse_(this.pseudoName, () => this.primType.typeName)}>`
  }
}
