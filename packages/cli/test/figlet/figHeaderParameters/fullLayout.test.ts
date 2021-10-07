import * as Associative from "@effect-ts/core/Associative"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as E from "@effect-ts/core/Either"
import { identity, pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"

import * as FullLayout from "../../../src/figlet/core/FigHeaderParameters/FullLayout"
import * as FigletErrors from "../../../src/figlet/error/FigletException"
import * as TestUtils from "../test-utils"

const goodValues: NonEmptyArray<number> = [
  1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384
]

const badValues: NonEmptyArray<number> = [-2, -1, 32768, 32769]

export const allValues: number = O.fold_(
  NA.filter_(goodValues, (n) => n > 0),
  () => 0,
  NA.foldMap(Associative.sum)(identity)
)

describe("FullLayout", () => {
  it("should create a valid FullLayout", () => {
    const computed = pipe(
      NA.map_(goodValues, FullLayout.fromValue),
      NA.sequence(FigletErrors.Applicative),
      E.map(NA.chain((a) => C.toArray(a) as NonEmptyArray<FullLayout.FullLayout>))
    )

    expect(computed).toEqual(E.right(C.toArray(FullLayout.values)))
  })

  it("should return an error when providing at least one invalid value", () => {
    const computed = pipe(
      NA.map_(badValues, FullLayout.fromValue),
      NA.sequence(FigletErrors.Applicative),
      TestUtils.stringifyError
    )

    expect(computed).toEqual(
      E.left([
        'FigHeaderError - FullLayout needs a value between 0 and 32767, inclusive, but received "-2"',
        'FigHeaderError - FullLayout needs a value between 0 and 32767, inclusive, but received "-1"',
        'FigHeaderError - FullLayout needs a value between 0 and 32767, inclusive, but received "32768"',
        'FigHeaderError - FullLayout needs a value between 0 and 32767, inclusive, but received "32769"'
      ])
    )
  })

  it("should have its primitive values in the Figlet font header range", () => {
    const computed = C.map_(FullLayout.values, (_) => _.value)

    expect(C.toArray(computed)).toEqual(goodValues)
  })

  it("should return the list of all horizontal layouts", () => {
    expect(FullLayout.horizontalSmushingRules.length).toEqual(6)
  })

  it("should return the list of all vertical layouts", () => {
    expect(FullLayout.verticalSmushingRules.length).toEqual(5)
  })

  it("should factor out binary digits and create multiple valid FullLayouts", () => {
    const computed = pipe(FullLayout.fromValue(3), E.map(C.toArray))

    expect(computed).toEqual(
      E.right([
        new FullLayout.EqualCharacterHorizontalSmushing(),
        new FullLayout.UnderscoreHorizontalSmushing()
      ])
    )
  })

  it("should return all values", () => {
    const computed = pipe(FullLayout.fromValue(allValues), E.map(C.toArray))

    expect(computed).toEqual(E.right(C.toArray(FullLayout.values)))
  })

  it("should return an empty result for the input 0", () => {
    const computed = pipe(FullLayout.fromValue(0), E.map(C.toArray))

    expect(computed).toEqual(E.right([]))
  })
})
