import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as Map from "@effect-ts/core/Collections/Immutable/Map"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import * as Show from "@effect-ts/core/Show"
import * as TE from "@effect-ts/jest/Test"

import * as Config from "../src/CliConfig"
import * as Help from "../src/Help"
import type { Integer } from "../src/Internal/NewType"
import * as Options from "../src/Options"
import * as Validation from "../src/Validation"

const f = Options.alias_(Options.text("firstname"), "f")
const l = Options.text("lastname")
const a = Options.integer("age")
const aOpt = Options.optional_(Options.integer("age"), Show.number, "N/A")
const b = Options.boolean("verbose", true)
const m = Options.alias_(Options.mapping("defs"), "d")

const options = Options.tuple(f, l, a)

describe("Options", () => {
  const { it } = TE.runtime()

  it("should validate a boolean option without a value", () =>
    T.gen(function* (_) {
      const result = yield* _(Options.validate_(b, ["--verbose"]))

      expect(result).toEqual(Tp.tuple(A.empty, true))
    }))

  it("should validate a boolean option with a follow-up option", () =>
    T.gen(function* (_) {
      const o = Options.tuple(Options.boolean("help", true), Options.boolean("v", true))

      const v1 = yield* _(Options.validate_(o, A.empty))
      const v2 = yield* _(Options.validate_(o, ["--help"]))
      const v3 = yield* _(Options.validate_(o, ["--help", "-v"]))

      expect(v1).toEqual(Tp.tuple(A.empty, [false, false]))
      expect(v2).toEqual(Tp.tuple(A.empty, [true, false]))
      expect(v3).toEqual(Tp.tuple(A.empty, [true, true]))
    }))

  it("should validate a boolean option with negation", () =>
    T.gen(function* (_) {
      const bNegation = pipe(
        Options.negatableBoolean("verbose", true, "silent", "s"),
        Options.alias("v")
      )

      const v1 = yield* _(Options.validate_(bNegation, A.empty))
      const v2 = yield* _(Options.validate_(bNegation, ["--verbose"]))
      const v3 = yield* _(Options.validate_(bNegation, ["-v"]))
      const v4 = yield* _(Options.validate_(bNegation, ["--silent"]))
      const v5 = yield* _(Options.validate_(bNegation, ["-s"]))

      // Colliding Options
      const v6 = yield* _(
        T.flip(Options.validate_(bNegation, ["--silent", "--verbose"]))
      )
      const v7 = yield* _(T.flip(Options.validate_(bNegation, ["-s", "-v"])))

      expect(v1).toEqual(Tp.tuple(A.empty, false))
      expect(v2).toEqual(Tp.tuple(A.empty, true))
      expect(v3).toEqual(Tp.tuple(A.empty, true))
      expect(v4).toEqual(Tp.tuple(A.empty, false))
      expect(v5).toEqual(Tp.tuple(A.empty, false))
      expect(v6).toEqual(
        Validation.invalidValue(
          Help.p(
            Help.error(
              "Options collision detected. You can only specify either " +
                "'--verbose' or '--silent'."
            )
          )
        )
      )
      expect(v7).toEqual(
        Validation.invalidValue(
          Help.p(
            Help.error(
              "Options collision detected. You can only specify either " +
                "'--verbose' or '--silent'."
            )
          )
        )
      )
    }))

  it("should validate a text option", () =>
    T.gen(function* (_) {
      const result = yield* _(Options.validate_(f, ["--firstname", "John"]))

      expect(result).toEqual(Tp.tuple(A.empty, "John"))
    }))

  it("should validate a text option with an alias", () =>
    T.gen(function* (_) {
      const result = yield* _(Options.validate_(f, ["-f", "John"]))

      expect(result).toEqual(Tp.tuple(A.empty, "John"))
    }))

  it("should validate an option and get the remaining args", () =>
    T.gen(function* (_) {
      const result = yield* _(
        Options.validate_(f, ["--firstname", "John", "--lastname", "Doe"])
      )

      expect(result).toEqual(Tp.tuple(["--lastname", "Doe"], "John"))
    }))

  it("should fail to validate when no valid values are passed", () =>
    T.gen(function* (_) {
      const result = yield* _(T.result(Options.validate_(f, ["--lastname", "Doe"])))

      expect(Ex.untraced(result)).toEqual(
        Ex.fail(
          Validation.missingValue(
            Help.p(Help.error("Expected to find '--firstname' option."))
          )
        )
      )
    }))

  it("should validate an integer option", () =>
    T.gen(function* (_) {
      const result = yield* _(Options.validate_(a, ["--age", "100"]))

      expect(result).toEqual(Tp.tuple(A.empty, 100))
    }))

  it("should reject a missing integer value", () =>
    T.gen(function* (_) {
      const intOption = Options.integer("t")

      const result = yield* _(T.result(Options.validate_(intOption, A.empty)))

      expect(Ex.untraced(result)).toEqual(
        Ex.fail(
          Validation.missingValue(Help.p(Help.error("Expected to find '-t' option.")))
        )
      )
    }))

  it("should reject an invalid integer value", () =>
    T.gen(function* (_) {
      const intOption = Options.integer("t")

      const result = yield* _(T.result(Options.validate_(intOption, ["-t", "abc"])))

      expect(Ex.untraced(result)).toEqual(
        Ex.fail(Validation.invalidValue(Help.p("'abc' is not a integer")))
      )
    }))

  it("should reject an invalid option even if it has a default value", () =>
    T.gen(function* (_) {
      const o = pipe(
        Options.integer("integer"),
        Options.withDefault(0 as Integer, Show.number, "0 as default")
      )

      const result = yield* _(T.result(Options.validate_(o, ["--integer", "abc"])))

      expect(Ex.untraced(result)).toEqual(
        Ex.fail(Validation.invalidValue(Help.p("'abc' is not a integer")))
      )
    }))

  it("should reject collision of boolean options with negation", () =>
    T.gen(function* (_) {
      const bNegation = Options.negatableBoolean("v", true, "s")

      const result = yield* _(T.result(Options.validate_(bNegation, ["-v", "-s"])))

      expect(Ex.untraced(result)).toEqual(
        Ex.fail(
          Validation.invalidValue(
            Help.p(
              Help.error(
                "Options collision detected. You can only specify either '-v' or '-s'."
              )
            )
          )
        )
      )
    }))

  it("should validate case-insensitive configuration", () =>
    T.gen(function* (_) {
      const config = Config.make({ caseSensitive: false })
      const f = pipe(Options.text("FirstName"), Options.alias("F"))

      const r1 = yield* _(Options.validate_(f, ["--FirstName", "John"], config))
      const r2 = yield* _(Options.validate_(f, ["-F", "John"], config))
      const r3 = yield* _(T.flip(Options.validate_(f, ["--firstname", "John"])))
      const r4 = yield* _(T.flip(Options.validate_(f, ["-f", "John"])))

      expect(r1).toEqual(Tp.tuple(A.empty, "John"))
      expect(r2).toEqual(Tp.tuple(A.empty, "John"))
      expect(r3).toEqual(
        Validation.missingValue(
          Help.p(
            Help.error(
              "The flag '--firstname' is not recognized. Did you mean '--FirstName'?"
            )
          )
        )
      )
      expect(r4).toEqual(
        Validation.missingValue(
          Help.p(Help.error("Expected to find '--FirstName' option."))
        )
      )
    }))

  it("should validate options for cons", () =>
    T.gen(function* (_) {
      const result = yield* _(
        Options.validate_(options, [
          "--firstname",
          "John",
          "--lastname",
          "Doe",
          "--age",
          "100"
        ])
      )

      expect(result).toEqual(Tp.tuple(A.empty, ["John", "Doe", 100]))
    }))

  it("should validate options for cons with remainder", () =>
    T.gen(function* (_) {
      const result = yield* _(
        Options.validate_(options, [
          "--firstname",
          "John",
          "--lastname",
          "Doe",
          "--age",
          "100",
          "--silent",
          "false"
        ])
      )

      expect(result).toEqual(Tp.tuple(["--silent", "false"], ["John", "Doe", 100]))
    }))

  it("should validate an optional option when a valud is not supplied", () =>
    T.gen(function* (_) {
      const result = yield* _(Options.validate_(aOpt, []))

      expect(result).toEqual(Tp.tuple(A.empty, O.none))
    }))

  it("should validate an optional option when a value is supplied", () =>
    T.gen(function* (_) {
      const result = yield* _(Options.validate_(aOpt, ["--age", "20"]))

      expect(result).toEqual(Tp.tuple(A.empty, O.some(20)))
    }))

  it("should validate non supplied optional option with remainder", () =>
    T.gen(function* (_) {
      const result = yield* _(Options.validate_(aOpt, ["--bar", "baz"]))

      expect(result).toEqual(Tp.tuple(["--bar", "baz"], O.none))
    }))

  it("should validate supplied optional option with remainder", () =>
    T.gen(function* (_) {
      const result = yield* _(
        Options.validate_(aOpt, [
          "--firstname",
          "John",
          "--age",
          "100",
          "--lastname",
          "Doe"
        ])
      )

      expect(result).toEqual(
        Tp.tuple(["--firstname", "John", "--lastname", "Doe"], O.some(100))
      )
    }))

  it("should return a HelpDoc for invalid option similar to existing", () =>
    T.gen(function* (_) {
      const result = yield* _(T.result(Options.validate_(f, ["--firstme", "Alice"])))

      expect(Ex.untraced(result)).toEqual(
        Ex.fail(
          Validation.missingValue(
            Help.p(
              Help.error(
                "The flag '--firstme' is not recognized. Did you mean '--firstname'?"
              )
            )
          )
        )
      )
    }))

  it("should return a HelpDoc if an option is not an exact match and is a short option", () =>
    T.gen(function* (_) {
      const result = yield* _(T.result(Options.validate_(a, ["--ag", "20"])))

      expect(Ex.untraced(result)).toEqual(
        Ex.fail(
          Validation.missingValue(
            Help.p(Help.error("Expected to find '--age' option."))
          )
        )
      )
    }))

  describe("Mapping", () => {
    it("should validate a missing option", () =>
      T.gen(function* (_) {
        const result = yield* _(T.result(Options.validate_(m, A.empty)))

        expect(Ex.untraced(result)).toEqual(
          Ex.fail(
            Validation.missingValue(
              Help.p(Help.error("Expected to find '--defs' option."))
            )
          )
        )
      }))

    it("should validate repeated values", () =>
      T.gen(function* (_) {
        const result = yield* _(
          Options.validate_(m, ["-d", "key1=v1", "-d", "key2=v2", "--verbose"])
        )

        expect(result).toEqual(
          Tp.tuple(
            ["--verbose"],
            Map.make([
              ["key1", "v1"],
              ["key2", "v2"]
            ])
          )
        )
      }))

    it("should validate different key-value pairs", () =>
      T.gen(function* (_) {
        const result = yield* _(
          Options.validate_(m, ["--defs", "key1=v1", "key2=v2", "--verbose"])
        )

        expect(result).toEqual(
          Tp.tuple(
            ["--verbose"],
            Map.make([
              ["key1", "v1"],
              ["key2", "v2"]
            ])
          )
        )
      }))

    it("should validate different key-value pairs with alias", () =>
      T.gen(function* (_) {
        const result = yield* _(
          Options.validate_(m, ["-d", "key1=v1", "key2=v2", "--verbose"])
        )

        expect(result).toEqual(
          Tp.tuple(
            ["--verbose"],
            Map.make([
              ["key1", "v1"],
              ["key2", "v2"]
            ])
          )
        )
      }))
  })

  describe("orElse", () => {
    it("should validate orElse on two options", () =>
      T.gen(function* (_) {
        const o = pipe(
          Options.text("string"),
          Options.map(E.left),
          Options.orElse(pipe(Options.integer("integer"), Options.map(E.right)))
        )

        const i = yield* _(Options.validate_(o, ["--integer", "2"]))
        const s = yield* _(Options.validate_(o, ["--string", "two"]))

        expect(i).toEqual(Tp.tuple(A.empty, E.right(2)))
        expect(s).toEqual(Tp.tuple(A.empty, E.left("two")))
      }))

    it("should handle option collisions with orElse", () =>
      T.gen(function* (_) {
        const o = pipe(
          Options.text("string"),
          Options.orElse(Options.integer("integer"))
        )

        const result = yield* _(
          T.result(Options.validate_(o, ["--integer", "2", "--string", "two"]))
        )

        expect(Ex.untraced(result)).toEqual(
          Ex.fail(
            Validation.invalidValue(
              Help.p(
                Help.error(
                  "Options collision detected. You can only specify either " +
                    "'--string' or '--integer'."
                )
              )
            )
          )
        )
      }))

    it("should handle orElse when no options are provided", () =>
      T.gen(function* (_) {
        const o = pipe(
          Options.text("string"),
          Options.orElse(Options.integer("integer"))
        )

        const result = yield* _(T.result(Options.validate_(o, A.empty)))

        expect(Ex.untraced(result)).toEqual(
          Ex.fail(
            Validation.missingValue(
              Help.sequence_(
                Help.p(Help.error("Expected to find '--string' option.")),
                Help.p(Help.error("Expected to find '--integer' option."))
              )
            )
          )
        )
      }))

    it("should validate invalid option in orElse option when using withDefault", () =>
      T.gen(function* (_) {
        const o = pipe(
          Options.integer("min"),
          Options.orElse(Options.integer("max")),
          Options.withDefault(0 as Integer, Show.number, "0 as default")
        )

        const result = yield* _(T.result(Options.validate_(o, ["--min", "abc"])))

        expect(Ex.untraced(result)).toEqual(
          Ex.fail(
            Validation.invalidValue(
              Help.sequence_(
                Help.p("'abc' is not a integer"),
                Help.p(Help.error("Expected to find '--max' option."))
              )
            )
          )
        )
      }))
  })
})
