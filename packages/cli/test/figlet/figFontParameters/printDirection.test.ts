import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as E from "@effect-ts/core/Either"
import * as O from "@effect-ts/core/Option"

import * as PrintDirection from "../../../src/figlet/core/FigFontParameters/PrintDirection"
import * as FigletErrors from "../../../src/figlet/error/FigletException"
import { TestHeader } from "../fixtures/TestHeader"
import * as TestUtils from "../test-utils"

const goodValues: NonEmptyArray<number> = [0, 1]

const badValues: NonEmptyArray<number> = [-2, -1, 2, 3]

const header = TestHeader.default

describe("PrintDirection", () => {
  it("should create a valid PrintDirection from a value", () => {
    const computed = NA.sequence(FigletErrors.Applicative)(
      NA.map_(goodValues, PrintDirection.fromValue)
    )

    expect(computed).toEqual(E.right(C.toArray(PrintDirection.values)))
  })

  it.each([
    Tp.tuple(
      O.some(new PrintDirection.LeftToRight()),
      new PrintDirection.LeftToRight()
    ),
    Tp.tuple(
      O.some(new PrintDirection.RightToLeft()),
      new PrintDirection.RightToLeft()
    ),
    Tp.tuple(
      O.emptyOf<PrintDirection.PrintDirection>(),
      new PrintDirection.LeftToRight()
    )
  ])(
    "should create a valid PrintDirection from a FigHeader",
    ({ tuple: [headerValue, fontValue] }) => {
      const newHeader = E.map_(header.toFigHeader(), (_) =>
        _.copy({
          printDirection: headerValue
        })
      )
      const computed = TestUtils.stringifyError(
        E.chain_(newHeader, PrintDirection.fromHeader)
      )

      expect(computed).toEqual(E.right(fontValue))
    }
  )

  it("should return an error when provided an invalid value", () => {
    const computed = NA.sequence(FigletErrors.Applicative)(
      NA.map_(badValues, PrintDirection.fromValue)
    )

    function toFigHeaderError(value: number): FigletErrors.FigletException {
      return new FigletErrors.FigHeaderError({
        message: `Could not parse value "${value}" to a PrintDirection`
      })
    }

    expect(computed).toEqual(E.left(NA.map_(badValues, toFigHeaderError)))
  })

  it("should have its primitive values in the Figlet font header range", () => {
    const values = [
      new PrintDirection.LeftToRight().value,
      new PrintDirection.RightToLeft().value
    ]

    expect(values).toEqual(goodValues)
  })
})
