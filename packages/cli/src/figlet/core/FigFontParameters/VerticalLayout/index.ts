// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as E from "@effect-ts/core/Either"
import type { Equal } from "@effect-ts/core/Equal"
import * as Eq from "@effect-ts/core/Equal"
import * as O from "@effect-ts/core/Option"
import * as Structural from "@effect-ts/core/Structural"

import type { FigletResult } from "../../../error/FigletException"
import type { FigHeader } from "../../FigHeader"
import * as FullLayout from "../../FigHeaderParameters/FullLayout"
import type { VerticalSmushingRule } from "../VerticalSmushingRule"
import * as VSR from "../VerticalSmushingRule"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type VerticalLayout =
  | FullHeight
  | VerticalFitting
  | UniversalSmushing
  | ControlledSmushing

export class FullHeight extends Tagged("FullWidth")<{}> {}

export class VerticalFitting extends Tagged("HorizontalFitting")<{}> {}

export class UniversalSmushing extends Tagged("UniversalSmushing")<{}> {}

export class ControlledSmushing extends Tagged("ControlledSmushing")<{
  readonly rules: Chunk<VerticalSmushingRule>
}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Interprets the header settings and returns the selected `VerticalLayout`.
 *
 * @param header The `FigHeader` where the vertical layout is defined.
 * @returns A `FigletResult` containing the new `VerticalLayout`, or
 * a list of `FigletException`s that occurred during parsing.
 */
export function fromHeader(header: FigHeader): FigletResult<VerticalLayout> {
  return O.getOrElse_(
    O.map_(header.fullLayout, (settings) => {
      if (
        !hasLayout(settings, new FullLayout.VerticalFitting()) &&
        !hasLayout(settings, new FullLayout.VerticalSmushing())
      ) {
        return E.right(new FullHeight())
      }

      if (
        hasLayout(settings, new FullLayout.VerticalFitting()) &&
        !hasLayout(settings, new FullLayout.VerticalSmushing())
      ) {
        return E.right(new VerticalFitting())
      }

      const selectedSmushingRules = A.intersection_(FullLayout.equalFullLayout)(
        C.toArray(settings),
        C.toArray(FullLayout.verticalSmushingRules)
      )

      if (
        hasLayout(settings, new FullLayout.VerticalSmushing()) &&
        !A.isEmpty(selectedSmushingRules)
      ) {
        return E.map_(
          VSR.fromHeader(header),
          (rules) => new ControlledSmushing({ rules })
        )
      }

      return E.right(new UniversalSmushing())
    }),
    () => E.right(new FullHeight())
  )
}

// -----------------------------------------------------------------------------
// Instances
// -----------------------------------------------------------------------------

export const equalVerticalLayout: Equal<VerticalLayout> = Eq.makeEqual((x, y) =>
  x[Structural.equalsSym](y)
)

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function hasLayout(
  settings: Chunk<FullLayout.FullLayout>,
  layout: FullLayout.FullLayout
) {
  return C.elem_(settings, FullLayout.equalFullLayout, layout)
}
