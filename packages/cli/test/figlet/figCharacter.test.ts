import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/core/Function"

import * as TestCharacter from "./fixtures/TestCharacter"
import { TestHeader } from "./fixtures/TestHeader"
import * as TestUtils from "./test-utils"

describe("FigCharacter", () => {
  describe("Constructors", () => {
    it("should successfully validate a valid FigCharacter", () => {
      const computed = TestCharacter.get({ char: " " })

      expect(E.isRight(computed)).toBeTruthy()
    })
  })

  describe("Name Validation", () => {
    it("should fail when given a name equal to -1", () => {
      const computed = TestUtils.stringifyError(TestCharacter.get({ char: "\uffff" }))

      expect(computed).toEqual(E.left(['FigCharacterError - Name "-1" is invalid']))
    })
  })

  describe("Endmark Validation", () => {
    it("should discover the endmark character", () => {
      const computed = E.map_(TestCharacter.get({ char: "a" }), (_) => _.endmark)

      expect(computed).toEqual(E.right("@"))
    })

    it("should fail when endmarks are missing from the lines", () => {
      const lines = TestCharacter.chain((line, i) =>
        i === 1 ? C.single(line.replace(/@$/g, "")) : C.single(line)
      )
      const computed = TestUtils.stringifyError(TestCharacter.get({ char: "a", lines }))

      expect(computed).toEqual(
        E.left([
          "FigCharacterError - Cannot determine endmark. There are lines with " +
            "no termination or more than 2-characters termination on character " +
            '"a" defined at line 124: (@, , @, @, @, @@)'
        ])
      )
    })

    it("should fail when lines terminate with more than two characters", () => {
      const lines = TestCharacter.chain((line, i) =>
        i === 1 ? C.single(line.replace(/@$/g, "@@@")) : C.single(line)
      )
      const computed = pipe(
        TestUtils.stringifyError(TestCharacter.get({ char: "a", lines })),
        E.mapLeft((e) =>
          e[0].startsWith(
            'FigCharacterError - Lines for character "a" defined at line 124 ' +
              "are of different width:"
          )
        )
      )

      expect(computed).toEqual(E.left(true))
    })

    it("should fail when there are different types of endmarks", () => {
      const lines = TestCharacter.chain((line, i) => {
        const newEndmark = C.join_(
          C.fill((i % 2) + 1, () => String.fromCharCode("a".charCodeAt(0) + i)),
          ""
        )
        return C.single(line.replace(/(.)\1?$/g, newEndmark))
      })
      const computed = TestUtils.stringifyError(TestCharacter.get({ char: "a", lines }))

      expect(computed).toEqual(
        E.left([
          'FigCharacterError - Multiple endmarks found for character "a" ' +
            "defined at line 124, only one endmark character is allowed: " +
            "(a, bb, c, dd, e, ff)"
        ])
      )
    })

    it("should succeed when a sub-character is the same as the 2-endmark", () => {
      const lines = TestCharacter.chain((line) => C.single(line.replace(/@+$/g, "@@@")))
      const computed = E.map_(TestCharacter.get({ char: "a", lines }), (_) => _.width)

      expect(computed).toEqual(E.right(7))
    })

    it("should remove all consecutive endmarks from each line", () => {
      const computed = pipe(
        TestCharacter.get({ char: "a" }),
        E.map((_) =>
          pipe(
            _.lines.value,
            C.filter((_) => /@{1,2}$/.test(_))
          )
        )
      )

      expect(computed).equals(E.right(C.empty()))
    })
  })

  describe("MaxWidth Validation", () => {
    it("should fail when the maxWidth is negative", () => {
      const computed = TestUtils.stringifyError(
        TestCharacter.get({ char: "a", maxWidth: -1 })
      )

      expect(computed).toEqual(
        E.left([
          'FigHeaderError - Header field "maxLength" must be positive, received: "-1"'
        ])
      )
    })

    it("should fail if all lines do not have the same width", () => {
      const lines = TestCharacter.chain((line, i) => C.single("a".repeat(i % 2) + line))
      const computed = pipe(
        TestCharacter.get({ char: "a", lines }),
        TestUtils.stringifyError,
        E.mapLeft((e) =>
          e[0].startsWith(
            'FigCharacterError - Lines for character "a" defined at line 124 ' +
              "are of different width"
          )
        )
      )

      expect(computed).toEqual(E.left(true))
    })

    it("should fail if the width of the lines exceeds the max width", () => {
      const lines = TestCharacter.chain((line) =>
        C.single("a".repeat(Number.parseInt(TestHeader.default.maxLength)) + line)
      )
      const computed = pipe(
        TestCharacter.get({ char: "a", lines }),
        TestUtils.stringifyError,
        E.mapLeft((e) =>
          e[0].startsWith(
            "FigCharacterError - Maximum character width exceeded at line 124"
          )
        )
      )

      expect(computed).toEqual(E.left(true))
    })
  })

  describe("Height Validation", () => {
    it("should fail when the height is negative", () => {
      const computed = TestUtils.stringifyError(
        TestCharacter.get({ char: "a", height: -1 })
      )

      expect(computed).toEqual(
        E.left([
          'FigHeaderError - Header field "height" must be positive, received: "-1"'
        ])
      )
    })

    it("should fail when the character height is less than the height parameter", () => {
      const lines = TestCharacter.chain((line, i) =>
        i === 0 ? C.empty() : C.single(line)
      )
      const computed = TestUtils.stringifyError(TestCharacter.get({ char: "a", lines }))

      expect(computed).toEqual(
        E.left([
          'FigCharacterError - The character "a" defined at line 124 doesn\'t ' +
            "respect the specified height of 6"
        ])
      )
    })

    it("should fail when the character height is more than the height parameter", () => {
      const lines = TestCharacter.chain((line, i) =>
        i === 0 ? C.from([line, line]) : C.single(line)
      )
      const computed = TestUtils.stringifyError(TestCharacter.get({ char: "a", lines }))

      expect(computed).toEqual(
        E.left([
          'FigCharacterError - The character "a" defined at line 124 doesn\'t ' +
            "respect the specified height of 6"
        ])
      )
    })
  })
})
