import * as prompt from "@effect/cli/internal/prompt"
import * as promptAction from "@effect/cli/internal/prompt/action"
import * as ansiUtils from "@effect/cli/internal/prompt/ansi-utils"
import type * as Prompt from "@effect/cli/Prompt"
import type * as PromptAction from "@effect/cli/Prompt/Action"
import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import type * as AnsiDoc from "@effect/printer-ansi/AnsiDoc"
import * as AnsiRender from "@effect/printer-ansi/AnsiRender"
import * as AnsiStyle from "@effect/printer-ansi/AnsiStyle"
import * as Color from "@effect/printer-ansi/Color"
import * as Doc from "@effect/printer/Doc"
import * as Optimize from "@effect/printer/Optimize"

interface State {
  readonly cursor: number
  readonly value: string
}

// const round = (number: number, precision: number) => {
//   const factor = Math.pow(10, precision)
//   return Math.round(number * factor) / factor
// }

const parseInt = (value: string): Effect.Effect<never, void, number> =>
  Effect.suspend(() => {
    const parsed = Number.parseInt(value)
    if (Number.isNaN(parsed)) {
      return Effect.fail(void 0)
    }
    return Effect.succeed(parsed)
  })

// const parseFloat = (value: string, precision: number): Effect.Effect<never, void, number> =>
//   Effect.suspend(() => {
//     const parsed = Number.parseFloat(value)
//     if (Number.isNaN(parsed)) {
//       return Effect.fail(void 0)
//     }
//     return Effect.sync(() => round(parsed, precision))
//   })

// const clampValue = (value: number, min: number, max: number) => {
//   if (value < min) {
//     return min
//   }
//   if (value > max) {
//     return max
//   }
//   return value
// }

const renderBeep = AnsiRender.prettyDefault(ansiUtils.beep)

const renderError = (promptMsg: string, errorMsg: string, input: AnsiDoc.AnsiDoc) =>
  Effect.map(ansiUtils.figures, ({ pointerSmall }) => {
    const doc = pipe(
      ansiUtils.resetLine,
      Doc.cat(Doc.annotate(Doc.text("?"), AnsiStyle.color(Color.cyan))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(Doc.text(promptMsg), AnsiStyle.bold)),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(pointerSmall, AnsiStyle.color(Color.black))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(input, AnsiStyle.combine(AnsiStyle.underlined, AnsiStyle.color(Color.red)))),
      Doc.cat(ansiUtils.cursorSave),
      Doc.cat(Doc.hardLine),
      Doc.cat(Doc.annotate(pointerSmall, AnsiStyle.color(Color.red))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(
        Doc.text(errorMsg),
        AnsiStyle.combine(AnsiStyle.italicized, AnsiStyle.color(Color.red))
      )),
      Doc.cat(ansiUtils.cursorRestore)
    )
    return AnsiRender.prettyDefault(Optimize.optimize(doc, Optimize.Deep))
  })

const renderNextFrame = (promptMsg: string, input: AnsiDoc.AnsiDoc) =>
  Effect.map(ansiUtils.figures, ({ pointerSmall }) => {
    const doc = pipe(
      ansiUtils.resetLine,
      Doc.cat(Doc.annotate(Doc.text("?"), AnsiStyle.color(Color.cyan))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(Doc.text(promptMsg), AnsiStyle.bold)),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(pointerSmall, AnsiStyle.color(Color.black))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(input, AnsiStyle.combine(AnsiStyle.underlined, AnsiStyle.color(Color.green))))
    )
    return AnsiRender.prettyDefault(Optimize.optimize(doc, Optimize.Deep))
  })

const renderSubmission = (promptMsg: string, input: AnsiDoc.AnsiDoc) =>
  Effect.map(ansiUtils.figures, ({ ellipsis, tick }) => {
    const doc = pipe(
      ansiUtils.resetDown,
      Doc.cat(Doc.annotate(tick, AnsiStyle.color(Color.green))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(Doc.text(promptMsg), AnsiStyle.bold)),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(ellipsis, AnsiStyle.color(Color.black))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(input, AnsiStyle.color(Color.white))),
      Doc.cat(Doc.hardLine)
    )
    return AnsiRender.prettyDefault(Optimize.optimize(doc, Optimize.Deep))
  })

const processBackspace = (currentState: State) => {
  if (currentState.value.length <= 0) {
    return Effect.succeed(promptAction.beep)
  }
  return Effect.succeed(promptAction.nextFrame({
    ...currentState,
    value: currentState.value.slice(0, currentState.value.length - 1)
  }))
}

const processCursorUp = (currentState: State, incrementBy: number) =>
  Effect.sync(() =>
    promptAction.nextFrame({
      ...currentState,
      value: currentState.value === "" || currentState.value === "-"
        ? `${incrementBy}`
        : `${Number.parseInt(currentState.value) + incrementBy}`
    })
  )

const processCursorDown = (currentState: State, decrementBy: number) =>
  Effect.sync(() =>
    promptAction.nextFrame({
      ...currentState,
      value: currentState.value === "" || currentState.value === "-"
        ? `-${decrementBy}`
        : `${Number.parseInt(currentState.value) - decrementBy}`
    })
  )

const defaultIntProcessor = (
  currentState: State,
  input: string
): Effect.Effect<never, never, PromptAction.PromptAction<State, number>> => {
  if (currentState.value.length === 0 && input === "-") {
    return Effect.succeed(promptAction.nextFrame({ ...currentState, value: "-" }))
  }
  return Effect.match(parseInt(currentState.value + input), {
    onFailure: () => promptAction.beep,
    onSuccess: (value) => promptAction.nextFrame({ ...currentState, value: `${value}` })
  })
}

const initialState: State = { cursor: 0, value: "" }

/** @internal */
export const int = (options: Prompt.Prompt.IntOptions): Prompt.Prompt<number> => {
  const opts: Required<Prompt.Prompt.IntOptions> = {
    min: Number.NEGATIVE_INFINITY,
    max: Number.POSITIVE_INFINITY,
    incrementBy: 1,
    decrementBy: 1,
    validate: Effect.succeed,
    ...options
  }
  return prompt.custom(
    initialState,
    (state, action) => {
      const input = state.value === "" ? Doc.empty : Doc.text(`${state.value}`)
      switch (action._tag) {
        case "Beep": {
          return Effect.succeed(renderBeep)
        }
        case "Error": {
          return renderError(opts.message, action.message, input)
        }
        case "NextFrame": {
          return renderNextFrame(opts.message, input)
        }
        case "Submit": {
          return renderSubmission(opts.message, input)
        }
      }
    },
    (input, state) => {
      switch (input.action) {
        case "Backspace": {
          return processBackspace(state)
        }
        case "CursorUp": {
          return processCursorUp(state, opts.incrementBy)
        }
        case "CursorDown": {
          return processCursorDown(state, opts.decrementBy)
        }
        case "Submit": {
          return Effect.matchEffect(parseInt(state.value), {
            onFailure: () => Effect.succeed(promptAction.error("Must provide an integer value")),
            onSuccess: (n) =>
              Effect.match(opts.validate(n), {
                onFailure: promptAction.error,
                onSuccess: promptAction.submit
              })
          })
        }
        default: {
          return defaultIntProcessor(state, input.value)
        }
      }
    }
  )
}
