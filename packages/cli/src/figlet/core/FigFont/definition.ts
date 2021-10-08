// ets_tracing: off

import { Case } from "@effect-ts/core/Case"
import type { Map } from "@effect-ts/core/Collections/Immutable/Map"

import type { FigCharacter } from "../FigCharacter"
import type { FigFontSettings } from "../FigFontSettings"
import type { FigHeader } from "../FigHeader"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export class FigFont extends Case<{
  /**
   * A code that uniquely identifies the `FigFont` and the `FigCharacter`s.
   */
  readonly id: string
  /**
   * The name of the `FigFont`.
   */
  readonly name: string
  /**
   * The file containing the definition of the `FigFont`.
   */
  readonly file: string
  /**
   * The `FigHeader` containing the raw definitions and settings of the `FigFont`.
   */
  readonly header: FigHeader
  /**
   * A description of the font.
   */
  readonly comment: string
  /**
   * The settings of the `FigFont` inferred from the header.
   */
  readonly settings: FigFontSettings
  /**
   * The map of the `FigCharacter`s composing this `FigFont`.
   */
  readonly characters: Map<string, FigCharacter>
}> {}
