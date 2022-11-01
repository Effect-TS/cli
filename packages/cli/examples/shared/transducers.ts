import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as Tuple from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import * as M from "@effect-ts/core/Effect/Managed"
import * as Ref from "@effect-ts/core/Effect/Ref"
import * as Sink from "@effect-ts/core/Effect/Stream/Sink"
import * as Transduce from "@effect-ts/core/Effect/Stream/Transducer"
import { Transducer } from "@effect-ts/core/Effect/Stream/Transducer"
import * as E from "@effect-ts/core/Either"
import * as Equal from "@effect-ts/core/Equal"
import { pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import type { Byte } from "@effect-ts/node/Byte"

function isTwoByteSequenceStart(b: Byte): boolean {
  return (b & 0xe0) === 0xc0
}

function isThreeByteSequenceStart(b: Byte): boolean {
  return (b & 0xf0) === 0xe0
}

function isFourByteSequenceStart(b: Byte): boolean {
  return (b & 0xf8) === 0xf0
}

function computeSplit(chunk: Chunk<Byte>): number {
  const length = chunk.length
  if (
    length >= 1 &&
    (isTwoByteSequenceStart(C.unsafeGet_(chunk, length - 1)) ||
      isThreeByteSequenceStart(C.unsafeGet_(chunk, length - 1)) ||
      isFourByteSequenceStart(C.unsafeGet_(chunk, length - 1)))
  ) {
    return length - 1
  } else if (
    length >= 2 &&
    (isThreeByteSequenceStart(C.unsafeGet_(chunk, length - 2)) ||
      isFourByteSequenceStart(C.unsafeGet_(chunk, length - 2)))
  ) {
    return length - 2
  } else if (length >= 3 && isFourByteSequenceStart(C.unsafeGet_(chunk, length - 3))) {
    return length - 3
  } else {
    return length
  }
}

const utf8DecodeInternal: Transducer<unknown, never, Byte, string> = new Transducer(
  M.map_(Ref.makeManagedRef(C.empty<Byte>()), (stateRef) =>
    O.fold(
      () =>
        T.chain_(Ref.getAndSet_(stateRef, C.empty<Byte>()), (leftovers) => {
          if (C.isEmpty(leftovers)) {
            return T.succeed(C.empty<string>())
          } else {
            return T.succeed(C.single(String.fromCharCode(...C.toArray(leftovers))))
          }
        }),
      (bytes: Chunk<Byte>) =>
        Ref.modify_(stateRef, (leftovers) => {
          const concat = C.concat_(leftovers, bytes)
          const tuple = C.splitAt_(concat, computeSplit(concat))
          const toConvert = Tuple.get_(tuple, 0)
          const newLeftovers = Tuple.get_(tuple, 1)

          if (C.isEmpty(toConvert)) {
            return Tuple.tuple(C.empty<string>(), C.materialize(newLeftovers))
          } else {
            return Tuple.tuple(
              C.single(String.fromCharCode(...C.toArray(toConvert))),
              C.materialize(newLeftovers)
            )
          }
        })
    )
  )
)

/**
 * Decodes chunks of UTF-8 `Byte`s into strings.
 */
export const utf8Decode: Transducer<unknown, never, Byte, string> =
  // Handle optional byte order mark
  Transduce.branchAfter(3, (bytes) =>
    C.corresponds_(bytes, C.from([-17, -69, -65]), Equal.number.equals)
      ? utf8DecodeInternal
      : pipe(Transduce.prepend(bytes), Transduce.andThen(utf8DecodeInternal))
  )

/**
 * Splits strings on a delimiter.
 */
export function splitOn(delimiter: string): Transducer<unknown, never, string, string> {
  const chars = Transduce.mapChunks_(
    Transduce.fromFunction<string, Chunk<string>>((s) => C.from(s.split(""))),
    C.flatten
  )
  const split = Transduce.map_(splitOnChunk(C.from(delimiter.split(""))), C.join(""))
  return pipe(chars, Transduce.andThen(split))
}
/**
 * Splits elements on a delimiter and transforms the splits into desired output.
 */
export function splitOnChunk<A>(
  delimiter: Chunk<A>
): Transducer<unknown, never, A, Chunk<A>> {
  return new Transducer(
    M.map_(Ref.makeManagedRef(Tuple.tuple(O.emptyOf<Chunk<A>>(), 0)), (stateRef) =>
      O.fold(
        () =>
          Ref.modify_(stateRef, (state) =>
            O.fold_(
              state.get(0),
              () => Tuple.tuple(C.empty<Chunk<A>>(), state),
              (chunk) => Tuple.tuple(C.single(chunk), Tuple.tuple(O.emptyOf(), 0))
            )
          ),
        (inputChunk) =>
          Ref.modify_(stateRef, (state) => {
            let out: Array<Chunk<A>> | null = null
            let chunkIndex = 0
            let buffer = O.getOrElse_(state.get(0), () => C.empty<A>())
            let delimIndex = state.get(1)

            while (chunkIndex < inputChunk.length) {
              const input: Chunk<A> = C.append_(
                buffer,
                C.unsafeGet_(inputChunk, chunkIndex)
              )
              let index = buffer.length
              let start = 0
              buffer = C.empty()

              while (index < input.length) {
                while (
                  delimIndex < delimiter.length &&
                  index < input.length &&
                  C.unsafeGet_(input, index) === C.unsafeGet_(delimiter, delimIndex)
                ) {
                  delimIndex += 1
                  index += 1
                }
                if (delimIndex === delimiter.length || C.isEmpty(input)) {
                  if (!out) {
                    out = new Array<Chunk<A>>()
                  }
                  const slice = C.from(
                    C.toArray(input).slice(start, index - delimiter.length)
                  )
                  out.push(slice)
                  delimIndex = 0
                  start = index
                }
                if (index < input.length) {
                  delimIndex = 0
                  while (
                    index < input.length &&
                    C.unsafeGet_(input, index) !== C.unsafeGet_(delimiter, 0)
                  ) {
                    index += 1
                  }
                }
              }

              if (start < input.length) {
                buffer = C.drop_(input, start)
              }

              chunkIndex += 1
            }

            const chunk = out ? C.from(out) : C.empty<Chunk<A>>()
            const buf = C.isEmpty(buffer) ? O.none : O.some(buffer)

            return Tuple.tuple(chunk, Tuple.tuple(buf, delimIndex))
          })
      )
    )
  )
}

/**
 * Splits strings on newlines. Handles both Windows newlines (`\r\n`) and UNIX
 * newlines (`\n`).
 */
export const splitLines: Transducer<unknown, never, string, string> = new Transducer(
  M.map_(Ref.makeManagedRef(Tuple.tuple(O.emptyOf<string>(), false)), (stateRef) =>
    O.fold(
      () =>
        T.chain_(
          Ref.getAndSet_(stateRef, Tuple.tuple(O.emptyOf<string>(), false)),
          (state) =>
            O.fold_(
              Tuple.get_(state, 0),
              () => T.succeed(C.empty<string>()),
              (str) => T.succeed(C.single(str))
            )
        ),
      (strings) =>
        Ref.modify_(stateRef, (state) => {
          const buffer = new Array<string>()
          let inCRLF = Tuple.get_(state, 1)
          let carry = O.getOrElse_(Tuple.get_(state, 0), () => "")

          C.toArray(strings).forEach((str) => {
            const concat = carry + str

            if (concat.length > 0) {
              let i =
                // If we had a split CRLF, start reading from the last character of
                // the leftover (which was the `\r`)
                inCRLF && carry.length > 0
                  ? carry.length - 1
                  : // Otherwise we just skip over the entire previous leftover as it
                    // does not contain a newline
                    carry.length
              let sliceStart = 0

              while (i < concat.length) {
                if (concat[i] == "\n") {
                  buffer.push(concat.substring(sliceStart, i))
                  i += 1
                  sliceStart = i
                } else if (
                  concat[i] == "\r" &&
                  i + 1 < concat.length &&
                  concat[i + 1] == "\n"
                ) {
                  buffer.push(concat.substring(sliceStart, i))
                  i += 2
                  sliceStart = i
                } else if (concat[i] == "\r" && i == concat.length - 1) {
                  inCRLF = true
                  i += 1
                } else {
                  i += 1
                }
              }

              carry = concat.substring(sliceStart, concat.length)
            }
          })

          return Tuple.tuple(
            C.from(buffer),
            Tuple.tuple(carry.length > 0 ? O.some(carry) : O.emptyOf<string>(), inCRLF)
          )
        })
    )
  )
)

export function composeSink<R1, E, E1, O, O1, I1, L, Z>(
  that: Sink.Sink<R1, E | E1, O1 | O, L, Z>
) {
  return <R, I>(
    self: Transducer<R, E, I, O>
  ): Sink.Sink<R & R1, E1 | E, I & I1, L, Z> => {
    return new Sink.Sink(
      M.zipWith_(self.push, that.push, (pushSelf, pushThat) =>
        O.fold(
          () =>
            T.chain_(
              T.mapError_(pushSelf(O.none), (e) => Tuple.tuple(E.left(e), C.empty())),
              (chunk) => T.zipRight_(pushThat(O.some(chunk)), pushThat(O.none))
            ),
          (inputs) =>
            T.chain_(
              T.mapError_(pushSelf(O.some(inputs)), (e) =>
                Tuple.tuple(E.left(e), C.empty())
              ),
              (chunk) => pushThat(O.some(chunk))
            )
        )
      )
    )
  }
}
