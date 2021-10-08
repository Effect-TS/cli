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
import { pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"

/**
 * Splits strings on a delimiter.
 */
export function splitOn(delimiter: string): Transducer<unknown, never, string, string> {
  const chars = Transduce.mapChunks_(
    Transduce.fromFunction<string, Chunk<string>>((s) => C.from(s.split(""))),
    C.flatten
  )
  const split = Transduce.map_(splitOnChunk(C.from(delimiter.split(""))), C.join(""))
  return pipe(chars, Transduce.then(split))
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
