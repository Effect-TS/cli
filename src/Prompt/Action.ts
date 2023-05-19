/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category models
 */
export type PromptAction<State, Output> = Beep | Error | NextFrame<State> | Submit<Output>

/**
 * @since 1.0.0
 * @category models
 */
export interface Beep {
  readonly _tag: "Beep"
}

/**
 * @since 1.0.0
 * @category models
 */
export interface Error {
  readonly _tag: "Error"
  readonly message: string
}

/**
 * @since 1.0.0
 * @category models
 */
export interface NextFrame<State> {
  readonly _tag: "NextFrame"
  readonly state: State
}

/**
 * @since 1.0.0
 * @category models
 */
export interface Submit<Output> {
  readonly _tag: "Submit"
  readonly value: Output
}
