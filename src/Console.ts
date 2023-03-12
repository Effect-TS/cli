/**
 * @since 1.0.0
 */
import * as internal from "@effect/cli/internal_effect_untraced/console"
import type * as Context from "@effect/data/Context"
import type { Effect } from "@effect/io/Effect"
import type { Layer } from "@effect/io/Layer"

// TODO: move this to a better place

/**
 * @since 1.0.0
 * @category models
 */
export interface Console {
  printLine(text: string): Effect<never, never, void>
}

/**
 * @since 1.0.0
 * @category context
 */
export const Tag: Context.Tag<Console> = internal.Tag

/**
 * @since 1.0.0
 * @category context
 */
export const layer: Layer<never, never, Console> = internal.layer
