import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"

import * as HorizontalLayout from "../../../src/figlet/core/FigFontParameters/HorizontalLayout"
import * as HorizontalSmushingRule from "../../../src/figlet/core/FigFontParameters/HorizontalSmushingRule"
import * as FullLayout from "../../../src/figlet/core/FigHeaderParameters/FullLayout"
import * as OldLayout from "../../../src/figlet/core/FigHeaderParameters/OldLayout"
import { TestHeader } from "../fixtures/TestHeader"
import * as TestUtils from "../test-utils"

const header = TestHeader.default

describe("HorizontalLayout", () => {
  describe("fromOldLayout", () => {
    it.concurrent.each([
      {
        headerValue: new OldLayout.FullWidth(),
        fontValue: new HorizontalLayout.FullWidth()
      },
      {
        headerValue: new OldLayout.HorizontalFitting(),
        fontValue: new HorizontalLayout.HorizontalFitting()
      },
      {
        headerValue: new OldLayout.EqualCharacterSmushing(),
        fontValue: new HorizontalLayout.ControlledSmushing({
          rules: C.single(new HorizontalSmushingRule.EqualCharacter())
        })
      },
      {
        headerValue: new OldLayout.UnderscoreSmushing(),
        fontValue: new HorizontalLayout.ControlledSmushing({
          rules: C.single(new HorizontalSmushingRule.Underscore())
        })
      },
      {
        headerValue: new OldLayout.HierarchySmushing(),
        fontValue: new HorizontalLayout.ControlledSmushing({
          rules: C.single(new HorizontalSmushingRule.Hierarchy())
        })
      },
      {
        headerValue: new OldLayout.OppositePairSmushing(),
        fontValue: new HorizontalLayout.ControlledSmushing({
          rules: C.single(new HorizontalSmushingRule.OppositePair())
        })
      },
      {
        headerValue: new OldLayout.BigXSmushing(),
        fontValue: new HorizontalLayout.ControlledSmushing({
          rules: C.single(new HorizontalSmushingRule.BigX())
        })
      },
      {
        headerValue: new OldLayout.HardblankSmushing(),
        fontValue: new HorizontalLayout.ControlledSmushing({
          rules: C.single(new HorizontalSmushingRule.Hardblank())
        })
      }
    ])(
      "should return the correct values when oldLayout is $headerValue._tag",
      ({ fontValue, headerValue }) => {
        const computed = pipe(
          header.toFigHeader(),
          E.map((_) => _.copy({ oldLayout: C.single(headerValue) })),
          E.chain(HorizontalLayout.fromOldLayout)
        )

        expect(computed).equals(E.right(fontValue))
      }
    )

    it("should return multiple smushing rules in the output", () => {
      const oldLayout = C.from([
        new OldLayout.EqualCharacterSmushing(),
        new OldLayout.UnderscoreSmushing()
      ])
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.copy({ oldLayout })),
        E.chain(HorizontalLayout.fromOldLayout)
      )

      expect(computed).equals(
        E.right(
          new HorizontalLayout.ControlledSmushing({
            rules: C.from([
              new HorizontalSmushingRule.EqualCharacter(),
              new HorizontalSmushingRule.Underscore()
            ])
          })
        )
      )
    })

    it("should fail when given FullWidth with a smushing rule", () => {
      const oldLayout = C.from([
        new OldLayout.FullWidth(),
        new OldLayout.UnderscoreSmushing()
      ])
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.copy({ oldLayout })),
        E.chain(HorizontalLayout.fromOldLayout),
        TestUtils.stringifyError
      )

      expect(computed).toEqual(
        E.left([
          `FigFontError - Could not convert layout settings found in header to a HorizontalLayout, received "-1, 2"`
        ])
      )
    })

    it("should fail when given HorizontalFitting with a smushing rule", () => {
      const oldLayout = C.from([
        new OldLayout.HorizontalFitting(),
        new OldLayout.UnderscoreSmushing()
      ])
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.copy({ oldLayout })),
        E.chain(HorizontalLayout.fromOldLayout),
        TestUtils.stringifyError
      )

      expect(computed).toEqual(
        E.left([
          `FigFontError - Could not convert layout settings found in header to a HorizontalLayout, received "0, 2"`
        ])
      )
    })
  })

  describe("fromFullLayout", () => {
    it.concurrent.each([
      {
        input: "not present",
        headerValue: O.emptyOf<Chunk<FullLayout.FullLayout>>(),
        fontValue: O.emptyOf<HorizontalLayout.HorizontalLayout>()
      },
      {
        input: "empty",
        headerValue: O.some(C.empty<FullLayout.FullLayout>()),
        fontValue: O.some(new HorizontalLayout.FullWidth())
      },
      {
        input: "HorizontalFitting",
        headerValue: O.some(C.single(new FullLayout.HorizontalFitting())),
        fontValue: O.some(new HorizontalLayout.HorizontalFitting())
      },
      {
        input: "HorizontalSmushing",
        headerValue: O.some(C.single(new FullLayout.HorizontalSmushing())),
        fontValue: O.some(new HorizontalLayout.UniversalSmushing())
      },
      {
        input: "HorizontalSmushing with EqualCharacterHorizontalSmushing",
        headerValue: O.some(
          C.from([
            new FullLayout.HorizontalSmushing(),
            new FullLayout.EqualCharacterHorizontalSmushing()
          ])
        ),
        fontValue: O.some(
          new HorizontalLayout.ControlledSmushing({
            rules: C.single(new HorizontalSmushingRule.EqualCharacter())
          })
        )
      },
      {
        input: "HorizontalSmushing with UnderscoreHorizontalSmushing",
        headerValue: O.some(
          C.from([
            new FullLayout.HorizontalSmushing(),
            new FullLayout.UnderscoreHorizontalSmushing()
          ])
        ),
        fontValue: O.some(
          new HorizontalLayout.ControlledSmushing({
            rules: C.single(new HorizontalSmushingRule.Underscore())
          })
        )
      },
      {
        input: "HorizontalSmushing with HierarchyHorizontalSmushing",
        headerValue: O.some(
          C.from([
            new FullLayout.HorizontalSmushing(),
            new FullLayout.HierarchyHorizontalSmushing()
          ])
        ),
        fontValue: O.some(
          new HorizontalLayout.ControlledSmushing({
            rules: C.single(new HorizontalSmushingRule.Hierarchy())
          })
        )
      },
      {
        input: "HorizontalSmushing with OppositePairHorizontalSmushing",
        headerValue: O.some(
          C.from([
            new FullLayout.HorizontalSmushing(),
            new FullLayout.OppositePairHorizontalSmushing()
          ])
        ),
        fontValue: O.some(
          new HorizontalLayout.ControlledSmushing({
            rules: C.single(new HorizontalSmushingRule.OppositePair())
          })
        )
      },
      {
        input: "HorizontalSmushing with BigXHorizontalSmushing",
        headerValue: O.some(
          C.from([
            new FullLayout.HorizontalSmushing(),
            new FullLayout.BigXHorizontalSmushing()
          ])
        ),
        fontValue: O.some(
          new HorizontalLayout.ControlledSmushing({
            rules: C.single(new HorizontalSmushingRule.BigX())
          })
        )
      },
      {
        input: "HorizontalSmushing with HardblankHorizontalSmushing",
        headerValue: O.some(
          C.from([
            new FullLayout.HorizontalSmushing(),
            new FullLayout.HardblankHorizontalSmushing()
          ])
        ),
        fontValue: O.some(
          new HorizontalLayout.ControlledSmushing({
            rules: C.single(new HorizontalSmushingRule.Hardblank())
          })
        )
      }
    ])(
      "should return the correct values when fullLayout is $input",
      ({ fontValue, headerValue }) => {
        const computed = pipe(
          header.toFigHeader(),
          E.map((_) => _.copy({ fullLayout: headerValue })),
          E.chain(HorizontalLayout.fromFullLayout)
        )

        expect(computed).equals(E.right(fontValue))
      }
    )

    it("should return multiple smushing rules in the output", () => {
      const input = C.from([
        new FullLayout.HorizontalSmushing(),
        new FullLayout.EqualCharacterHorizontalSmushing(),
        new FullLayout.BigXHorizontalSmushing()
      ])
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.copy({ fullLayout: O.some(input) })),
        E.chain(HorizontalLayout.fromFullLayout)
      )

      expect(computed).equals(
        E.right(
          O.some(
            new HorizontalLayout.ControlledSmushing({
              rules: C.from([
                new HorizontalSmushingRule.EqualCharacter(),
                new HorizontalSmushingRule.BigX()
              ])
            })
          )
        )
      )
    })
  })

  describe("fromHeader", () => {
    it("should use values from fullLayout when present", () => {
      const oldLayout = C.single(new OldLayout.FullWidth())
      const fullLayout = O.some(C.single(new FullLayout.HorizontalFitting()))
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.copy({ oldLayout, fullLayout })),
        E.chain(HorizontalLayout.fromHeader)
      )

      expect(computed).equals(E.right(new HorizontalLayout.HorizontalFitting()))
    })

    it("should use values from oldLayout when fullLayout is not present", () => {
      const oldLayout = C.single(new OldLayout.FullWidth())
      const fullLayout = O.emptyOf<Chunk<FullLayout.FullLayout>>()
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.copy({ oldLayout, fullLayout })),
        E.chain(HorizontalLayout.fromHeader)
      )

      expect(computed).equals(E.right(new HorizontalLayout.FullWidth()))
    })
  })
})
