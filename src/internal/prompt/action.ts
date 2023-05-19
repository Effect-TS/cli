import type * as PromptAction from "@effect/cli/Prompt/Action"

/**
 * @since 1.0.0
 * @category constructors
 */
export const beep: PromptAction.PromptAction<never, never> = {
  _tag: "Beep"
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const error = (message: string): PromptAction.PromptAction<never, never> => ({
  _tag: "Error",
  message
})

/**
 * @since 1.0.0
 * @category constructors
 */
export const nextFrame = <State>(state: State): PromptAction.PromptAction<State, never> => ({
  _tag: "NextFrame",
  state
})

/**
 * @since 1.0.0
 * @category constructors
 */
export const submit = <Output>(value: Output): PromptAction.PromptAction<never, Output> => ({
  _tag: "Submit",
  value
})
