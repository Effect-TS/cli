import * as Tuple from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import * as TE from "@effect-ts/jest/Test"

import * as Reducable from "../src/Reducable/index.js"

describe("Reducable", () => {
  const { it } = TE.runtime()

  it("should reduce left side units", () =>
    T.succeedWith(() => {
      expect(Reducable.fromTuple(Tuple.tuple(undefined, 1))).toBe(1)
    }))

  it("should reduce right side units", () =>
    T.succeedWith(() => {
      expect(Reducable.fromTuple(Tuple.tuple(1, undefined))).toBe(1)
    }))

  it("should reduce tupled units", () =>
    T.succeedWith(() => {
      expect(Reducable.fromTuple(Tuple.tuple(undefined, undefined))).toBeUndefined()
    }))

  it("should leave non-unit tuples intact", () =>
    T.succeedWith(() => {
      expect(Reducable.fromTuple(Tuple.tuple(1, "Howdy"))).equals(
        Tuple.tuple(1, "Howdy")
      )
    }))
})
