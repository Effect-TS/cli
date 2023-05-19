import * as prompt from "@effect/cli/internal/prompt"
import * as promptAction from "@effect/cli/internal/prompt/action"
import { ansi, figures } from "@effect/cli/internal/prompt/ansi-utils"
import type * as Prompt from "@effect/cli/Prompt"
import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import type * as AnsiDoc from "@effect/printer-ansi/AnsiDoc"
import * as AnsiRender from "@effect/printer-ansi/AnsiRender"
import * as AnsiStyle from "@effect/printer-ansi/AnsiStyle"
import * as Color from "@effect/printer-ansi/Color"
import * as Doc from "@effect/printer/Doc"
import * as Optimize from "@effect/printer/Optimize"

interface TextState {
  readonly cursor: number
  readonly offset: number
  readonly value: string
}

const moveCursor = (x: number, y = 0) => Doc.text(ansi.moveCursor(x, y))
const saveCursor = Doc.text(ansi.cursorSave)
const restoreCursor = Doc.text(ansi.cursorRestore)
const resetLine = Doc.text(`${ansi.clearLine}${ansi.setCursorPosition(0)}`)
const resetDown = Doc.text(`${ansi.clearDown}${ansi.setCursorPosition(0)}`)

const renderError = (promptMsg: string, errorMsg: string, input: AnsiDoc.AnsiDoc, offset: number) =>
  Effect.map(figures, ({ pointerSmall }) => {
    const doc = pipe(
      resetLine,
      Doc.cat(Doc.annotate(Doc.text("?"), AnsiStyle.color(Color.cyan))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(Doc.text(promptMsg), AnsiStyle.bold)),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(Doc.text(pointerSmall), AnsiStyle.color(Color.black))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(input, AnsiStyle.color(Color.red))),
      Doc.cat(saveCursor),
      Doc.cat(Doc.hardLine),
      Doc.cat(Doc.annotate(Doc.text(pointerSmall), AnsiStyle.color(Color.red))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(
        Doc.text(errorMsg),
        AnsiStyle.combine(AnsiStyle.italicized, AnsiStyle.color(Color.red))
      )),
      Doc.cat(restoreCursor),
      Doc.cat(moveCursor(offset))
    )
    return AnsiRender.prettyDefault(Optimize.optimize(doc, Optimize.Deep))
  })

const renderNextFrame = (promptMsg: string, input: AnsiDoc.AnsiDoc, offset: number) =>
  Effect.map(figures, ({ pointerSmall }) => {
    const doc = pipe(
      resetLine,
      Doc.cat(Doc.annotate(Doc.text("?"), AnsiStyle.color(Color.cyan))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(Doc.text(promptMsg), AnsiStyle.bold)),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(Doc.text(pointerSmall), AnsiStyle.color(Color.black))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(input, AnsiStyle.color(Color.green))),
      Doc.cat(moveCursor(offset, 0))
    )
    return AnsiRender.prettyDefault(Optimize.optimize(doc, Optimize.Deep))
  })

const renderSubmission = (promptMsg: string, input: AnsiDoc.AnsiDoc) =>
  Effect.map(figures, ({ ellipsis, tick }) => {
    const doc = pipe(
      resetDown,
      Doc.cat(Doc.annotate(Doc.text(tick), AnsiStyle.color(Color.green))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(Doc.text(promptMsg), AnsiStyle.bold)),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(Doc.text(ellipsis), AnsiStyle.color(Color.black))),
      Doc.cat(Doc.space),
      Doc.cat(Doc.annotate(input, AnsiStyle.color(Color.green))),
      Doc.cat(Doc.hardLine)
    )
    return AnsiRender.prettyDefault(Optimize.optimize(doc, Optimize.Deep))
  })

const renderInput = (value: string, type: NonNullable<Prompt.Prompt.TextOptions["type"]>): AnsiDoc.AnsiDoc => {
  switch (type) {
    case "hidden": {
      return Doc.empty
    }
    case "password": {
      return Doc.text("*".repeat(value.length))
    }
    case "text": {
      return Doc.text(value)
    }
  }
}

const processBackspace = (currentState: TextState) => {
  if (currentState.cursor <= 0) {
    return Effect.succeed(promptAction.beep)
  }
  const beforeCursor = currentState.value.slice(0, currentState.cursor - 1)
  const afterCursor = currentState.value.slice(currentState.cursor)
  const cursor = currentState.cursor - 1
  const value = `${beforeCursor}${afterCursor}`
  return Effect.succeed(promptAction.nextFrame({ ...currentState, cursor, value }))
}

const processCursorLeft = (currentState: TextState) => {
  if (currentState.cursor <= 0) {
    return Effect.succeed(promptAction.beep)
  }
  const cursor = currentState.cursor - 1
  const offset = currentState.offset - 1
  return Effect.succeed(promptAction.nextFrame({ ...currentState, cursor, offset }))
}

const processCursorRight = (currentState: TextState) => {
  if (currentState.cursor >= currentState.value.length) {
    return Effect.succeed(promptAction.beep)
  }
  const cursor = Math.min(currentState.cursor + 1, currentState.value.length)
  const offset = Math.min(currentState.offset + 1, currentState.value.length)
  return Effect.succeed(promptAction.nextFrame({ ...currentState, cursor, offset }))
}

const defaultProcessor = (input: string, currentState: TextState) => {
  const beforeCursor = currentState.value.slice(0, currentState.cursor)
  const afterCursor = currentState.value.slice(currentState.cursor)
  const value = `${beforeCursor}${input}${afterCursor}`
  const cursor = beforeCursor.length + 1
  return Effect.succeed(promptAction.nextFrame({ ...currentState, cursor, value }))
}

const initialState: TextState = { cursor: 0, offset: 0, value: "" }

/** @internal */
export const text = (options: Prompt.Prompt.TextOptions): Prompt.Prompt<string> => {
  const opts: Required<Prompt.Prompt.TextOptions> = {
    default: "",
    type: "text",
    validate: Effect.succeed,
    ...options
  }
  return prompt.custom(
    initialState,
    (state, action) => {
      const input = renderInput(state.value, opts.type)
      switch (action._tag) {
        case "Beep": {
          return Effect.succeed(ansi.beep)
        }
        case "Error": {
          return renderError(opts.message, action.message, input, state.offset)
        }
        case "NextFrame": {
          return renderNextFrame(opts.message, input, state.offset)
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
        case "CursorLeft": {
          return processCursorLeft(state)
        }
        case "CursorRight": {
          return processCursorRight(state)
        }
        case "Submit": {
          return Effect.match(opts.validate(state.value), {
            onFailure: promptAction.error,
            onSuccess: promptAction.submit
          })
        }
        default: {
          return defaultProcessor(input.value, state)
        }
      }
    }
  )
}
