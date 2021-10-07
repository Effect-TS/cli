import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import * as Equal from "@effect-ts/core/Equal"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import type { Tuple } from "@effect-ts/system/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/system/Collections/Immutable/Tuple"

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
import type { Options } from "../definition"

/**
 * A modifier function which can be applied to `Single` command-line options.
 */
export interface SingleModifier {
  <A>(single: Single<A>): Single<A>
}

/**
 * Represents a single command-line option.
 */
export class Single<A> implements Options<A> {
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
  ) {}

  get uid(): Option<string> {
    return O.some(this.fullName)
  }

  get fullName(): string {
    return this.makeFullName(this.name)
  }

  get helpDoc(): HelpDoc {
    const allNames = A.cons_(
      A.map_(this.aliases, (alias) => `--${alias}`),
      `--${this.name}`
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
          Help.sequence_(Help.p(Primitive.helpDoc(this.primType)), this.description)
        )
      )
    )
  }

  get synopsis(): UsageSynopsis {
    return Synopsis.named(this.fullName, Primitive.choices(this.primType))
  }

  validate(
    args: Array<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<ValidationError, Tuple<[Array<string>, A]>> {
    const names = A.cons_(A.map_(this.aliases, this.makeFullName), this.fullName)
    return A.foldLeft_(
      args,
      () =>
        T.fail(
          Validation.missingValueError(
            Help.p(Help.error(`Expected to find '${this.fullName}' option.`))
          )
        ),
      (head, tail) => {
        if (this.supports(head, names, config)) {
          const PrimitiveInstruction = Primitive.instruction(this.primType)
          if (PrimitiveInstruction._tag === "Bool")
            return T.bimap_(
              Primitive.validate_(this.primType as PrimType<A>, O.none, config),
              (e) => Validation.invalidValueError(Help.p(e)),
              (a) => Tp.tuple(tail, a)
            )
          return T.bimap_(
            A.foldLeft_(
              tail,
              () => Primitive.validate_(this.primType, O.none, config),
              (head) => Primitive.validate_(this.primType, O.some(head), config)
            ),
            (e) => Validation.invalidValueError(Help.p(e)),
            (a) => Tp.tuple(A.dropLeft_(tail, 1), a)
          )
        }
        if (
          this.name.length > config.autoCorrectLimit + 1 &&
          AutoCorrect.levensteinDistance(head, this.fullName, config) <=
            config.autoCorrectLimit
        ) {
          return T.fail(
            Validation.missingValueError(
              Help.p(
                Help.error(
                  `The flag '${head}' is not recognized. Did you mean '${this.fullName}'?`
                )
              )
            )
          )
        }
        return T.map_(this.validate(tail, config), Tp.update(0, A.cons(head)))
      }
    )
  }

  modifySingle(modifier: SingleModifier): Options<A> {
    return modifier(this)
  }

  private makeFullName(name: string): string {
    return name.length === 1 ? `-${name}` : `--${name}`
  }

  private supports(s: string, names: Array<string>, config: CliConfig): boolean {
    return config.caseSensitive
      ? A.elem_(Equal.string)(names, s)
      : A.elem_(equalsIgnoreCase)(names, s)
  }
}

const equalsIgnoreCase: Equal.Equal<string> = Equal.contramap((s: string) =>
  s.toLowerCase()
)(Equal.string)
