import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as E from "@effect-ts/core/Either"
import { flow, pipe } from "@effect-ts/system/Function"

import * as FigFont from "../../src/figlet/core/FigFont"
import { TestFont } from "./fixtures/TestFont"
import * as TestUtils from "./test-utils"

const font = TestFont.default

describe("FigFont", () => {
  describe("Constructors", () => {
    it("should build a FigFont successfully if the input is valid", () => {
      const computed = TestUtils.stringifyError(
        FigFont.fromFile("test.file", font.allLines())
      )

      expect(E.isRight(computed)).toBeTruthy()
    })
  })
  describe("Required Characters", () => {
    it("should follow the FigFont standard", () => {
      const requiredCharacters = C.map_(
        C.concat_(C.range(32, 126), C.from([196, 214, 220, 223, 228, 246, 252])),
        String.fromCharCode
      )
      expect(FigFont.requiredCharacters).equals(requiredCharacters)
    })
  })

  describe("Input Iterator", () => {
    it("should fail if the data ends before the full file is read", () => {
      const computed = pipe(
        FigFont.fromFile("test.file", C.take_(font.allLines(false), 150)),
        TestUtils.stringifyError,
        E.mapLeft(
          flow(NA.head, (_) =>
            _.startsWith(
              "FigCharacterError - Missing required character definitions for the following Figlet characters:"
            )
          )
        )
      )

      expect(computed).toEqual(E.left(true))
    })

    it("should fail if a line is missing", () => {
      const lines = pipe(
        font.allLines(false),
        C.zipWithIndex,
        C.filter(({ tuple: [_, index] }) => index !== 150),
        C.map(({ tuple: [line] }) => line)
      )
      const computed = TestUtils.stringifyError(FigFont.fromFile("test.file", lines))

      expect(computed).toEqual(
        E.left(
          NA.single(
            "FigCharacterError - Incomplete character definition at the end of the file"
          )
        )
      )
    })
  })

  describe("Header Validation", () => {
    it("should fail when the header is not valid", () => {
      const lines = pipe(font.allLines(false), C.drop(1), C.prepend("adfadsa"))
      const computed = TestUtils.stringifyError(FigFont.fromFile("test.file", lines))

      expect(computed).toEqual(
        E.left(
          NA.single(
            "FigHeaderError - Wrong number of parameters in the Figlet font header. " +
              "Expected at least 6 parameters but found 1."
          )
        )
      )
    })
  })

  describe("Comments Validation", () => {
    it("should fail if the lines of a comment are invalid", () => {
      const lines = font.copy({ comment: "asdfad" }).allLines(false)
      const computed = TestUtils.stringifyError(FigFont.fromFile("test.file", lines))

      expect(computed).toEqual(
        E.left(
          NA.single(
            "FigCharacterError - Incomplete character definition at the end of the file"
          )
        )
      )
    })
  })

  describe("FigCharacter Validation", () => {
    it("should fail if any required characters are missing", () => {
      const lines = font.chainCharacters(
        (char, i) => (i === 1 ? C.empty() : C.single(char)),
        false
      )
      const computed = TestUtils.stringifyError(FigFont.fromFile("test.file", lines))

      expect(computed).toEqual(
        E.left(
          NA.single(
            "FigCharacterError - Missing required character definitions for the " +
              "following Figlet characters: ü"
          )
        )
      )
    })

    it("should fail if a FigCharacter is invalid", () => {
      const lines = font.chainCharacters(
        (char, i) => (i === 1 ? C.single(char.replace("@@", "")) : C.single(char)),
        false
      )
      const computed = TestUtils.stringifyError(FigFont.fromFile("test.file", lines))

      expect(computed).toEqual(
        E.left(
          NA.single(
            "FigCharacterError - Cannot determine endmark. There are lines with " +
              "no termination or more than 2-characters termination on character " +
              '"!" defined at line 19: (@, @, @, @, @, )'
          )
        )
      )
    })

    it("should fail if the total number of characters does not respect the header", () => {
      const newHeader = font.header.copy({ codeTagCount: "2" }).toLine()
      const lines = pipe(font.allLines(), C.drop(1), C.prepend(newHeader))
      const computed = TestUtils.stringifyError(FigFont.fromFile("test.file", lines))

      expect(computed).toEqual(
        E.left(
          NA.single(
            "FigFontError - The number of loaded tagged fonts (4) does not " +
              "correspond with the value indicated in the header (2)"
          )
        )
      )
    })

    it("should fail if the name of a tag is missing", () => {
      const lines = font.chainTagged((char, i) =>
        i === 0
          ? C.from(
              pipe(char.split("\n").slice(1), A.cons("  NO-BREAK SPACE"), A.join("\n"))
            )
          : C.single(char)
      )
      const computed = TestUtils.stringifyError(FigFont.fromFile("test.file", lines))

      expect(computed).toEqual(
        E.left(
          NA.single(
            'FigCharacterError - Could not convert character code "" defined at ' +
              "line 625 to integer"
          )
        )
      )
    })

    it("should fail if the name of a tag is an invalid value", () => {
      const lines = font.chainTagged((char, i) =>
        i === 0
          ? C.single(
              pipe(
                char.split("\n").slice(1),
                A.cons("ABCD  NO-BREAK SPACE"),
                A.join("\n")
              )
            )
          : C.single(char)
      )
      const computed = TestUtils.stringifyError(FigFont.fromFile("test.file", lines))

      expect(computed).toEqual(
        E.left(
          NA.single(
            'FigCharacterError - Could not convert character code "ABCD" ' +
              "defined at line 625 to integer"
          )
        )
      )
    })

    it("should not fail if the comment of a tag is missing", () => {
      const lines = font.chainTagged((char, i) =>
        i === 0
          ? C.single(pipe(char.split("\n").slice(1), A.cons("160"), A.join("\n")))
          : C.single(char)
      )
      const computed = TestUtils.stringifyError(FigFont.fromFile("test.file", lines))

      expect(E.isRight(computed)).toBeTruthy()
    })
  })
})
