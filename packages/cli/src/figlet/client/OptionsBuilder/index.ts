// ets_tracing: off

import { Case } from "@effect-ts/core/Case"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as T from "@effect-ts/core/Effect"
import { not } from "@effect-ts/core/Function"
import type { Has } from "@effect-ts/core/Has"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

import type { FigFont } from "../../core/FigFont"
import type { Figure } from "../../core/Figure"
import * as Fig from "../../core/Figure"
import type { FigletException } from "../../error/FigletException"
import type { BuilderAction } from "../BuilderAction"
import * as Actions from "../BuilderAction"
import type { HorizontalLayout } from "../ClientOptions/HorizontalLayout"
import * as HL from "../ClientOptions/HorizontalLayout"
import type { Justification } from "../ClientOptions/Justification"
import * as J from "../ClientOptions/Justification"
import type { PrintDirection } from "../ClientOptions/PrintDirection"
import * as PD from "../ClientOptions/PrintDirection"
import * as FigletClient from "../FigletClient"
import { RenderOptions } from "../RenderOptions"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents a collection of rendering options.
 *
 * This builder works by recording what settings a user wants to use instead of
 * applying the setting immediately when calling a method. This allows for a
 * fail-safe behaviour when, for instance, a user wants to load a file but the
 * file is missing. Instead of receiving an exception when calling
 * `OptionsBuilder.withFont`, the builder will simply record the desire of to
 * load a file. The actual loading, and failure, will happen and be handled when
 * calling `OptionsBuilder.compile()`.
 */
export class OptionsBuilder {
  constructor(
    /**
     * The list of actions that will be executed to obtain the final
     * configuration.
     */
    readonly actions: Chunk<BuilderAction> = C.empty()
  ) {}
}

export class BuildData extends Case<{
  readonly font: Option<FigFont>
  readonly horizontalLayout: HorizontalLayout
  readonly justification: Justification
  readonly maxWidth: Option<number>
  readonly printDirection: PrintDirection
  readonly text: string
}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/**
 * Creates a new `OptionsBuilder` with default settings.
 */
export function builder(): OptionsBuilder {
  return new OptionsBuilder()
}

/**
 * Creates a new `OptionsBuilder` with default settings and using an initial
 * action.
 */
export function withInitialAction(initialAction: BuilderAction): OptionsBuilder {
  return new OptionsBuilder(C.single(initialAction))
}

/**
 * Create a new instance of `BuildData` using the provided parameters.
 */
export function buildData(
  params: Partial<{
    font: Option<FigFont>
    horizontalLayout: HorizontalLayout
    justification: Justification
    maxWidth: Option<number>
    printDirection: PrintDirection
    text: string
  }> = {}
): BuildData {
  return new BuildData({
    font: O.none,
    horizontalLayout: new HL.FontDefault(),
    justification: new J.FontDefault(),
    maxWidth: O.none,
    printDirection: new PD.FontDefault(),
    text: "",
    ...params
  })
}

// -----------------------------------------------------------------------------
// Combinators
// -----------------------------------------------------------------------------

/**
 * Set the text to render.
 */
export function text_(self: OptionsBuilder, text: string): OptionsBuilder {
  return addAction(self, new Actions.SetTextAction({ text }))
}

/**
 * Set the text to render.
 *
 * @ets_data_first text_
 */
export function text(text: string) {
  return (self: OptionsBuilder): OptionsBuilder => text_(self, text)
}

/**
 * Use the default `FigFont` to render the text.
 */
export function withDefaultFont(self: OptionsBuilder): OptionsBuilder {
  return addAction(self, new Actions.DefaultFontAction())
}

/**
 * Use one of the internal fonts to render the text.
 *
 * The loading of the font is performed when the `RenderOptions` is built.
 */
export function withInternalFont_(
  self: OptionsBuilder,
  fontName: string
): OptionsBuilder {
  return addAction(self, new Actions.LoadInternalFontAction({ fontPath: fontName }))
}

/**
 * Use one of the internal fonts to render the text.
 *
 * The loading of the font is performed when the `RenderOptions` is built.
 *
 * @ets_data_first withInternalFont_
 */
export function withInternalFont(fontName: string) {
  return (self: OptionsBuilder): OptionsBuilder => withInternalFont_(self, fontName)
}

