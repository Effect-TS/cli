import * as terminal from "@effect/cli/internal/terminal"
import type * as Prompt from "@effect/cli/Prompt"
import type * as Terminal from "@effect/cli/Terminal"
import { dual, pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Ref from "@effect/io/Ref"

/** @internal */
const PromptSymbolKey = "@effect/cli/Prompt"

/** @internal */
export const PromptTypeId: Prompt.PromptTypeId = Symbol.for(
  PromptSymbolKey
) as Prompt.PromptTypeId

/** @internal */
const proto = {
  [PromptTypeId]: {
    _Output: (_: never) => _
  }
}

/** @internal */
type Op<Tag extends string, Body = {}> = Prompt.Prompt<never> & Body & {
  readonly _tag: Tag
}

/** @internal */
export type Primitive = Loop | OnSuccess | Succeed

/** @internal */
export interface Loop extends
  Op<"Loop", {
    readonly initialState: unknown
    readonly render: (
      state: unknown,
      action: Prompt.Prompt.Action<unknown, unknown>
    ) => Effect.Effect<never, never, string>
    readonly process: (
      input: Terminal.Terminal.UserInput,
      state: unknown
    ) => Effect.Effect<never, never, Prompt.Prompt.Action<unknown, unknown>>
  }>
{}

/** @internal */
export interface OnSuccess extends
  Op<"OnSuccess", {
    readonly prompt: Primitive
    readonly onSuccess: (value: unknown) => Prompt.Prompt<unknown>
  }>
{}

/** @internal */
export interface Succeed extends
  Op<"Succeed", {
    readonly value: unknown
  }>
{}

/** @internal */
export const custom = <State, Output>(
  initialState: State,
  render: (
    state: State,
    action: Prompt.Prompt.Action<State, Output>
  ) => Effect.Effect<never, never, string>,
  process: (
    input: Terminal.Terminal.UserInput,
    state: State
  ) => Effect.Effect<never, never, Prompt.Prompt.Action<State, Output>>
): Prompt.Prompt<Output> => {
  const op = Object.create(proto)
  op._tag = "Loop"
  op.initialState = initialState
  op.render = render
  op.process = process
  return op
}

/** @internal */
export const map = dual<
  <Output, Output2>(
    f: (output: Output) => Output2
  ) => (
    self: Prompt.Prompt<Output>
  ) => Prompt.Prompt<Output2>,
  <Output, Output2>(
    self: Prompt.Prompt<Output>,
    f: (output: Output) => Output2
  ) => Prompt.Prompt<Output2>
>(2, (self, f) => flatMap(self, (a) => succeed(f(a))))

/** @internal */
export const flatMap = dual<
  <Output, Output2>(
    f: (output: Output) => Prompt.Prompt<Output2>
  ) => (
    self: Prompt.Prompt<Output>
  ) => Prompt.Prompt<Output2>,
  <Output, Output2>(
    self: Prompt.Prompt<Output>,
    f: (output: Output) => Prompt.Prompt<Output2>
  ) => Prompt.Prompt<Output2>
>(2, (self, f) => {
  const op = Object.create(proto)
  op._tag = "OnSuccess"
  op.prompt = self
  op.onSuccess = f
  return op
})

/** @internal */
export const run = <Output>(
  self: Prompt.Prompt<Output>
): Effect.Effect<Terminal.Terminal, never, Output> =>
  Effect.flatMap(terminal.Tag, (terminal) => {
    const op = self as Primitive
    switch (op._tag) {
      case "Loop": {
        return Effect.flatMap(Ref.make(op.initialState), (ref) => {
          const loop = (
            action: Exclude<Prompt.Prompt.Action<unknown, unknown>, { _tag: "Submit" }>
          ): Effect.Effect<never, never, any> =>
            Effect.flatMap(Ref.get(ref), (state) =>
              pipe(
                op.render(state, action),
                Effect.flatMap(terminal.display),
                Effect.zipRight(terminal.getUserInput),
                Effect.flatMap((input) => op.process(input, state)),
                Effect.flatMap((action) => {
                  switch (action._tag) {
                    case "NextFrame": {
                      return Effect.zipRight(Ref.set(ref, action.state), loop(action))
                    }
                    case "Submit": {
                      return pipe(
                        op.render(state, action),
                        Effect.flatMap(terminal.display),
                        Effect.zipRight(Effect.succeed(action.value))
                      )
                    }
                    default: {
                      return loop(action)
                    }
                  }
                })
              ))
          return loop({ _tag: "NextFrame", state: op.initialState })
        })
      }
      case "OnSuccess": {
        return Effect.flatMap(run(op.prompt), (a) => run(op.onSuccess(a))) as any
      }
      case "Succeed": {
        return Effect.succeed(op.value)
      }
    }
  })

/** @internal */
export const succeed = <A>(value: A): Prompt.Prompt<A> => {
  const op = Object.create(proto)
  op._tag = "Succeed"
  op.value = value
  return op
}
