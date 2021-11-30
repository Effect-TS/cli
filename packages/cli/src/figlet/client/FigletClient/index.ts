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
import { pipe } from "@effect-ts/core/Function"
import type { Has } from "@effect-ts/core/Has"
import { service, tag } from "@effect-ts/core/Has"
import * as String from "@effect-ts/core/String"
import type { _A } from "@effect-ts/core/Utils"
import type { Byte } from "@effect-ts/node/Byte"
import * as NodeJSFileSystem from "fs"
import * as NodeJSPath from "path"

import { splitLines, utf8Decode } from "../../../Internal/Transducers"
import type { FigFont } from "../../core/FigFont"
import * as FF from "../../core/FigFont"
import type { FigletException } from "../../error/FigletException"
import { FigletFileError } from "../../error/FigletException"
import * as Rendering from "../../rendering"
import { FontFileReader } from "../FontFileReader"
import type { RenderOptions } from "../RenderOptions"

// -----------------------------------------------------------------------------
// Figlet Client
// -----------------------------------------------------------------------------

export const FigletClientId = Symbol()
export type FigletClientId = typeof FigletClientId

export const makeFigletClient = T.gen(function* (_) {
  const { read } = yield* _(FontFileReader)

  return service({
    defaultFont: "standard",
    defaultMaxWidth: 80,
    internalFonts: pipe(
      T.effectAsync<unknown, FigletException, Chunk<string>>((cb) => {
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
      T.map(C.map(String.replace(".flf", "")))
    ),
    loadFont: (path: string) => read(path, createFigFont),
    loadFontInternal: (name: string) =>
      read(NodeJSPath.join(__dirname, "../..", "fonts", `${name}.flf`), createFigFont),
    renderString: (text: string, options: RenderOptions) =>
      T.succeed(Rendering.render(text, options))
  })
})

export interface FigletClient extends _A<typeof makeFigletClient> {}

export const FigletClient = tag<FigletClient>(FigletClientId)

export type HasFigletClient = Has<FigletClient>

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
  return pipe(
    buffer,
    S.aggregate(transducer),
    S.run(Sink.collectAll()),
    T.mapError(NA.single),
    T.chain((lines) => T.fromEither(() => FF.fromFile(file, lines)))
  )
}
