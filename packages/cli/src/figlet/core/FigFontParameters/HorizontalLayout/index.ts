// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as E from "@effect-ts/core/Either"
import type { Equal } from "@effect-ts/core/Equal"
import * as Eq from "@effect-ts/core/Equal"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import * as Structural from "@effect-ts/core/Structural"

import type { FigletResult } from "../../../error/FigletException"
import { FigFontError } from "../../../error/FigletException"
import type { FigHeader } from "../../FigHeader"
import * as FullLayout from "../../FigHeaderParameters/FullLayout"
import * as OldLayout from "../../FigHeaderParameters/OldLayout"
import type { HorizontalSmushingRule } from "../HorizontalSmushingRule"
import * as HSR from "../HorizontalSmushingRule"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type HorizontalLayout =
  | FullWidth
  | HorizontalFitting
  | UniversalSmushing
  | ControlledSmushing

export class FullWidth extends Tagged("FullWidth")<{}> {}

export class HorizontalFitting extends Tagged("HorizontalFitting")<{}> {}

export class UniversalSmushing extends Tagged("UniversalSmushing")<{}> {}

export class ControlledSmushing extends Tagged("ControlledSmushing")<{
  readonly rules: Chunk<HorizontalSmushingRule>
}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Interprets the header settings and returns the selected `HorizontalLayout`.
 * Contrary to the Figlet font standard, if the header defines "fullLayout"
 * and then defines "oldLayout", "oldLayout" is effectively ignored.
 *
 * @param header The `FigHeader` where the `HorizontalLayout` is defined.
 * @returns A `FigletResult` containing the `HorizontalLayout`, or a list of
 * `FigletException`s accumulated during parsing.
 */
export function fromHeader(header: FigHeader): FigletResult<HorizontalLayout> {
  return E.map_(
    E.tuple(fromOldLayout(header), fromFullLayout(header)),
    ([oldHorizontal, fullHorizontal]) =>
      O.getOrElse_(fullHorizontal, () => oldHorizontal)
  )
}

/**
 * Interprets the `fullLayout` header settings and returns the selected
 * `HorizontalLayout`.
 *
 * @param header The `FigHeader` where the `HorizontalLayout` is defined.
 * @returns A `FigletResult` containing the `HorizontalLayout`, or a list of
 * `FigletException`s accumulated during parsing.
 */
export function fromFullLayout(
  header: FigHeader
): FigletResult<Option<HorizontalLayout>> {
  return O.fold_(
    header.fullLayout,
    () => E.right(O.emptyOf<HorizontalLayout>()),
    (settings) => {
      if (
        !hasFullLayout(settings, new FullLayout.HorizontalFitting()) &&
        !hasFullLayout(settings, new FullLayout.HorizontalSmushing())
      ) {
        return E.right(O.some(new FullWidth()))
      }

      if (
        hasFullLayout(settings, new FullLayout.HorizontalFitting()) &&
        !hasFullLayout(settings, new FullLayout.HorizontalSmushing())
      ) {
        return E.right(O.some(new HorizontalFitting()))
      }

      const selectedSmushingRules = A.intersection_(FullLayout.equalFullLayout)(
        C.toArray(settings),
        C.toArray(FullLayout.horizontalSmushingRules)
      )

      if (
        hasFullLayout(settings, new FullLayout.HorizontalSmushing()) &&
        !A.isEmpty(selectedSmushingRules)
      ) {
        return E.map_(HSR.fromFullLayout(header), (rules) =>
          O.some(new ControlledSmushing({ rules }))
        )
      }

      return E.right(O.some(new UniversalSmushing()))
    }
  )
}

/**
 * Interprets the `oldLayout` header settings and returns the selected
 * `HorizontalLayout`.
 *
 * @param header The `FigHeader` where the `HorizontalLayout` is defined.
 * @returns A `FigletResult` containing the `HorizontalLayout`, or a list of
 * `FigletException`s accumulated during parsing.
 */
export function fromOldLayout(header: FigHeader): FigletResult<HorizontalLayout> {
  const settings = C.toArray(header.oldLayout)
  const eqLayoutArray = A.getEqual(OldLayout.equalOldLayout)

  if (eqLayoutArray.equals(settings, A.single(new OldLayout.FullWidth()))) {
    return E.right(new FullWidth())
  }

  if (eqLayoutArray.equals(settings, A.single(new OldLayout.HorizontalFitting()))) {
    return E.right(new HorizontalFitting())
  }

  const hasOldLayout = A.elem_(OldLayout.equalOldLayout)

  if (
    !hasOldLayout(settings, new OldLayout.FullWidth()) &&
    !hasOldLayout(settings, new OldLayout.HorizontalFitting())
  ) {
    return E.map_(
      HSR.fromOldLayout(header),
      (rules) => new ControlledSmushing({ rules })
    )
  }

  return E.left([
    new FigFontError({
      message:
        "Could not convert layout settings found in header to a " +
        `HorizontalLayout, received "${settings.map(({ value }) => value).join(", ")}"`
    })
  ])
}

// -----------------------------------------------------------------------------
// Instances
// -----------------------------------------------------------------------------

export const equalHorizontalLayout: Equal<HorizontalLayout> = Eq.makeEqual((x, y) =>
  x[Structural.equalsSym](y)
)

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function hasFullLayout(
  settings: Chunk<FullLayout.FullLayout>,
  layout: FullLayout.FullLayout
) {
  return C.elem_(settings, FullLayout.equalFullLayout, layout)
}
