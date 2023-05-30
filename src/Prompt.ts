/**
 * @since 1.0.0
 */
import * as internal from "@effect/cli/internal_effect_untraced/prompt"
import * as numberPrompt from "@effect/cli/internal_effect_untraced/prompt/number"
import * as textPrompt from "@effect/cli/internal_effect_untraced/prompt/text"
import type { PromptAction } from "@effect/cli/Prompt/Action"
import type { Terminal } from "@effect/cli/Terminal"
import type { Effect } from "@effect/io/Effect"

/**
 * @since 1.0.0
 * @category symbols
 */
export const PromptTypeId: unique symbol = internal.PromptTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type PromptTypeId = typeof PromptTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface Prompt<Output> extends Prompt.Variance<Output> {}

/**
 * @since 1.0.0
 */
export declare namespace Prompt {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface Variance<Output> {
    readonly [PromptTypeId]: {
      readonly _Output: (_: never) => Output
    }
  }

  /**
   * @since 1.0.0
   * @category models
   */
  export type Action<State, Output> = PromptAction<State, Output>

  /**
   * @since 1.0.0
   * @category models
   */
  export interface IntOptions {
    readonly message: string
    readonly min?: number
    readonly max?: number
    readonly incrementBy?: number
    readonly decrementBy?: number
    readonly validate?: (value: number) => Effect<never, string, number>
  }

  /**
   * @since 1.0.0
   * @category models
   */
  export interface FloatOptions extends IntOptions {
    readonly precision?: number
  }

  /**
   * @since 1.0.0
   * @category models
   */
  export interface TextOptions {
    readonly message: string
    readonly type?: "hidden" | "password" | "text"
    readonly default?: string
    readonly validate?: (value: string) => Effect<never, string, string>
  }
}

/**
 * Creates a custom `Prompt` from the provided `render` and `process` functions
 * with the specified initial state.
 *
 * The `render` function will be used to render the terminal prompt to a user
 * and is invoked at the beginning of each terminal render frame. The `process`
 * function is invoked immediately after a user presses a key.
 *
 * @since 1.0.0
 * @category constructors
 */
export const custom: <State, Output>(
  initialState: State,
  render: (
    state: State,
    action: Prompt.Action<State, Output>
  ) => Effect<never, never, string>,
  process: (
    input: Terminal.UserInput,
    state: State
  ) => Effect<never, never, Prompt.Action<State, Output>>
) => Prompt<Output> = internal.custom

/**
 * @since 1.0.0
 * @category combinators
 */
export const flatMap: {
  <Output, Output2>(f: (output: Output) => Prompt<Output2>): (self: Prompt<Output>) => Prompt<Output2>
  <Output, Output2>(self: Prompt<Output>, f: (output: Output) => Prompt<Output2>): Prompt<Output2>
} = internal.flatMap

/**
 * @since 1.0.0
 * @category constructors
 */
export const float: (options: Prompt.FloatOptions) => Prompt<number> = numberPrompt.float

/**
 * @since 1.0.0
 * @category constructors
 */
export const int: (options: Prompt.IntOptions) => Prompt<number> = numberPrompt.int

/**
 * @since 1.0.0
 * @category combinators
 */
export const map: {
  <Output, Output2>(f: (output: Output) => Output2): (self: Prompt<Output>) => Prompt<Output2>
  <Output, Output2>(self: Prompt<Output>, f: (output: Output) => Output2): Prompt<Output2>
} = internal.map

/**
 * Executes the specified `Prompt`.
 *
 * @since 1.0.0
 * @category execution
 */
export const run: <Output>(self: Prompt<Output>) => Effect<Terminal, never, Output> = internal.run

/**
 * Creates a `Prompt` which immediately succeeds with the specified value.
 *
 * **NOTE**: This method will not attempt to obtain user input or render
 * anything to the screen.
 *
 * @since 1.0.0
 * @category constructors
 */
export const succeed: <A>(value: A) => Prompt<A> = internal.succeed

/**
 * @since 1.0.0
 * @category constructors
 */
export const text: (options: Prompt.TextOptions) => Prompt<string> = textPrompt.text