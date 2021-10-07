import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"

import * as PrintDirection from "../../src/figlet/core/FigFontParameters/PrintDirection"
import * as FigHeader from "../../src/figlet/core/FigHeader"
import * as FullLayout from "../../src/figlet/core/FigHeaderParameters/FullLayout"
import * as OldLayout from "../../src/figlet/core/FigHeaderParameters/OldLayout"
import { TestHeader } from "./fixtures/TestHeader"
import * as TestUtils from "./test-utils"

const header = TestHeader.default

describe("FigHeader", () => {
  describe("Destructors", () => {
    it("toSingleLine", () => {
      const expected = header.toLine()
      const computed = pipe(FigHeader.fromLine(expected), E.map(FigHeader.toSingleLine))

      expect(E.right(expected)).toEqual(computed)
    })
  })

  describe("Signature Field Validation", () => {
    it("should return a valid Figlet font signature", () => {
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.signature)
      )

      expect(computed).toEqual(E.right(header.signature))
    })

    it("should fail with an invalid Figlet font signature", () => {
      const mistake = header.copy({ signature: "abcde" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([`FigHeaderError - Incorrect Figlet font signature, received "abcde"`])
      )
    })
  })

  describe("Hardblank Field Validation", () => {
    it("should return a valid hardblank", () => {
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.hardblank)
      )

      expect(computed).toEqual(E.right(header.hardblank))
    })

    it("should fail with an invalid hardblank", () => {
      const mistake = header.copy({ hardblank: "$$" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Header field "hardblank" must only be a single character, received "$$"`
        ])
      )
    })
  })

  describe("Height Field Validation", () => {
    it("should return a valid height", () => {
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.height)
      )

      expect(computed).toEqual(E.right(Number.parseInt(header.height)))
    })

    it("should fail with a non-numeric height", () => {
      const mistake = header.copy({ height: "abcd" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Unable to parse header field "height" to integer, received: "abcd"`
        ])
      )
    })

    it("should fail with a negative height", () => {
      const mistake = header.copy({ height: "-1" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Header field "height" must be positive, received: "-1"`
        ])
      )
    })
  })

  describe("Baseline Field Validation", () => {
    it("should return a valid baseline", () => {
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.baseline)
      )

      expect(computed).toEqual(E.right(Number.parseInt(header.baseline)))
    })

    it("should fail with a non-numeric baseline", () => {
      const mistake = header.copy({ baseline: "abcd" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Unable to parse header field "baseline" to integer, received: "abcd"`
        ])
      )
    })

    it("should fail with a negative baseline", () => {
      const mistake = header.copy({ baseline: "-1" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Header field "baseline" must be positive, received: "-1"`
        ])
      )
    })
  })

  describe("MaxLength Field Validation", () => {
    it("should return a valid maxLength", () => {
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.maxLength)
      )

      expect(computed).toEqual(E.right(Number.parseInt(header.maxLength)))
    })

    it("should fail with a non-numeric maxLength", () => {
      const mistake = header.copy({ maxLength: "abcd" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Unable to parse header field "maxLength" to integer, received: "abcd"`
        ])
      )
    })

    it("should fail with a negative maxLength", () => {
      const mistake = header.copy({ maxLength: "-1" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Header field "maxLength" must be positive, received: "-1"`
        ])
      )
    })
  })

  describe("OldLayout Field Validation", () => {
    it("should return a valid oldLayout", () => {
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.oldLayout)
      )

      expect(computed).toEqual(OldLayout.fromValue(Number.parseInt(header.oldLayout)))
    })

    it("should fail with a non-numeric oldLayout", () => {
      const mistake = header.copy({ oldLayout: "abcd" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Unable to parse header field "oldLayout" to integer, received: "abcd"`
        ])
      )
    })

    it("should fail with an oldLayout greater than 63", () => {
      const mistake = header.copy({ oldLayout: "64" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - OldLayout needs a value between 1 and 63, inclusive, received "64"`
        ])
      )
    })

    it("should fail with an oldLayout less than -1", () => {
      const mistake = header.copy({ oldLayout: "-2" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - OldLayout needs a value between 1 and 63, inclusive, received "-2"`
        ])
      )
    })
  })

  describe("CommentLines Field Validation", () => {
    it("should return a valid commentLines", () => {
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.commentLines)
      )

      expect(computed).toEqual(E.right(Number.parseInt(header.commentLines)))
    })

    it("should fail with a non-numeric commentLines", () => {
      const mistake = header.copy({ commentLines: "abcd" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Unable to parse header field "commentLines" to integer, received: "abcd"`
        ])
      )
    })

    it("should fail with a negative commentLines", () => {
      const mistake = header.copy({ commentLines: "-1" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Header field "commentLines" must be non-negative, received: "-1"`
        ])
      )
    })
  })

  describe("PrintDirection Field Validation", () => {
    it("should return a valid printDirection", () => {
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.printDirection)
      )

      expect(computed).toEqual(
        pipe(
          PrintDirection.fromValue(Number.parseInt(header.printDirection)),
          E.map(O.some)
        )
      )
    })

    it("should fail with a non-numeric printDirection", () => {
      const mistake = header.copy({ printDirection: "abcd" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Unable to parse header field "printDirection" to integer, received: "abcd"`
        ])
      )
    })

    it("should fail with a negative printDirection", () => {
      const mistake = header.copy({ printDirection: "-1" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Header field "printDirection" must be non-negative, received: "-1"`
        ])
      )
    })

    it("should return None when printDirection is not specified", () => {
      const lineHeader = header.withoutPrintDirection()
      const computed = pipe(
        FigHeader.fromLine(lineHeader),
        E.map((_) => _.printDirection)
      )

      expect(computed).toEqual(E.right(O.none))
    })
  })

  describe("FullLayout Field Validation", () => {
    it("should return a valid fullLayout", () => {
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) =>
          pipe(
            _.fullLayout,
            O.fold(() => A.emptyOf<FullLayout.FullLayout>(), C.toArray)
          )
        )
      )
      const received = pipe(
        FullLayout.fromValue(Number.parseInt(header.fullLayout)),
        E.map(C.toArray)
      )

      expect(computed).toEqual(received)
    })

    it("should fail with a non-numeric fullLayout", () => {
      const mistake = header.copy({ fullLayout: "abcd" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Unable to parse header field "fullLayout" to integer, received: "abcd"`
        ])
      )
    })

    it("should fail with a fullLayout less than 0", () => {
      const mistake = header.copy({ fullLayout: "-1" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - FullLayout needs a value between 0 and 32767, inclusive, but received "-1"`
        ])
      )
    })

    it("should fail with a fullLayout greater than 32767", () => {
      const mistake = header.copy({ fullLayout: "32768" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - FullLayout needs a value between 0 and 32767, inclusive, but received "32768"`
        ])
      )
    })

    it("should return None when fullLayout is not specified", () => {
      const lineHeader = header.withoutFullLayout()
      const computed = pipe(
        FigHeader.fromLine(lineHeader),
        E.map((_) => _.fullLayout)
      )

      expect(computed).toEqual(E.right(O.none))
    })
  })

  describe("Codetag Field Validation", () => {
    it("should return a valid codetagCount", () => {
      const computed = pipe(
        header.toFigHeader(),
        E.map((_) => _.codeTagCount)
      )

      expect(computed).toEqual(E.right(O.some(Number.parseInt(header.codeTagCount))))
    })

    it("should fail with a non-numeric codetagCount", () => {
      const mistake = header.copy({ codeTagCount: "abcd" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Unable to parse header field "codetagCount" to integer, received: "abcd"`
        ])
      )
    })

    it("should fail with a negative codetagCount", () => {
      const mistake = header.copy({ codeTagCount: "-1" }).toLine()
      const computed = TestUtils.stringifyError(FigHeader.fromLine(mistake))

      expect(computed).toEqual(
        E.left([
          `FigHeaderError - Header field "codetagCount" must be non-negative, received: "-1"`
        ])
      )
    })

    it("should return None when codetagCount is not specified", () => {
      const lineHeader = header.withoutCodetagCount()
      const computed = pipe(
        FigHeader.fromLine(lineHeader),
        E.map((_) => _.codeTagCount)
      )

      expect(computed).toEqual(E.right(O.none))
    })
  })
})
