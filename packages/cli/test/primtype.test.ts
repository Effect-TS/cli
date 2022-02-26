import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import * as O from "@effect-ts/core/Option"
import * as TE from "@effect-ts/jest/Test"

import * as Exists from "../src/Exists/index.js"
import * as PathType from "../src/PathType/index.js"
import * as Primitive from "../src/PrimType/index.js"
import { mockFileSystem } from "./test-utils.js"

describe("PrimType", () => {
  const { it } = TE.runtime()

  describe("Text", () => {
    it("should validate all strings", () =>
      T.gen(function* (_) {
        const text = new Primitive.Text()

        const result = yield* _(Primitive.validate_(text, O.some("foo")))

        expect(result).toBe("foo")
      }))
  })

  describe("Enumeration", () => {
    it("should validate proper value if one of the provided cases", () =>
      T.gen(function* (_) {
        const enumeration = new Primitive.Enumeration([
          Tp.tuple("foo", 1),
          Tp.tuple("bar", 2),
          Tp.tuple("baz", 3)
        ])

        expect(yield* _(Primitive.validate_(enumeration, O.some("foo")))).toBe(1)
        expect(yield* _(Primitive.validate_(enumeration, O.some("bar")))).toBe(2)
        expect(yield* _(Primitive.validate_(enumeration, O.some("baz")))).toBe(3)
      }))

    it("should reject a value if not one of the provided cases", () =>
      T.gen(function* (_) {
        const enumeration = new Primitive.Enumeration([
          Tp.tuple("foo", 1),
          Tp.tuple("bar", 2),
          Tp.tuple("baz", 3)
        ])

        const result = yield* _(
          T.result(Primitive.validate_(enumeration, O.some("qux")))
        )

        expect(Ex.untraced(result)).toEqual(
          Ex.fail("Expected one of the following cases: foo, bar, baz")
        )
      }))
  })

  describe("Path", () => {
    it("should return the proper file path", () =>
      T.gen(function* (_) {
        const fileSystem = mockFileSystem({ pathIsRegularFile: true })
        const path = new Primitive.Path(PathType.file, Exists.yes, fileSystem)

        const result = yield* _(Primitive.validate_(path, O.some("path")))

        expect(result).toBe("path")
      }))

    it("should return the proper directory path", () =>
      T.gen(function* (_) {
        const fileSystem = mockFileSystem({ pathIsDirectory: true })
        const path = new Primitive.Path(PathType.directory, Exists.yes, fileSystem)

        const result = yield* _(Primitive.validate_(path, O.some("path")))

        expect(result).toBe("path")
      }))

    it("should return the proper file path if both are allowed", () =>
      T.gen(function* (_) {
        const fileSystem = mockFileSystem({ pathIsRegularFile: true })
        const path = new Primitive.Path(PathType.either, Exists.yes, fileSystem)

        const result = yield* _(Primitive.validate_(path, O.some("path")))

        expect(result).toBe("path")
      }))

    it("should return the proper directory path if both are allowed", () =>
      T.gen(function* (_) {
        const fileSystem = mockFileSystem({ pathIsDirectory: true })
        const path = new Primitive.Path(PathType.either, Exists.yes, fileSystem)

        const result = yield* _(Primitive.validate_(path, O.some("path")))

        expect(result).toBe("path")
      }))

    it("should return an error if path targets a directory but a file was expected", () =>
      T.gen(function* (_) {
        const fileSystem = mockFileSystem({ pathIsDirectory: true })
        const path = new Primitive.Path(PathType.file, Exists.yes, fileSystem)

        const result = yield* _(T.result(Primitive.validate_(path, O.some("path"))))

        expect(Ex.untraced(result)).toEqual(
          Ex.fail("Expected path 'path' to be a regular file.")
        )
      }))

    it("should return an error if path targets a file but a directory was expected", () =>
      T.gen(function* (_) {
        const fileSystem = mockFileSystem({ pathIsRegularFile: true })
        const path = new Primitive.Path(PathType.directory, Exists.yes, fileSystem)

        const result = yield* _(T.result(Primitive.validate_(path, O.some("path"))))

        expect(Ex.untraced(result)).toEqual(
          Ex.fail("Expected path 'path' to be a directory.")
        )
      }))

    it("should return an error if the file doesn't exist but must exist", () =>
      T.gen(function* (_) {
        const fileSystem = mockFileSystem({ pathExists: false })
        const path = new Primitive.Path(PathType.either, Exists.yes, fileSystem)

        const result = yield* _(T.result(Primitive.validate_(path, O.some("path"))))

        expect(Ex.untraced(result)).toEqual(Ex.fail("Path 'path' must exist."))
      }))

    it("should return an error if the file exists but must not exist", () =>
      T.gen(function* (_) {
        const fileSystem = mockFileSystem()
        const path = new Primitive.Path(PathType.either, Exists.no, fileSystem)

        const result = yield* _(T.result(Primitive.validate_(path, O.some("path"))))

        expect(Ex.untraced(result)).toEqual(Ex.fail("Path 'path' must not exist."))
      }))
  })

  describe("Float", () => {
    it("should validate a proper representation of a floating point number", () =>
      T.gen(function* (_) {
        const float = new Primitive.Float()

        expect(yield* _(Primitive.validate_(float, O.some("0.0")))).toBe(0.0)
        expect(yield* _(Primitive.validate_(float, O.some("1.0")))).toBe(1.0)
        expect(yield* _(Primitive.validate_(float, O.some("1.23")))).toBe(1.23)
        expect(yield* _(Primitive.validate_(float, O.some("10.4")))).toBe(10.4)
        expect(yield* _(Primitive.validate_(float, O.some("-3.14")))).toBe(-3.14)
      }))

    it("should reject improper floating point number representations", () =>
      T.gen(function* (_) {
        const float = new Primitive.Float()

        const result = yield* _(T.result(Primitive.validate_(float, O.some("bad"))))

        expect(Ex.untraced(result)).toEqual(Ex.fail("'bad' is not a float"))
      }))
  })

  describe("Integer", () => {
    it("should validate a proper representation of an integer", () =>
      T.gen(function* (_) {
        const int = new Primitive.Integer()

        expect(yield* _(Primitive.validate_(int, O.some("0")))).toBe(0)
        expect(yield* _(Primitive.validate_(int, O.some("10")))).toBe(10)
        expect(yield* _(Primitive.validate_(int, O.some("-10")))).toBe(-10)
      }))

    it("should reject improper integer representations", () =>
      T.gen(function* (_) {
        const int = new Primitive.Integer()

        expect(
          Ex.untraced(yield* _(T.result(Primitive.validate_(int, O.some("bad")))))
        ).toEqual(Ex.fail("'bad' is not a integer"))
        expect(
          Ex.untraced(yield* _(T.result(Primitive.validate_(int, O.some("3.14")))))
        ).toEqual(Ex.fail("'3.14' is not a integer"))
      }))
  })

  describe("Bool", () => {
    it("should validate a proper representation of a boolean", () =>
      T.gen(function* (_) {
        const bool = new Primitive.Bool(O.none)

        expect(yield* _(Primitive.validate_(bool, O.some("true")))).toBeTruthy()
        expect(yield* _(Primitive.validate_(bool, O.some("1")))).toBeTruthy()
        expect(yield* _(Primitive.validate_(bool, O.some("y")))).toBeTruthy()
        expect(yield* _(Primitive.validate_(bool, O.some("yes")))).toBeTruthy()
        expect(yield* _(Primitive.validate_(bool, O.some("on")))).toBeTruthy()

        expect(yield* _(Primitive.validate_(bool, O.some("false")))).toBeFalsy()
        expect(yield* _(Primitive.validate_(bool, O.some("0")))).toBeFalsy()
        expect(yield* _(Primitive.validate_(bool, O.some("n")))).toBeFalsy()
        expect(yield* _(Primitive.validate_(bool, O.some("no")))).toBeFalsy()
        expect(yield* _(Primitive.validate_(bool, O.some("off")))).toBeFalsy()
      }))

    it("should reject improper boolean representations", () =>
      T.gen(function* (_) {
        const bool = new Primitive.Bool(O.none)

        const result = yield* _(T.result(Primitive.validate_(bool, O.some("bad"))))

        expect(Ex.untraced(result)).toEqual(
          Ex.fail("'bad' was not recognized as a valid boolean")
        )
      }))

    it("should use the default value if a value is not provided", () =>
      T.gen(function* (_) {
        const bool = new Primitive.Bool(O.some(true))

        const result = yield* _(Primitive.validate_(bool, O.none))

        expect(result).toBeTruthy()
      }))
  })

  describe("Date", () => {
    it("should validate a proper representation of a Date", () =>
      T.gen(function* (_) {
        const date = new Primitive.Date()

        expect(
          yield* _(Primitive.validate_(date, O.some("2021-10-10T14:48:00")))
        ).toBeInstanceOf(Date)
      }))

    it("should reject improper date representations", () =>
      T.gen(function* (_) {
        const date = new Primitive.Date()

        const result = yield* _(T.result(Primitive.validate_(date, O.some("bad"))))

        expect(Ex.untraced(result)).toEqual(Ex.fail("'bad' is not a date"))
      }))
  })
})
