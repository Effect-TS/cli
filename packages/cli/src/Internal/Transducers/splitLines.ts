// ets_tracing: off

import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as Tuple from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import * as M from "@effect-ts/core/Effect/Managed"
import * as Ref from "@effect-ts/core/Effect/Ref"
import { Transducer } from "@effect-ts/core/Effect/Stream/Transducer"
import * as O from "@effect-ts/core/Option"

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
