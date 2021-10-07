// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as E from "@effect-ts/core/Either"
import * as O from "@effect-ts/core/Option"
import { matchTag } from "@effect-ts/core/Utils"

import type { FigletResult } from "../../../error/FigletException"
import type { FigHeader } from "../../FigHeader"
import * as FullLayout from "../../FigHeaderParameters/FullLayout"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents rules for performing vertical smushing for a Figlet font.
 *
 * See http://www.jave.de/figlet/figfont.html#smushingrules for more detail.
 */
export type VerticalSmushingRule =
  | EqualCharacter
  | Underscore
  | Hierarchy
  | HorizontalLine
  | VerticalLineSupersmushing

/**
 * Represents application of "equal" character vertical smushing.
 *
 * **Vertical Smushing Rule 1** (Code Value 256)
 *
 * Two sub-characters are smushed into a single sub-character if they are the
 * same. This rule does not smush hardblanks.
 */
export class EqualCharacter extends Tagged("EqualCharacter")<{}> {}

/**
 * Represents application of "underscore" character vertical smushing.
 *
 * **Vertical Smushing Rule 2** (Code Value 512)
 *
 * An underscore ("_") will be replaced by any of: "|", "/", "\", "[", "]",
 * "{", "}", "(", ")", "<" or ">".
 */
export class Underscore extends Tagged("Underscore")<{}> {}

/**
 * Represents application of "hierarchy" character vertical smushing.
 *
 * **Vertical Smushing Rule 3** (Code Value 1024)
 *
 * A hierarchy of six classes is used: "|", "/\", "[]", "{}", "()", and "<>".
 * When two smushing sub-characters are from different classes, the one from
 * the latter class will be used
 */
export class Hierarchy extends Tagged("Hierarchy")<{}> {}

/**
 * Represents application of "horizontal line" character vertical smushing.
 *
 * **Vertical Smushing Rule 4** (Code Value 2048)
 *
 * Smushes stacked pairs of "-" and "_", replacing them with a single "="
 * sub-character. It does not matter which is found above the other. Note that
 * vertical smushing rule 1 will smush IDENTICAL pairs of horizontal lines,
 * while this rule smushes horizontal lines consisting of DIFFERENT
 * sub-characters.
 */
export class HorizontalLine extends Tagged("HorizontalLine")<{}> {}

/**
 * Represents application of "vertical line" character vertical smushing.
 *
 * **Vertical Smushing Rule 5** (Code Value 4096)
 *
 * This one rule is different from all others, in that it "supersmushes"
 * vertical lines consisting of several vertical bars ("|"). This creates the
 * illusion that FIGcharacters have slid vertically against each other.
 * Supersmushing continues until any sub-characters other than "|" would have
 * to be smushed. Supersmushing can produce impressive results, but it is
 * seldom possible, since other sub-characters would usually have to be
 * considered for smushing as soon as any such stacked vertical lines are
 * encountered.
 */
export class VerticalLineSupersmushing extends Tagged(
  "VerticalLineSupersmushing"
)<{}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Interprets the header settings and returns the selected `VerticalSmushingRule`s.
 *
 * @param header The `FigHeader` where the vertical layout is defined.
 * @returns A `FigletResult` containing a list of `VerticalSmushingRule`s, or
 * a list of `FigletException`s accumulated during parsing.
 */
export function fromHeader(
  header: FigHeader
): FigletResult<Chunk<VerticalSmushingRule>> {
  return E.right(
    O.getOrElse_(
      O.map_(header.fullLayout, (settings) =>
        C.from(
          A.filterMap_(
            A.intersection_(FullLayout.equalFullLayout)(
              C.toArray(settings),
              C.toArray(FullLayout.verticalSmushingRules)
            ),
            matchTag(
              {
                EqualCharacterVerticalSmushing: () => O.some(new EqualCharacter()),
                UnderscoreVerticalSmushing: () => O.some(new Underscore()),
                HierarchyVerticalSmushing: () => O.some(new Hierarchy()),
                HorizontalLineVerticalSmushing: () => O.some(new HorizontalLine()),
                VerticalLineSupersmushing: () => O.some(new VerticalLineSupersmushing())
              },
              () => O.emptyOf<VerticalSmushingRule>()
            )
          )
        )
      ),
      () => C.empty<VerticalSmushingRule>()
    )
  )
}
