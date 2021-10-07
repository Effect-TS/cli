import * as Associative from "@effect-ts/core/Associative"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as E from "@effect-ts/core/Either"
import { flow, identity, pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"

import * as OldLayout from "../../../src/figlet/core/FigHeaderParameters/OldLayout"
import * as FigletErrors from "../../../src/figlet/error/FigletException"
import * as TestUtils from "../test-utils"

const goodValues: NonEmptyArray<number> = [-1, 0, 1, 2, 4, 8, 16, 32]

const badValues: NonEmptyArray<number> = [-3, -2, 128, 192]

const allValues: number = O.fold_(
  NA.filter_(goodValues, (n) => n > 0),
  () => 0,
  NA.foldMap(Associative.sum)(identity)
)

describe("OldLayout", () => {
  it("should create a valid OldLayout", () => {
    const computed = pipe(
      NA.map_(goodValues, OldLayout.fromValue),
      NA.sequence(FigletErrors.Applicative),
      E.map(NA.chain((a) => C.toArray(a) as NonEmptyArray<OldLayout.OldLayout>))
    )

    expect(computed).toEqual(E.right(C.toArray(OldLayout.values)))
  })

  it("should return an error when providing at least one wrong value", () => {
    const computed = pipe(
      NA.map_(badValues, OldLayout.fromValue),
      NA.sequence(FigletErrors.Applicative),
      TestUtils.stringifyError
    )

    expect(computed).toEqual(
      E.left([
        'FigHeaderError - OldLayout needs a value between 1 and 63, inclusive, received "-3"',
        'FigHeaderError - OldLayout needs a value between 1 and 63, inclusive, received "-2"',
        'FigHeaderError - OldLayout needs a value between 1 and 63, inclusive, received "128"',
        'FigHeaderError - OldLayout needs a value between 1 and 63, inclusive, received "192"'
      ])
    )
  })

  it("should have its primitive values in the Figlet font header range", () => {
    const computed = C.map_(OldLayout.values, (_) => _.value)

    expect(C.toArray(computed)).toEqual(goodValues)
  })

  it("should factor out binary digits and create multiple valid OldLayouts", () => {
    const computed = pipe(OldLayout.fromValue(3), E.map(C.toArray))

    expect(computed).toEqual(
      E.right([
        new OldLayout.EqualCharacterSmushing(),
        new OldLayout.UnderscoreSmushing()
      ])
    )
  })

  it("should return all values (with FullWidth and HorizontalFitting being separate values)", () => {
    const computed = pipe(
      E.tuple(
        OldLayout.fromValue(-1),
        OldLayout.fromValue(0),
        OldLayout.fromValue(allValues)
      ),
      E.map(flow(C.from, C.flatten, C.toArray))
    )

    expect(computed).toEqual(E.right(C.toArray(OldLayout.values)))
  })
})
