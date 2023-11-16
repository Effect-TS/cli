import * as Terminal from "@effect/platform/Terminal"
import type * as AnsiDoc from "@effect/printer-ansi/AnsiDoc"
import * as AnsiRender from "@effect/printer-ansi/AnsiRender"
import * as AnsiStyle from "@effect/printer-ansi/AnsiStyle"
import * as Color from "@effect/printer-ansi/Color"
import * as Doc from "@effect/printer/Doc"
import * as Optimize from "@effect/printer/Optimize"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as ReadonlyArray from "effect/ReadonlyArray"
import type * as Prompt from "../../Prompt.js"
import type * as PromptAction from "../../Prompt/Action.js"
import * as InternalPrompt from "../prompt.js"
import * as InternalPromptAction from "./action.js"
import * as InternalAnsiUtils from "./ansi-utils.js"

interface State {
  readonly value: boolean
}

const renderBeep = AnsiRender.prettyDefault(InternalAnsiUtils.beep)

const renderClearScreen = (
  prevState: Option.Option<State>,
  options: Required<Prompt.Prompt.ConfirmOptions>,
  columns: number
): AnsiDoc.AnsiDoc => {
  const clearPrompt = Doc.cat(InternalAnsiUtils.eraseLine, InternalAnsiUtils.cursorLeft)
  if (Option.isNone(prevState)) {
    return clearPrompt
  }
  const clearOutput = InternalAnsiUtils.eraseText(options.message, columns)
  return Doc.cat(clearOutput, clearPrompt)
}

const renderOutput = (
  confirm: AnsiDoc.AnsiDoc,
  leadingSymbol: AnsiDoc.AnsiDoc,
  trailingSymbol: AnsiDoc.AnsiDoc,
  options: Required<Prompt.Prompt.ConfirmOptions>
): AnsiDoc.AnsiDoc => {
  const annotateLine = (line: string): AnsiDoc.AnsiDoc =>
    Doc.annotate(Doc.text(line), AnsiStyle.bold)
  const promptLines = options.message.split(/\r?\n/)
  const prefix = Doc.cat(leadingSymbol, Doc.space)
  if (ReadonlyArray.isNonEmptyReadonlyArray(promptLines)) {
    const lines = ReadonlyArray.map(promptLines, (line) => annotateLine(line))
    return pipe(
      prefix,
      Doc.cat(Doc.nest(Doc.vsep(lines), 2)),
      Doc.cat(Doc.space),
      Doc.cat(trailingSymbol),
      Doc.cat(Doc.space),
      Doc.cat(confirm)
    )
  }
  return Doc.hsep([prefix, trailingSymbol, confirm])
}

const renderNextFrame = (
  prevState: Option.Option<State>,
  nextState: State,
  options: Required<Prompt.Prompt.ConfirmOptions>
): Effect.Effect<Terminal.Terminal, never, string> =>
  Effect.gen(function*(_) {
    const terminal = yield* _(Terminal.Terminal)
    const figures = yield* _(InternalAnsiUtils.figures)
    const clearScreen = renderClearScreen(prevState, options, terminal.columns)
    const leadingSymbol = Doc.annotate(Doc.text("?"), AnsiStyle.color(Color.cyan))
    const trailingSymbol = Doc.annotate(figures.pointerSmall, AnsiStyle.color(Color.black))
    const confirmAnnotation = AnsiStyle.color(Color.black)
    // Marking these explicitly as present with `!` because they always will be
    // and there is really no value in adding a `DeepRequired` type helper just
    // for these internal cases
    const confirmMessage = nextState.value
      ? options.placeholder.defaultConfirm!
      : options.placeholder.defaultDeny!
    const confirm = Doc.annotate(Doc.text(confirmMessage), confirmAnnotation)
    const promptMsg = renderOutput(confirm, leadingSymbol, trailingSymbol, options)
    return pipe(
      clearScreen,
      Doc.cat(InternalAnsiUtils.cursorHide),
      Doc.cat(promptMsg),
      Optimize.optimize(Optimize.Deep),
      AnsiRender.prettyDefault
    )
  })

const renderSubmission = (
  nextState: State,
  value: boolean,
  options: Required<Prompt.Prompt.ConfirmOptions>
) =>
  Effect.gen(function*(_) {
    const terminal = yield* _(Terminal.Terminal)
    const figures = yield* _(InternalAnsiUtils.figures)
    const clearScreen = renderClearScreen(Option.some(nextState), options, terminal.columns)
    const leadingSymbol = Doc.annotate(figures.tick, AnsiStyle.color(Color.green))
    const trailingSymbol = Doc.annotate(figures.ellipsis, AnsiStyle.color(Color.black))
    const confirmMessage = value ? options.label.confirm : options.label.deny
    const confirm = Doc.text(confirmMessage)
    const promptMsg = renderOutput(confirm, leadingSymbol, trailingSymbol, options)
    return pipe(
      clearScreen,
      Doc.cat(promptMsg),
      Doc.cat(Doc.hardLine),
      Optimize.optimize(Optimize.Deep),
      AnsiRender.prettyDefault
    )
  })

const TRUE_VALUE_REGEX = /^y|t$/
const FALSE_VALUE_REGEX = /^n|f$/

const processInputValue = (
  value: string
): Effect.Effect<never, never, PromptAction.PromptAction<State, boolean>> => {
  if (TRUE_VALUE_REGEX.test(value.toLowerCase())) {
    return Effect.succeed(InternalPromptAction.submit(true))
  }
  if (FALSE_VALUE_REGEX.test(value.toLowerCase())) {
    return Effect.succeed(InternalPromptAction.submit(false))
  }
  return Effect.succeed(InternalPromptAction.beep)
}

/** @internal */
export const confirm = (options: Prompt.Prompt.ConfirmOptions): Prompt.Prompt<boolean> => {
  const opts: Required<Prompt.Prompt.ConfirmOptions> = {
    initial: false,
    ...options,
    label: {
      confirm: "yes",
      deny: "no",
      ...options.label
    },
    placeholder: {
      defaultConfirm: "(Y/n)",
      defaultDeny: "(y/N)",
      ...options.placeholder
    }
  }
  return InternalPrompt.custom(
    { value: opts.initial } as State,
    (prevState, nextState, action) => {
      switch (action._tag) {
        case "Beep": {
          return Effect.succeed(renderBeep)
        }
        case "NextFrame": {
          return renderNextFrame(prevState, nextState, opts)
        }
        case "Submit": {
          return renderSubmission(nextState, action.value, opts)
        }
      }
    },
    (input, _) => {
      const value = Option.getOrElse(input.input, () => "")
      return processInputValue(value)
    }
  )
}