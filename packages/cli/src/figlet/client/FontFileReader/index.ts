// ets_tracing: off

import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import * as S from "@effect-ts/core/Effect/Stream"
import type { Has, Tag } from "@effect-ts/core/Has"
import { service, tag } from "@effect-ts/core/Has"
import type { _A } from "@effect-ts/core/Utils"
import type { Byte } from "@effect-ts/node/Byte"
import * as NS from "@effect-ts/node/Stream"
import * as NodeJSFileSystem from "fs"

import type { FigFont } from "../../core/FigFont"
import type { FigletException } from "../../error/FigletException"
import { FigletFileError } from "../../error/FigletException"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export const FontFileReaderId = Symbol()
export type FontFileReaderId = typeof FontFileReaderId

export function makeFontFileReader() {
  return service({
    read: (
      path: string,
      f: (
        path: string,
        buffer: S.IO<FigletException, Byte>
      ) => T.IO<NonEmptyArray<FigletException>, FigFont>
    ) => {
      const buffer = S.mapError_(
        NS.streamFromReadable(() => NodeJSFileSystem.createReadStream(path)),
        (e) => new FigletFileError({ message: e.error.message })
      )
      return f(path, buffer)
    }
  })
}

export interface FontFileReader extends ReturnType<typeof makeFontFileReader> {}

export type HasFontFileReader = Has<FontFileReader>

export const FontFileReader: Tag<FontFileReader> = tag<FontFileReader>(FontFileReaderId)

export const LiveFontFileReader: L.Layer<unknown, never, HasFontFileReader> =
  L.fromFunction(FontFileReader)(makeFontFileReader)

export const { read } = T.deriveLifted(FontFileReader)(["read"], [], [])
