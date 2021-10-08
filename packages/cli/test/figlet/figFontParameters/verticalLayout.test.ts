import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"

import * as VerticalLayout from "../../../src/figlet/core/FigFontParameters/VerticalLayout"
import * as VerticalSmushingRule from "../../../src/figlet/core/FigFontParameters/VerticalSmushingRule"
import * as FullLayout from "../../../src/figlet/core/FigHeaderParameters/FullLayout"
import { TestHeader } from "../fixtures/TestHeader"

const header = TestHeader.default

describe("VerticalLayout", () => {
  describe("fromHeader", () => {
    it.concurrent.each([
      {
        input: "not present",
        headerValue: O.emptyOf<Chunk<FullLayout.FullLayout>>(),
        fontValue: new VerticalLayout.FullHeight()
      },
      {
        input: "an empty list",
        headerValue: O.some(C.empty<FullLayout.FullLayout>()),
        fontValue: new VerticalLayout.FullHeight()
      },
      {
        input: "VerticalFitting",
        headerValue: O.some(C.single(new FullLayout.VerticalFitting())),
        fontValue: new VerticalLayout.VerticalFitting()
      },
      {
        input: "VerticalSmushing",
        headerValue: O.some(C.single(new FullLayout.VerticalSmushing())),
        fontValue: new VerticalLayout.UniversalSmushing()
      },
      {
        input: "VerticalSmushing with EqualCharacterVerticalSmushing",
        headerValue: O.some(
          C.from([
            new FullLayout.VerticalSmushing(),
            new FullLayout.EqualCharacterVerticalSmushing()
          ])
        ),
        fontValue: new VerticalLayout.ControlledSmushing({
          rules: C.single(new VerticalSmushingRule.EqualCharacter())
        })
      },
      {
        input: "VerticalSmushing with UnderscoreVerticalSmushing",
        headerValue: O.some(
          C.from([
            new FullLayout.VerticalSmushing(),
            new FullLayout.UnderscoreVerticalSmushing()
          ])
        ),
        fontValue: new VerticalLayout.ControlledSmushing({
          rules: C.single(new VerticalSmushingRule.Underscore())
        })
      },
      {
        input: "VerticalSmushing with HierarchyVerticalSmushing",
        headerValue: O.some(
          C.from([
            new FullLayout.VerticalSmushing(),
            new FullLayout.HierarchyVerticalSmushing()
          ])
        ),
        fontValue: new VerticalLayout.ControlledSmushing({
          rules: C.single(new VerticalSmushingRule.Hierarchy())
        })
      },
      {
        input: "VerticalSmushing with HorizontalLineVerticalSmushing",
        headerValue: O.some(
          C.from([
            new FullLayout.VerticalSmushing(),
            new FullLayout.HorizontalLineVerticalSmushing()
          ])
        ),
        fontValue: new VerticalLayout.ControlledSmushing({
          rules: C.single(new VerticalSmushingRule.HorizontalLine())
        })
      },
      {
        input: "VerticalSmushing with VerticalLineSupersmushing",
        headerValue: O.some(
          C.from([
            new FullLayout.VerticalSmushing(),
            new FullLayout.VerticalLineSupersmushing()
          ])
        ),
        fontValue: new VerticalLayout.ControlledSmushing({
          rules: C.single(new VerticalSmushingRule.VerticalLineSupersmushing())
        })
      }
    ])(
      "should return the correct values when fullLayout is $input",
      ({ fontValue, headerValue }) => {
        const computed = pipe(
          header.toFigHeader(),
          E.map((_) => _.copy({ fullLayout: headerValue })),
          E.chain(VerticalLayout.fromHeader)
        )

        expect(computed).equals(E.right(fontValue))
      }
    )

    it("should return multiple smushing rules in the output", () => {
      const input = C.from([
        new FullLayout.VerticalSmushing(),
        new FullLayout.UnderscoreVerticalSmushing(),
        new FullLayout.HierarchyVerticalSmushing()
      ])
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.copy({ fullLayout: O.some(input) })),
        E.chain(VerticalLayout.fromHeader)
      )

      expect(computed).equals(
        E.right(
          new VerticalLayout.ControlledSmushing({
            rules: C.from([
              new VerticalSmushingRule.Underscore(),
              new VerticalSmushingRule.Hierarchy()
            ])
          })
        )
      )
    })
  })
})
