// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents an option to choose the justification of the font text.
 */
export type Justification = Center | FlushLeft | FlushRight | FontDefault

/**
 * Renders the font output centered horizontally.
 */
export class Center extends Tagged("Center")<{}> {}

/**
 * Renders the font output flush to the left.
 */
export class FlushLeft extends Tagged("FlushLeft")<{}> {}

/**
 * Renders the font output flush to the right.
 */
export class FlushRight extends Tagged("FlushRight")<{}> {}

/**
 * Uses the default value specified in the `FigFont` to render the font.
 */
export class FontDefault extends Tagged("FontDefault")<{}> {}
