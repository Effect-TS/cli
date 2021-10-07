import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as T from "@effect-ts/core/Effect"
import { pipe } from "@effect-ts/core/Function"
import * as TE from "@effect-ts/jest/Test"

import { LiveFigletClient } from "../../src/figlet/client/FigletClient"
import { LiveFontFileReader } from "../../src/figlet/client/FontFileReader"
import * as OptionsBuilder from "../../src/figlet/client/OptionsBuilder"
import * as Figure from "../../src/figlet/core/Figure"
import * as SubLines from "../../src/figlet/core/SubElements/SubLines"
import {
  standardBuilder,
  standardInput,
  standardLines
} from "./fixtures/StandardTestData"

describe("Rendering", () => {
  const { it } = TE.runtime((_) =>
    _[">+>"](LiveFontFileReader[">>>"](LiveFigletClient))
  )

  it("should print the same data as it renders", () =>
    T.gen(function* (_) {
      const builder = pipe(standardBuilder, OptionsBuilder.text(standardInput))
      const options = yield* _(OptionsBuilder.options(builder))
      const figure = new Figure.Figure({
        font: options.font,
        columns: C.single(SubLines.toSubcolumns(standardLines)),
        value: standardInput
      })
      const computed = yield* _(OptionsBuilder.print(builder))

      console.log(computed)
      console.log(Figure.showFigure.show(figure))

      expect(Figure.showFigure.show(figure)).toBe(computed)
    }))
})