/**
 * Use a font loaded from a Figlet file to render the text.
 *
 * The loading of the font is performed when the `RenderOptions` is built.
 */
export function withFont_(self: OptionsBuilder, fontPath: string): OptionsBuilder {
  return addAction(self, new Actions.LoadFontAction({ fontPath }))
}

/**
 * Use a font loaded from a Figlet file to render the text.
 *
 * The loading of the font is performed when the `RenderOptions` is built.
 *
 * @ets_data_first withFont_
 */
export function withFont(fontPath: string) {
  return (self: OptionsBuilder): OptionsBuilder => withFont_(self, fontPath)
}

/**
 * Use a font that has already been loaded to render the text.
 */
export function withFigFont_(self: OptionsBuilder, font: FigFont): OptionsBuilder {
  return addAction(self, new Actions.SetFontAction({ font }))
}

/**
 * Use a font that has already been loaded to render the text.
 *
 * @ets_data_first withFigFont_
 */
export function withFigFont(font: FigFont) {
  return (self: OptionsBuilder) => withFigFont_(self, font)
}

/**
 * Use the default horizontal layout to render the text.
 */
export function withDefaultHorizontalLayout(self: OptionsBuilder): OptionsBuilder {
  return addAction(self, new Actions.DefaultHorizontalLayout())
}

/**
 * Use the specified `HorizontalLayout` to render the text.
 */
export function withHorizontalLayout_(
  self: OptionsBuilder,
  layout: HorizontalLayout
): OptionsBuilder {
  return addAction(self, new Actions.SetHorizontalLayout({ layout }))
}

/**
 * Use the specified `HorizontalLayout` to render the text.
 *
 * @ets_data_first withHorizontalLayout_
 */
export function withHorizontalLayout(layout: HorizontalLayout) {
  return (self: OptionsBuilder): OptionsBuilder => withHorizontalLayout_(self, layout)
}

/**
 * Use the default maximum width to render the text.
 */
export function withDefaultMaxWidth(self: OptionsBuilder): OptionsBuilder {
  return addAction(self, new Actions.DefaultMaxWidthAction())
}

/**
 * Use the specified maximum width to render the text.
 */
export function withMaxWidth_(self: OptionsBuilder, maxWidth: number): OptionsBuilder {
  return addAction(self, new Actions.SetMaxWidthAction({ maxWidth }))
}

/**
 * Use the specified maximum width to render the text.
 *
 * @ets_data_first withMaxWidth_
 */
export function withMaxWidth(maxWidth: number) {
  return (self: OptionsBuilder): OptionsBuilder => withMaxWidth_(self, maxWidth)
}

/**
 * Use the default print direction to render the text.
 *
 * **NOTE**: This feature is not yet implemented and will have no effect.
 */
export function withDefaultPrintDirection(self: OptionsBuilder): OptionsBuilder {
  return addAction(self, new Actions.DefaultPrintDirection())
}

/**
 * Use the specified print direction to render the text.
 *
 * **NOTE**: This feature is not yet implemented and will have no effect.
 */
export function withPrintDirection_(
  self: OptionsBuilder,
  direction: PrintDirection
): OptionsBuilder {
  return addAction(self, new Actions.SetPrintDirection({ direction }))
}

/**
 * Use the specified print direction to render the text.
 *
 * **NOTE**: This feature is not yet implemented and will have no effect.
 *
 * @ets_data_first withPrintDirection_
 */
export function withPrintDirection(direction: PrintDirection) {
  return (self: OptionsBuilder): OptionsBuilder => withPrintDirection_(self, direction)
}

/**
 * Use the default justification to render the text.
 *
 * **NOTE**: This feature is not yet implemented and will have no effect.
 */
export function withDefaultJustification(self: OptionsBuilder): OptionsBuilder {
  return addAction(self, new Actions.DefaultJustification())
}

/**
 * Use the specified justification to render the text.
 *
 * **NOTE**: This feature is not yet implemented and will have no effect.
 */
export function withJustification_(
  self: OptionsBuilder,
  justification: Justification
): OptionsBuilder {
  return addAction(self, new Actions.SetJustification({ justification }))
}

