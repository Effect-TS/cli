// ets_tracing: off

import type { Equal } from "@effect-ts/core/Equal"
import * as Eq from "@effect-ts/core/Equal"
import * as Structural from "@effect-ts/core/Structural"

import type { FigFont } from "./definition"

// -----------------------------------------------------------------------------
// Equals
// -----------------------------------------------------------------------------

export const equalFigFont: Equal<FigFont> = Eq.makeEqual((x, y) =>
  x[Structural.equalsSym](y)
)
