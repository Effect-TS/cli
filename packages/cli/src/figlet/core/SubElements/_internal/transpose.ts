// ets_tracing: off

import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"

/**
 * Switches rows and columns of a two dimensional array.
 */
export function transpose<A>(
  xy: ReadonlyArray<ReadonlyArray<A>>
): ReadonlyArray<NonEmptyArray<A>> {
  const maxX = xy.length
  const maxY = Math.max(...xy.map((y) => y.length))
  const yx: Array<Array<A>> = []
  let yi = 0
  for (; yi < maxY; yi++) {
    let xi = 0
    const x: Array<A> = []
    for (; xi < maxX; xi++) {
      const y = xy[xi]
      if (yi < y.length) {
        x.push(y[yi])
      }
    }
    yx.push(x)
  }
  return yx as unknown as ReadonlyArray<NonEmptyArray<A>>
}
