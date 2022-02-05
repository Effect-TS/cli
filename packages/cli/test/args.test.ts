import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import * as TE from "@effect-ts/jest/Test"
import * as Path from "path"

import * as Args from "../src/Args"
import * as Exists from "../src/Exists"
import * as Help from "../src/Help"

const argsFile = Path.join(__dirname, "args.test.ts")

describe("Args", () => {
  const { it } = TE.runtime()

  it("should validate an existing file when the file must exist", () =>
    T.gen(function* (_) {
      const arg = Args.repeat(Args.file(Exists.yes))

      const result = yield* _(Args.validate_(arg, A.single(argsFile)))

      expect(result).toEqual(Tp.tuple(A.empty(), A.single(argsFile)))
    }))

  it("should reject a file that does not exist when the file must exist", () =>
    T.gen(function* (_) {
      const arg = Args.repeat(Args.file(Exists.yes))

      const result = yield* _(T.result(Args.validate_(arg, A.single("notFound.file"))))

      expect(Ex.untraced(result)).toEqual(
        Ex.fail(Help.p("Path 'notFound.file' must exist."))
      )
    }))

  it("should validate a non-existent file when the file must not exist", () =>
    T.gen(function* (_) {
      const arg = Args.repeat(Args.file(Exists.no))

      const result = yield* _(Args.validate_(arg, A.single("doesNotExist.file")))

      expect(result).toEqual(Tp.tuple(A.empty(), A.single("doesNotExist.file")))
    }))

  it("should succeed with a non-existent file when the file may either exist or not exist", () =>
    T.gen(function* (_) {
      const arg = Args.repeat(Args.file(Exists.either))

      const result = yield* _(Args.validate_(arg, A.single("notExists.file")))

      expect(result).toEqual(Tp.tuple(A.empty(), A.single("notExists.file")))
    }))

  it("should succeed with a existent file when the file may either exist or not exist", () =>
    T.gen(function* (_) {
      const arg = Args.repeat(Args.file(Exists.either))

      const result = yield* _(Args.validate_(arg, A.single(argsFile)))

      expect(result).toEqual(Tp.tuple(A.empty(), A.single(argsFile)))
    }))

  it("should validate existent and non-existent files/directorires when the files may exist or not exist", () =>
    T.gen(function* (_) {
      const arg = Args.repeat(Args.file(Exists.either))

      const result = yield* _(Args.validate_(arg, [argsFile, "notExists.file"]))

      expect(result).toEqual(Tp.tuple(A.empty(), [argsFile, "notExists.file"]))
    }))
})
