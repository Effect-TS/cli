import * as CliConfig from "@effect/cli/CliConfig"
import * as HelpDoc from "@effect/cli/HelpDoc"
import * as Span from "@effect/cli/HelpDoc/Span"
import * as Options from "@effect/cli/Options"
import * as it from "@effect/cli/test/utils/extend"
import * as ValidationError from "@effect/cli/ValidationError"
import * as Either from "@effect/data/Either"
import { pipe } from "@effect/data/Function"
import * as HashMap from "@effect/data/HashMap"
import * as List from "@effect/data/List"
import * as Option from "@effect/data/Option"
import * as Effect from "@effect/io/Effect"
import { describe, expect } from "vitest"

const boolOption = Options.boolean("verbose")

describe.concurrent("Options", () => {
  it.effect("validates a boolean option without a value", () =>
    Effect.gen(function*($) {
      const args = List.of("--verbose")
      const config = CliConfig.defaultConfig
      const result = yield* $(Options.validate(boolOption, args, config))
      expect(result).toEqual([List.nil(), true])
    }))

  it.effect("validates a boolean option with a followup option", () =>
    Effect.gen(function*($) {
      const options = Options.zip(Options.boolean("help"), Options.boolean("v"))
      const config = CliConfig.defaultConfig
      const args1 = List.nil()
      const args2 = List.of("--help")
      const args3 = List.make("--help", "-v")
      const result1 = yield* $(Options.validate(options, args1, config))
      const result2 = yield* $(Options.validate(options, args2, config))
      const result3 = yield* $(Options.validate(options, args3, config))
      expect(result1).toEqual([List.nil(), [false, false]])
      expect(result2).toEqual([List.nil(), [true, false]])
      expect(result3).toEqual([List.nil(), [true, true]])
    }))

  it.effect("validates a boolean option with negation", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = pipe(
        Options.boolean("verbose", { negationNames: ["silent", "s"] }),
        Options.alias("v")
      )
      const result1 = yield* $(Options.validate(option, List.nil(), config))
      const result2 = yield* $(Options.validate(option, List.make("--verbose"), config))
      const result3 = yield* $(Options.validate(option, List.make("-v"), config))
      const result4 = yield* $(Options.validate(option, List.make("--silent"), config))
      const result5 = yield* $(Options.validate(option, List.make("-s"), config))
      const result6 = yield* $(Effect.flip(Options.validate(option, List.make("--verbose", "--silent"), config)))
      const result7 = yield* $(Effect.flip(Options.validate(option, List.make("-v", "-s"), config)))
      expect(result1).toEqual([List.nil(), false])
      expect(result2).toEqual([List.nil(), true])
      expect(result3).toEqual([List.nil(), true])
      expect(result4).toEqual([List.nil(), false])
      expect(result5).toEqual([List.nil(), false])
      expect(result6).toEqual(ValidationError.invalidValue(HelpDoc.p(Span.error(
        "Collision between two options detected." +
          " You can only specify one of either: ['--verbose', '--silent']."
      ))))
      expect(result7).toEqual(ValidationError.invalidValue(HelpDoc.p(Span.error(
        "Collision between two options detected." +
          " You can only specify one of either: ['--verbose', '--silent']."
      ))))
    }))

  it.effect("validates a text option", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.alias(Options.text("firstName"), "f")
      const result = yield* $(Options.validate(option, List.make("--firstName", "John"), config))
      expect(result).toEqual([List.nil(), "John"])
    }))

  it.effect("validates a text option with an alternative format", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.alias(Options.text("firstName"), "f")
      const result = yield* $(Options.validate(option, List.make("--firstName=John"), config))
      expect(result).toEqual([List.nil(), "John"])
    }))

  it.effect("validates a text option with an alias", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.alias(Options.text("firstName"), "f")
      const result = yield* $(Options.validate(option, List.make("-f", "John"), config))
      expect(result).toEqual([List.nil(), "John"])
    }))

  it.effect("validates an integer option", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.integer("age")
      const result = yield* $(Options.validate(option, List.make("--age", "100"), config))
      expect(result).toEqual([List.nil(), 100])
    }))

  it.effect("validates an option and returns the remainder", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.alias(Options.text("firstName"), "f")
      const args = List.make("--firstName", "John", "--lastName", "Doe")
      const result = yield* $(Options.validate(option, args, config))
      expect(result).toEqual([List.make("--lastName", "Doe"), "John"])
    }))

  it.effect("validates an option and returns the remainder with different ordering", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.alias(Options.text("firstName"), "f")
      const args = List.make("--bar", "baz", "--firstName", "John", "--lastName", "Doe")
      const result = yield* $(Options.validate(option, args, config))
      expect(result).toEqual([List.make("--bar", "baz", "--lastName", "Doe"), "John"])
    }))

  it.effect("does not validate when no valid values are passed", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.alias(Options.text("firstName"), "f")
      const args = List.make("--lastName", "Doe")
      const result = yield* $(Effect.either(Options.validate(option, args, config)))
      expect(result).toEqual(Either.left(ValidationError.missingValue(HelpDoc.p(Span.error(
        "Expected to find option: '--firstName'"
      )))))
    }))

  it.effect("does not validate when an option is passed without a corresponding value", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.alias(Options.text("firstName"), "f")
      const args = List.make("--firstName")
      const result = yield* $(Effect.either(Options.validate(option, args, config)))
      expect(result).toEqual(Either.left(ValidationError.invalidValue(HelpDoc.p(
        "text options do not have a default value"
      ))))
    }))

  it.effect("does not validate an invalid option value", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.integer("t")
      const args = List.make("-t", "abc")
      const result = yield* $(Effect.flip(Options.validate(option, args, config)))
      expect(result).toEqual(ValidationError.invalidValue(HelpDoc.p("\"abc\" is not a integer")))
    }))

  it.effect("does not validate an invalid option value even when there is a default", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.withDefault(Options.integer("t"), 0)
      const args = List.make("-t", "abc")
      const result = yield* $(Effect.flip(Options.validate(option, args, config)))
      expect(result).toEqual(ValidationError.invalidValue(HelpDoc.p("\"abc\" is not a integer")))
    }))

  it.effect("does not validate a missing option", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.integer("t")
      const result = yield* $(Effect.flip(Options.validate(option, List.nil(), config)))
      expect(result).toEqual(ValidationError.missingValue(HelpDoc.p(Span.error("Expected to find option: '-t'"))))
    }))

  it.effect("validates with case-insensitive configuration", () =>
    Effect.gen(function*($) {
      const config = CliConfig.make(false, 2)
      const option = Options.alias(Options.text("Firstname"), "F")
      const args1 = List.make("--Firstname", "John")
      const args2 = List.make("--firstname", "John")
      const args3 = List.make("-F", "John")
      const args4 = List.make("-f", "John")
      const result1 = yield* $(Options.validate(option, args1, config))
      const result2 = yield* $(Options.validate(option, args2, config))
      const result3 = yield* $(Options.validate(option, args3, config))
      const result4 = yield* $(Options.validate(option, args4, config))
      expect(result1).toEqual([List.nil(), "John"])
      expect(result2).toEqual([List.nil(), "John"])
      expect(result3).toEqual([List.nil(), "John"])
      expect(result4).toEqual([List.nil(), "John"])
    }))

  it.effect("validates an unsupplied optional option", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.optional(Options.integer("age"))
      const result = yield* $(Options.validate(option, List.nil(), config))
      expect(result).toEqual([List.nil(), Option.none()])
    }))

  it.effect("validates an unsupplied optional option with remainder", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.optional(Options.integer("age"))
      const args = List.make("--bar", "baz")
      const result = yield* $(Options.validate(option, args, config))
      expect(result).toEqual([args, Option.none()])
    }))

  it.effect("validates a supplied optional option", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.optional(Options.integer("age"))
      const args = List.make("--age", "20")
      const result = yield* $(Options.validate(option, args, config))
      expect(result).toEqual([List.nil(), Option.some(20)])
    }))

  it.effect("validates a supplied optional option with remainder", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.optional(Options.integer("age"))
      const args = List.make("--firstName", "John", "--age", "20", "--lastName", "Doe")
      const result = yield* $(Options.validate(option, args, config))
      expect(result).toEqual([List.make("--firstName", "John", "--lastName", "Doe"), Option.some(20)])
    }))

  it.effect("validates using all and returns the specified structure", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option1 = Options.all({
        firstName: Options.text("firstName"),
        lastName: Options.text("lastName")
      })
      const option2 = Options.all([Options.text("firstName"), Options.text("lastName")])
      const args = List.make("--firstName", "John", "--lastName", "Doe")
      const result1 = yield* $(Options.validate(option1, args, config))
      const result2 = yield* $(Options.validate(option2, args, config))
      expect(result1).toEqual([List.nil(), { firstName: "John", lastName: "Doe" }])
      expect(result2).toEqual([List.nil(), ["John", "Doe"]])
    }))

  it.effect("validate provides a suggestion if a provided option is close to a specified option", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.text("firstName")
      const args = List.make("--firstme", "Alice")
      const result = yield* $(Effect.flip(Options.validate(option, args, config)))
      expect(result).toEqual(ValidationError.invalidValue(HelpDoc.p(Span.error(
        "The flag '--firstme' is not recognized. Did you mean '--firstName'?"
      ))))
    }))

  it.effect("validate provides a suggestion if a provided option with a default is close to a specified option", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.withDefault(Options.text("firstName"), "Jack")
      const args = List.make("--firstme", "Alice")
      const result = yield* $(Effect.flip(Options.validate(option, args, config)))
      expect(result).toEqual(ValidationError.invalidValue(HelpDoc.p(Span.error(
        "The flag '--firstme' is not recognized. Did you mean '--firstName'?"
      ))))
    }))

  it.effect("orElse - two options", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = pipe(
        Options.text("string"),
        Options.map(Either.left),
        Options.orElse(
          pipe(
            Options.integer("integer"),
            Options.map(Either.right)
          )
        )
      )
      const args1 = List.make("--integer", "2")
      const args2 = List.make("--string", "two")
      const result1 = yield* $(Options.validate(option, args1, config))
      const result2 = yield* $(Options.validate(option, args2, config))
      expect(result1).toEqual([List.nil(), Either.right(2)])
      expect(result2).toEqual([List.nil(), Either.left("two")])
    }))

  it.effect("orElse - option collision", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.orElse(Options.text("string"), Options.integer("integer"))
      const args = List.make("--integer", "2", "--string", "two")
      const result = yield* $(Effect.flip(Options.validate(option, args, config)))
      expect(result).toEqual(ValidationError.invalidValue(HelpDoc.p(Span.error(
        "Collision between two options detected. You can only specify one of either: ['--string', '--integer']."
      ))))
    }))

  it.effect("orElse - no options provided", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.orElse(Options.text("string"), Options.integer("integer"))
      const result = yield* $(Effect.flip(Options.validate(option, List.nil(), config)))
      const error = ValidationError.missingValue(HelpDoc.sequence(
        HelpDoc.p(Span.error("Expected to find option: '--string'")),
        HelpDoc.p(Span.error("Expected to find option: '--integer'"))
      ))
      expect(result).toEqual(error)
    }))

  it.effect("orElse - invalid option provided with a default", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = pipe(
        Options.integer("min"),
        Options.orElse(Options.integer("max")),
        Options.withDefault(0)
      )
      const args = List.make("--min", "abc")
      const result = yield* $(Effect.flip(Options.validate(option, args, config)))
      const error = ValidationError.invalidValue(HelpDoc.sequence(
        HelpDoc.p("\"abc\" is not a integer"),
        HelpDoc.p(Span.error("Expected to find option: '--max'"))
      ))
      expect(result).toEqual(error)
    }))

  // val m: Options[Map[String, String]] = Options.keyValueMap(name = "defs").alias("d")

  it.effect("keyValueMap - validates a missing option", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.alias(Options.keyValueMap("defs"), "d")
      const result = yield* $(Effect.flip(Options.validate(option, List.nil(), config)))
      expect(result).toEqual(ValidationError.missingValue(HelpDoc.p(Span.error(
        "Expected to find option: '--defs'"
      ))))
    }))

  it.effect("keyValueMap - validates repeated values", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.alias(Options.keyValueMap("defs"), "d")
      const args = List.make("-d", "key1=v1", "-d", "key2=v2", "--verbose")
      const result = yield* $(Options.validate(option, args, config))
      expect(result).toEqual([List.of("--verbose"), HashMap.make(["key1", "v1"], ["key2", "v2"])])
    }))

  it.effect("keyValueMap - validates different key/values", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.alias(Options.keyValueMap("defs"), "d")
      const args = List.make("--defs", "key1=v1", "key2=v2", "--verbose")
      const result = yield* $(Options.validate(option, args, config))
      expect(result).toEqual([List.of("--verbose"), HashMap.make(["key1", "v1"], ["key2", "v2"])])
    }))

  it.effect("keyValueMap - validates different key/values with alias", () =>
    Effect.gen(function*($) {
      const config = CliConfig.defaultConfig
      const option = Options.alias(Options.keyValueMap("defs"), "d")
      const args = List.make("-d", "key1=v1", "key2=v2", "--verbose")
      const result = yield* $(Options.validate(option, args, config))
      expect(result).toEqual([List.of("--verbose"), HashMap.make(["key1", "v1"], ["key2", "v2"])])
    }))
})
