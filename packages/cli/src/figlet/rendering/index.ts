// ets_tracing: off

import * as C from "@effect-ts/core/Collections/Immutable/Chunk"

import type { RenderOptions } from "../client/RenderOptions"
import * as FigCharacter from "../core/FigCharacter"
import * as FigFont from "../core/FigFont"
import { Figure } from "../core/Figure"
import * as SubColumns from "../core/SubElements/SubColumns"
import * as SubLines from "../core/SubElements/SubLines"
import { appendLoop, appendLoopState } from "./MergeStrategy"

// -----------------------------------------------------------------------------
// Rendering Functions
// -----------------------------------------------------------------------------

/**
 * Renders text into a `Figure` for a given `FigFont` and options
 *
 *
 * Explanation of the general algorithm with final `overlap = 3`, horizontal
 * fitting layout and print direction left-to-right.
 *
 * Example merged `Figure`s (using `HorizontalFitting` as example renderer):
 *
 * ```text
 *    Figure A   Figure B        Resulting Figure
 *   /        \ /       \       /               \
 *   +-----+---+---+-----+      +-----+---+-----+
 *   |  ___|__ |   |     |      |  ___|__ |     |
 *   | |  _|__||   |__ _ |      | |  _|__||__ _ |
 *   | | |_|   |  /| _` ||  ->  | | |_|  /| _` ||
 *   | |  _||  | | |(_| ||  ->  | |  _||| |(_| ||
 *   | |_| |   |  \|__,_||      | |_| |  \|__,_||
 *   |     |   |   |     |      |     |   |     |
 *   +-----+---+---+-----+      +-----+---+-----+
 *          \     /                     |
 *       Overlap area            Merged 3 columns
 *       3 cols each
 * ```
 *
 * In this example each `Figure` is broken down in `SubColumns` with final
 * `overlap = 3`:
 *
 * ```text
 * Figure A                                          | A-overlapping |
 * +--------+           +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+
 * |  _____ |           | |   | |   |_|   |_|   |_|   |_|   |_|   | |
 * | |  ___||           | |   |||   | |   | |   |_|   |_|   |_|   |||
 * | | |_   |       ->  | | + ||| + | | + ||| + |_| + | | + | | + | |
 * | |  _|  |       ->  | | + ||| + | | + | | + |_| + ||| + | | + | |
 * | |_|    |           | |   |||   |_|   |||   | |   | |   | |   | |
 * |        |           | |   | |   | |   | |   | |  /| |   | |   | |
 * +--------+           +-+   +-+   +-+   +-+   +-+ / +-+   +-+   +-+
 *                                                 / |               |
 *                                 A active column   |               |-- Final overlap = 3 columns
 * Resulting Figure                                  |               |
 * +-------------+      +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+
 * |  _____      |      | |   | |   |_|   |_|   |_|   |_|   |_|   | |   | |   | |   | |   | |   | |
 * | |  ___|__ _ |      | |   |||   | |   | |   |_|   |_|   |_|   |||   |_|   |_|   | |   |_|   | |
 * | | |_  / _` ||  ->  | | + ||| + | | + ||| + |_| + | | + | | + |/| + | | + |_| + |`| + | | + |||
 * | |  _|| (_| ||  ->  | | + ||| + | | + | | + |_| + ||| + ||| + | | + |(| + |_| + ||| + | | + |||
 * | |_|   \__,_||      | |   |||   |_|   |||   | |   | |   | |   |\|   |_|   |_|   |,|   |_|   |||
 * |             |      | |   | |   | |   | |   | |   | |   | |   | |   | |   | |   | |   | |   | |
 * +-------------+      +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+
 *                                                   |              |
 *                                 B active column   |              |
 * Figure B                                        \ |              |
 * +--------+                                       \ +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+
 * |        |                                        \| |   | |   | |   | |   | |   | |   | |   | |
 * |   __ _ |                                         | |   | |   | |   |_|   |_|   | |   |_|   | |
 * |  / _` ||      ->                                 | | + | | + |/| + | | + |_| + |`| + | | + |||
 * | | (_| ||      ->                                 | | + ||| + | | + |(| + |_| + ||| + | | + |||
 * |  \__,_||                                         | |   | |   |\|   |_|   |_|   |,|   |_|   |||
 * |        |                                         | |   | |   | |   | |   | |   | |   | |   | |
 * +--------+                                         +-+   +-+   +-+   +-+   +-+   +-+   +-+   +-+
 *                                                   | B-overlapping |
 * ```
 *
 * Merge of a single overlapping column with the custom merge function `f`:
 *
 * ```text
 * +-+     +-+                                                 +-+
 * |_|  +  | |  ->  f('_', ' ') = Continue('_')                |_|
 * |_|  +  | |  ->  f('_', ' ') = Continue('_')                |_|
 * | |  +  | |  ->  f(' ', ' ') = Continue(' ')  ->  Continue( | | )
 * | |  +  |||  ->  f(' ', '|') = Continue('|')                |||
 * | |  +  | |  ->  f(' ', ' ') = Continue(' ')                | |
 * | |  +  | |  ->  f(' ', ' ') = Continue('_')                |_|
 * +-+     +-+                                                 +-+
 * ```
 *
 * NOTES:
 * - Each recursive iteration works with a certain amount of overlapping columns.
 *   The entire overlapping area is merged but it's only the "active columns"
 *   that decide the outcome of the iteration as the subsequent ones will merge
 *   for sure. Once the overlapping area has been process it decides between
 *   3 options:
 *   - the overlap of the current iteration results in a valid merge, the
 *     overlap can be increased further and thus runs a new iteration with
 *     `overlap + 1`
 *   - the overlap of the current iteration results in a valid merge but the
 *     overlap cannot be increased and returns the result of the current
 *     iteration as the final result
 *   - the overlap of the current iteration does not results in a valid merge
 *     and the result of the previous iteration is used as the final result
 * - At `overlap = n` the `n - 1` overlap values have already passed through the
 *   merge algorithm and their result is assumed to be a valid merge
 * - The "A active column" and the "B active column" (see figures above) are the
 *   columns that decide the result of the iteration
 * - Each pair of corresponding characters of the active columns are passed to a
 *   custom merge function
 * - The custom merge function returns the character resulting from merge of the
 *   two corresponding character together with the decision of how to proceed
 *   with the algorithm
 * - The result value of the custom merge function is an Applicative Functor
 *
 * @param text The string to render as a `Figure`.
 * @param options The `RenderOptions` used to render the text.
 * @return A `Figure` containing the rendered text following the rendering
 * options.
 */
export function render(text: string, options: RenderOptions): Figure {
  const figures = C.map_(
    C.from(text.split("")),
    (char) => FigCharacter.columns(FigFont.char_(options.font, char)).value
  )
  const zero = C.single(SubLines.toSubcolumns(FigFont.zero(options.font).lines).value)
  const result = C.map_(
    appendLoop(options, figures, zero, appendLoopState()),
    SubColumns.fromValue
  )
  return new Figure({ font: options.font, value: text, columns: result })
}
