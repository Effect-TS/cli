// ets_tracing: off

import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import * as S from "@effect-ts/core/Effect/Stream"
import { tag } from "@effect-ts/core/Has"
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

export const FontFileReaderSymbol = Symbol()
export type FontFileReaderSymbol = typeof FontFileReaderSymbol

export interface FontFileReader {
  readonly [FontFileReaderSymbol]: FontFileReaderSymbol
  readonly read: <A>(
    path: string,
    f: (
      path: string,
      buffer: S.IO<FigletException, Byte>
    ) => T.IO<NonEmptyArray<FigletException>, FigFont>
  ) => T.IO<NonEmptyArray<FigletException>, FigFont>
}

export const makeFontFileReader: FontFileReader = {
  [FontFileReaderSymbol]: FontFileReaderSymbol,
  read: (path, f) => {
    const buffer = S.mapError_(
      NS.streamFromReadable(() => NodeJSFileSystem.createReadStream(path)),
      (e) => new FigletFileError({ message: e.error.message })
    )
    return f(path, buffer)
  }
}

export const FontFileReader = tag<FontFileReader>()
export const LiveFontFileReader = L.pure(FontFileReader)(makeFontFileReader)

export const { read } = makeFontFileReader
