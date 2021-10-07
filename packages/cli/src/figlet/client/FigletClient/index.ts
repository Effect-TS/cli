// ets_tracing: off

import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import * as S from "@effect-ts/core/Effect/Stream"
import * as Sink from "@effect-ts/core/Effect/Stream/Sink"
import * as Transducer from "@effect-ts/core/Effect/Stream/Transducer"
import { identity } from "@effect-ts/core/Function"
import { tag } from "@effect-ts/core/Has"
import type { _A } from "@effect-ts/core/Utils"
import type { Byte } from "@effect-ts/node/Byte"
import * as NodeJSFileSystem from "fs"
import * as NodeJSPath from "path"

import { splitLines, utf8Decode } from "../../../Internal/Transducers"
import type { FigFont } from "../../core/FigFont"
import * as FF from "../../core/FigFont"
import type { Figure } from "../../core/Figure"
import type { FigletException } from "../../error/FigletException"
import { FigletFileError } from "../../error/FigletException"
import * as Rendering from "../../rendering"
import { FontFileReader } from "../FontFileReader"
import type { RenderOptions } from "../RenderOptions"

// -----------------------------------------------------------------------------
// Figlet Client
// -----------------------------------------------------------------------------

export const FigletClientSymbol = Symbol()
export type FigletClientSymbol = typeof FigletClientSymbol

export interface FigletClient {
  readonly [FigletClientSymbol]: FigletClientSymbol
  readonly defaultFont: string
  readonly defaultMaxWidth: number
  readonly internalFonts: T.IO<FigletException, Chunk<string>>
  readonly loadFont: (path: string) => T.IO<NonEmptyArray<FigletException>, FigFont>
  readonly loadFontInternal: (
    name: string
  ) => T.IO<NonEmptyArray<FigletException>, FigFont>
  readonly renderString: (text: string, options: RenderOptions) => T.UIO<Figure>
}

export const makeFigletClient = T.gen(function* (_) {
  const { read } = yield* _(FontFileReader)

  return identity<FigletClient>({
    [FigletClientSymbol]: FigletClientSymbol,
    defaultFont: "standard",
    defaultMaxWidth: 80,
    internalFonts: T.effectAsync((cb) => {
      NodeJSFileSystem.readdir(
        NodeJSPath.join(__dirname, "../..", "fonts"),
        (err, files) => {
          if (err) {
            cb(T.fail(new FigletFileError({ message: err.message })))
          }
          cb(T.succeed(C.from(files)))
        }
      )
    }),
    loadFont: (path) => read(path, createFigFont),
    loadFontInternal: (name) =>
      read(NodeJSPath.join(__dirname, "../..", "fonts", `${name}.flf`), createFigFont),
    renderString: (text, options) => T.succeed(Rendering.render(text, options))
  })
})

export const FigletClient = tag<FigletClient>()
export const LiveFigletClient = L.fromEffect(FigletClient)(makeFigletClient)

export const {
  defaultFont,
  defaultMaxWidth,
  internalFonts,
  loadFont,
  loadFontInternal,
  renderString
} = T.deriveLifted(FigletClient)(
  ["loadFont", "loadFontInternal", "renderString"],
  ["internalFonts"],
  ["defaultFont", "defaultMaxWidth"]
)

function createFigFont(
  file: string,
  buffer: S.IO<FigletException, Byte>
): T.IO<NonEmptyArray<FigletException>, FigFont> {
  const transducer = Transducer.then(splitLines)(utf8Decode)
  return T.chain_(
    T.mapError_(S.run_(S.aggregate_(buffer, transducer), Sink.collectAll()), NA.single),
    (lines) => T.fromEither(() => FF.fromFile(file, lines))
  )
}