/**
 * Use the specified justification to render the text.
 *
 * **NOTE**: This feature is not yet implemented and will have no effect.
 *
 * @ets_data_first withJustification_
 */
export function withJustification(justification: Justification) {
  return (self: OptionsBuilder): OptionsBuilder =>
    withJustification_(self, justification)
}

function addAction(self: OptionsBuilder, action: BuilderAction): OptionsBuilder {
  return new OptionsBuilder(
    C.prepend_(C.filter_(self.actions, not(Actions.sameGroupAs(action))), action)
  )
}

// -----------------------------------------------------------------------------
// Compilers
// -----------------------------------------------------------------------------

export function compile(
  self: OptionsBuilder
): T.Effect<Has<FigletClient.FigletClient>, NonEmptyArray<FigletException>, BuildData> {
  return T.chain_(FigletClient.defaultFont, (defaultFont) =>
    C.reduceM_(self.actions, buildData(), (data, action) => {
      switch (action._tag) {
        // Fonts
        case "DefaultFontAction":
          return T.map_(FigletClient.loadFontInternal(defaultFont), (font) =>
            data.copy({ font: O.some(font) })
          )
        case "SetFontAction":
          return T.succeed(data.copy({ font: O.some(action.font) }))
        case "LoadFontAction":
          return T.map_(FigletClient.loadFont(action.fontPath), (font) =>
            data.copy({ font: O.some(font) })
          )
        case "LoadInternalFontAction":
          return T.map_(FigletClient.loadFontInternal(action.fontPath), (font) =>
            data.copy({ font: O.some(font) })
          )

        // Horizontal Layout
        case "DefaultHorizontalLayout":
          return T.succeed(data.copy({ horizontalLayout: new HL.FontDefault() }))
        case "SetHorizontalLayout":
          return T.succeed(data.copy({ horizontalLayout: action.layout }))

        // Justification
        case "DefaultJustification":
          return T.succeed(data.copy({ justification: new J.FontDefault() }))
        case "SetJustification":
          return T.succeed(data.copy({ justification: action.justification }))

        // Max Width
        case "DefaultMaxWidthAction":
          return T.succeed(data.copy({ maxWidth: O.none }))
        case "SetMaxWidthAction":
          return T.succeed(data.copy({ maxWidth: O.some(action.maxWidth) }))

        // Print Direction
        case "DefaultPrintDirection":
          return T.succeed(data.copy({ printDirection: new PD.FontDefault() }))
        case "SetPrintDirection":
          return T.succeed(data.copy({ printDirection: action.direction }))

        case "SetTextAction":
          return T.succeed(data.copy({ text: action.text }))
      }
    })
  )
}

// -----------------------------------------------------------------------------
// Renderers
// -----------------------------------------------------------------------------

export function print(
  self: OptionsBuilder
): T.Effect<Has<FigletClient.FigletClient>, NonEmptyArray<FigletException>, string> {
  return T.map_(render(self), Fig.showFigure.show)
}

export function render(
  self: OptionsBuilder
): T.Effect<Has<FigletClient.FigletClient>, NonEmptyArray<FigletException>, Figure> {
  return T.gen(function* (_) {
    const buildOptions = yield* _(compile(self))
    const renderOptions = yield* _(options(self))
    return yield* _(FigletClient.renderString(buildOptions.text, renderOptions))
  })
}

export function options(
  self: OptionsBuilder
): T.Effect<
  Has<FigletClient.FigletClient>,
  NonEmptyArray<FigletException>,
  RenderOptions
> {
  return T.gen(function* (_) {
    const options = yield* _(compile(self))

    let font: FigFont
    if (O.isNone(options.font)) {
      const defaultFont = yield* _(FigletClient.defaultFont)
      font = yield* _(FigletClient.loadFontInternal(defaultFont))
    } else {
      font = options.font.value
    }
    let maxWidth: number
    if (O.isNone(options.maxWidth)) {
      maxWidth = yield* _(FigletClient.defaultMaxWidth)
    } else {
      maxWidth = options.maxWidth.value
    }

    return new RenderOptions({
      font,
      maxWidth,
      horizontalLayout: options.horizontalLayout,
      printDirection: options.printDirection,
      justification: options.justification
    })
  })
}
