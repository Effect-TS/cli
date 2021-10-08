// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as E from "@effect-ts/core/Either"
import * as O from "@effect-ts/core/Option"
import { matchTag } from "@effect-ts/core/Utils"

import type { FigletResult } from "../../../error/FigletException"
import { FigFontError } from "../../../error/FigletException"
import type { FigHeader } from "../../FigHeader"
import * as FullLayout from "../../FigHeaderParameters/FullLayout"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents rules for performing horizontal smushing for a Figlet font.
 *
 * See http://www.jave.de/figlet/figfont.html#smushingrules for more detail.
 */
export type HorizontalSmushingRule =
  | EqualCharacter
  | Underscore
  | Hierarchy
  | OppositePair
  | BigX
  | Hardblank

/**
 * Represents application of "equal" character horizontal smushing.
 *
 * **Horizontal Smushing Rule 1** (Code Value 1)
 *
 * Two sub-characters are smushed into a single sub-character if they are the
 * same. This rule does not smush hardblanks.
 */
export class EqualCharacter extends Tagged("EqualCharacter")<{}> {}

/**
 * Represents application of "underscore" character horizontal smushing.
 *
 * **Horizontal Smushing Rule 2** (Code Value 2)
 *
 * An underscore ("_") will be replaced by any of: "|", "/", "\", "[", "]",
 * "{", "}", "(", ")", "<" or ">".
 */
export class Underscore extends Tagged("Underscore")<{}> {}

/**
 * Represents application of "hierarchy" character horizontal smushing.
 *
 * **Horizontal Smushing Rule 3** (Code Value 4)
 *
 * A hierarchy of six classes is used: "|", "/\", "[]", "{}", "()", and "<>".
 * When two smushing sub-characters are from different classes, the one from
 * the latter class will be used.
 */
export class Hierarchy extends Tagged("Hierarchy")<{}> {}

/**
 * Represents application of "opposite pair" character horizontal smushing.
 *
 * **Horizontal Smushing Rule 4** (Code Value 8)
 *
 * Smushes opposing brackets ("[]" or "]["), braces ("{}" or "}{") and
 * parentheses ("()" or ")(") together, replacing any such pair with a vertical
 * bar ("|").
 */
export class OppositePair extends Tagged("OppositePair")<{}> {}

/**
 * Represents application of "big X" character horizontal smushing.
 *
 * **Horizontal Smushing Rule 5** (Code Value 16)
 *
 * Smushes "/\" into "|", "\/" into "Y", and "><" into "X". Note that "<>" is
 * not smushed in any way by this rule. The name "BIG X" is historical;
 * originally all three pairs were smushed into "X".
 */
export class BigX extends Tagged("BigX")<{}> {}

/**
 * Represents application of "equal" character horizontal smushing.
 *
 * **Horizontal Smushing Rule 6** (Code Value 32)
 *
 * Smushes two hardblanks together, replacing them with a single hardblank.
 */
export class Hardblank extends Tagged("Hardblank")<{}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Interprets the `fullLayout` header settings and returns the selected
 * `HorizontalSmushingRule`s.
 *
 * @param header The `FigHeader` where the `FullLayout` is defined.
 * @returns A `FigletResult` containing a list of `HorizontalSmushingRule`s, or
 * a list of `FigletException`s accumulated during parsing.
 */
export function fromFullLayout(
  header: FigHeader
): FigletResult<Chunk<HorizontalSmushingRule>> {
  return E.right(
    O.getOrElse_(
      O.map_(header.fullLayout, (settings) =>
        C.from(
          A.filterMap_(
            A.intersection_(FullLayout.equalFullLayout)(
              C.toArray(settings),
              C.toArray(FullLayout.horizontalSmushingRules)
            ),
            matchTag(
              {
                EqualCharacterHorizontalSmushing: () => O.some(new EqualCharacter()),
                UnderscoreHorizontalSmushing: () => O.some(new Underscore()),
                HierarchyHorizontalSmushing: () => O.some(new Hierarchy()),
                OppositePairHorizontalSmushing: () => O.some(new OppositePair()),
                BigXHorizontalSmushing: () => O.some(new BigX()),
                HardblankHorizontalSmushing: () => O.some(new Hardblank())
              },
              () => O.emptyOf<HorizontalSmushingRule>()
            )
          )
        )
      ),
      () => C.empty<HorizontalSmushingRule>()
    )
  )
}

/**
 * Interprets the `oldLayout` header settings and returns the selected
 * `HorizontalSmushingRule`s.
 *
 * @param header The `FigHeader` where the `OldLayout` is defined.
 * @returns A `FigletResult` containing a list of `HorizontalSmushingRule`s, or
 * a list of `FigletException`s accumulated during parsing.
 */
export function fromOldLayout(
  header: FigHeader
): FigletResult<Chunk<HorizontalSmushingRule>> {
  const rules = C.from(
    A.filterMap_(
      C.toArray(header.oldLayout),
      matchTag(
        {
          EqualCharacterSmushing: () => O.some(new EqualCharacter()),
          UnderscoreSmushing: () => O.some(new Underscore()),
          HierarchySmushing: () => O.some(new Hierarchy()),
          OppositePairSmushing: () => O.some(new OppositePair()),
          BigXSmushing: () => O.some(new BigX()),
          HardblankSmushing: () => O.some(new Hardblank())
        },
        () => O.emptyOf<HorizontalSmushingRule>()
      )
    )
  )

  if (C.isEmpty(rules)) {
    return E.left([
      new FigFontError({
        message: `Header field "oldLayout" does not include any horizontal smushing rule`
      })
    ])
  }

  return E.right(rules)
}
