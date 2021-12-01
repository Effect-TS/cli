#!/usr/bin/env node

import * as Associative from "@effect-ts/core/Associative"
import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import * as S from "@effect-ts/core/Effect/Stream"
import * as Sink from "@effect-ts/core/Effect/Stream/Sink"
import * as Transducer from "@effect-ts/core/Effect/Stream/Transducer"
import { flow, pipe } from "@effect-ts/core/Function"
import * as Identity from "@effect-ts/core/Identity"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import * as Show from "@effect-ts/core/Show"
import * as String from "@effect-ts/core/String"
import type { Byte } from "@effect-ts/node/Byte"
import * as R from "@effect-ts/node/Runtime"
import * as NS from "@effect-ts/node/Stream"
import * as FileSystem from "fs"
import * as Path from "path"

import * as Args from "../../src/Args"
import * as CliApp from "../../src/CliApp"
import * as Command from "../../src/Command"
import * as Exists from "../../src/Exists"
import * as Help from "../../src/Help"
import { putStrLn } from "../../src/Internal/Console"
import { splitLines, utf8Decode } from "../../src/Internal/Transducers"
import type { Options } from "../../src/Options"
import * as Opts from "../../src/Options"
import * as Transducers from "../shared/transducers"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export interface WcOptions {
  readonly bytes: boolean
  readonly lines: boolean
  readonly words: boolean
  readonly chars: boolean
}

export interface WcResult {
  readonly fileName: string
  readonly countBytes: Option<number>
  readonly countLines: Option<number>
  readonly countWords: Option<number>
  readonly countChars: Option<number>
}

export function wcOptions(
  bytes: boolean,
  lines: boolean,
  words: boolean,
  chars: boolean
): WcOptions {
  return {
    bytes,
    lines,
    words,
    chars
  }
}

export function wcResult(
  fileName: string,
  bytes: Option<number>,
  lines: Option<number>,
  words: Option<number>,
  chars: Option<number>
): WcResult {
  return {
    fileName,
    countBytes: bytes,
    countLines: lines,
    countWords: words,
    countChars: chars
  }
}

export const IdentityWcResult = Identity.struct<WcResult>({
  fileName: Identity.fromAssociative(Associative.last<string>())("total"),
  countBytes: O.getIdentity(Identity.sum),
  countLines: O.getIdentity(Identity.sum),
  countWords: O.getIdentity(Identity.sum),
  countChars: O.getIdentity(Identity.sum)
})

export const ShowWcResult = Show.struct<WcResult>({
  fileName: Show.string,
  countBytes: O.getShow(Show.number),
  countLines: O.getShow(Show.number),
  countWords: O.getShow(Show.number),
  countChars: O.getShow(Show.number)
})

// -----------------------------------------------------------------------------
// Options
// -----------------------------------------------------------------------------

const bytesFlag: Options<boolean> = Opts.boolean("c")
const linesFlag: Options<boolean> = Opts.boolean("l")
const wordsFlag: Options<boolean> = Opts.boolean("w")
const charFlag: Options<boolean> = Opts.boolean("m", false)

export const options = Opts.struct({
  bytes: bytesFlag,
  lines: linesFlag,
  words: wordsFlag,
  chars: charFlag
})

// -----------------------------------------------------------------------------
// Args
// -----------------------------------------------------------------------------

const args = Args.repeat1(Args.namedFile("files", Exists.yes))

// -----------------------------------------------------------------------------
// Commands
// -----------------------------------------------------------------------------

const wc = Command.command("wc", options, args)

// -----------------------------------------------------------------------------
// Command-Line Application
// -----------------------------------------------------------------------------

const wcApp = CliApp.make({
  name: "Effect-TS Word Count",
  version: "0.1.2",
  summary: Help.text("counts the words in a file"),
  command: wc
})

function handleOption(
  bool: boolean,
  sink: Sink.Sink<unknown, never, Byte, Byte, number>
): Sink.Sink<unknown, never, Byte, Byte, Option<number>> {
  return bool ? Sink.map_(sink, O.some) : Sink.succeed(O.none)
}

function execute(options: WcOptions, paths: NonEmptyArray<string>) {
  return pipe(
    putStrLn(`executing wc with args: ${JSON.stringify(options)} ${paths}`),
    T.zipRight(
      pipe(
        T.forEachParN_(paths, 4, (path) => {
          const byteCount = handleOption(options.bytes, Sink.count)
          const lineCount = handleOption(
            options.lines,
            pipe(
              utf8Decode,
              Transducer.then(splitLines),
              Transducers.composeSink(Sink.count)
            )
          )
          const wordCount = handleOption(
            options.words,
            pipe(
              utf8Decode,
              Transducer.mapChunks(Chunk.chain(flow(String.split(/\\s+/), Chunk.from))),
              Transducers.composeSink(Sink.count)
            )
          )
          const charCount = handleOption(
            options.chars,
            pipe(
              utf8Decode,
              Transducers.composeSink(Sink.reduceLeft(0)((s, e) => s + e.length))
            )
          )
          const zippedSinks = pipe(
            Sink.zipPar_(
              byteCount,
              Sink.zipPar_(lineCount, Sink.zipPar_(wordCount, charCount))
            ),
            Sink.map((t) =>
              Tp.tuple(
                t.get(0),
                t.get(1).get(0),
                t.get(1).get(1).get(0),
                t.get(1).get(1).get(1)
              )
            )
          )
          return pipe(
            NS.streamFromReadable(() =>
              FileSystem.createReadStream(Path.resolve(path))
            ),
            S.run(zippedSinks),
            T.map((t) =>
              wcResult(Path.basename(path), t.get(0), t.get(1), t.get(2), t.get(3))
            )
          )
        }),
        T.orDie,
        T.chain((res) =>
          T.succeedWith(() => {
            console.log(
              ShowWcResult.show(Identity.fold(IdentityWcResult)(Chunk.toArray(res)))
            )
          })
        )
      )
    )
  )
}

pipe(
  wcApp,
  CliApp.run(process.argv.slice(2), ({ tuple: [options, paths] }) =>
    execute(options, paths)
  ),
  R.runMain
)
