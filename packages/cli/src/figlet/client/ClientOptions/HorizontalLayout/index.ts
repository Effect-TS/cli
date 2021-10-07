// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"

import type { FigFont } from "../../../core/FigFont"
import * as FontHorizontalLayout from "../../../core/FigFontParameters/HorizontalLayout"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type HorizontalLayout =
  | FullWidth
  | HorizontalFitting
  | HorizontalSmushing
  | ForceHorizontalSmushing
  | FontDefault

/**
 * Represents the display of all `FigCharacter`s at their full width, which may
 * be fixed or variable, depending on the font.
 */
export class FullWidth extends Tagged("FullWidth")<{}> {}

/**
 * Represents the display of all `FigCharacter`s using a kerning strategy to
 * render the font text.
 *
 * A kerning strateg implies that as many blanks as possible are removed
 * between `FigCharacter`s, so that they touch, but the `FigCharacter`s
 * are not smushed.
 */
export class HorizontalFitting extends Tagged("HorizontalFitting")<{}> {}

/**
 * Represents the display of all `FigCharacter`s as close together as possible,
 * and overlapping sub-characters are removed.
 *
 * Exactly which sub-characters count as overlapping depends on the font's
 * layout mode, which is defined by the font's author. It will not smush a font
 * whose author specified kerning or full width as the default layout mode
 */
export class HorizontalSmushing extends Tagged("HorizontalSmushing")<{}> {}

/**
 * Represents the display of all `FigCharacter`s as close together as possible,
 * and overlapping sub-characters are removed.
 *
 * Exactly which sub-characters count as overlapping depends on the font's
 * layout mode, which is defined by the font's author. It will attempt to
 * smush the character even if the font author specified kerning or full width
 * as the default layout mode.
 */
export class ForceHorizontalSmushing extends Tagged("ForceHorizontalSmushing")<{}> {}

/**
 * Use the default value specified in the `FigFont` for the `HorizontalLayout`.
 */
export class FontDefault extends Tagged("FontDefault")<{}> {}

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

/**
 * Converts the option `HorizontalLayout` into the `FigFont` parameter
 * `HorizontalLayout`.
 */
export function toInternalLayout_(
  self: HorizontalLayout,
  font: FigFont
): FontHorizontalLayout.HorizontalLayout {
  switch (self._tag) {
    case "FullWidth":
      return new FontHorizontalLayout.FullWidth()
    case "HorizontalFitting":
      return new FontHorizontalLayout.HorizontalFitting()
    case "HorizontalSmushing":
      return font.settings.hLayout
    case "ForceHorizontalSmushing":
      return font.settings.hLayout._tag === "ControlledSmushing"
        ? font.settings.hLayout
        : new FontHorizontalLayout.UniversalSmushing()
    case "FontDefault":
      return font.settings.hLayout
  }
}

/**
 * Converts the option `HorizontalLayout` into the `FigFont` parameter
 * `HorizontalLayout`.
 *
 * @ets_data_first toInternalLayout_
 */
export function toInternalLayout(font: FigFont) {
  return (self: HorizontalLayout): FontHorizontalLayout.HorizontalLayout =>
    toInternalLayout_(self, font)
}
