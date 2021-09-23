// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import type { IO } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import { matchTag_ } from "@effect-ts/core/Utils"

import type { CliConfig } from "../CliConfig"
import * as Config from "../CliConfig"
import type { Exists } from "../Exists"
import type { HelpDoc } from "../Help"
import * as Help from "../Help"
import { FileSystem } from "../Internal/FileSystem"
import * as NewType from "../Internal/NewType"
import type { PathType } from "../PathType"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A `PrimType` represents the primitive types supported by Effect-TS CLI.
 *
 * Each primitive type has a way to parse and validate from a string.
 */
export abstract class PrimType<A> {
  constructor(
    readonly helpDoc: HelpDoc,
    readonly typeName: string,
    readonly choices: Option<string>
  ) {}

  abstract validate(value: Option<string>, config?: CliConfig): IO<string, A>
}

/**
 * A primitive type representing a file system path.
 */
export class Path extends PrimType<string> {
  /**
   * @param pathType Type of expected path: `Directory`, `File`, or `Either`
   * if both are acceptable.
   * @param exists `Yes` if path is expected to exists, `No` otherwise, or
   * `Either` is both are acceptable.
   * @param fileSystem An implementation of `FileSystem` interface.
   */
  constructor(
    readonly pathType: PathType,
    readonly exists: Exists,
    readonly fileSystem: FileSystem = FileSystem
  ) {
    super(
      matchTag_(exists, {
        Yes: () =>
          matchTag_(pathType, {
            File: () => Help.text("An existing file."),
            Directory: () => Help.text("An existing directory."),
            Either: () => Help.text("An existing file or directory.")
          }),
        No: () =>
          matchTag_(pathType, {
            File: () => Help.text("A file that must not exist."),
            Directory: () => Help.text("A directory that must not exist."),
            Either: () => Help.text("A file or directory that must not exist.")
          }),
        Either: () =>
          matchTag_(pathType, {
            File: () => Help.text("A file."),
            Directory: () => Help.text("A directory."),
            Either: () => Help.text("A file or directory.")
          })
      }),
      matchTag_(pathType, {
        File: () => "file",
        Directory: () => "directory",
        Either: () => "path"
      }),
      O.none
    )
  }

  validate(
    value: Option<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<string, string> {
    return T.chain_(
      T.orElseFail_(T.fromOption(value), `Path options do not have a default value.`),
      (path) =>
        T.zipLeft_(
          T.chain_(
            this.fileSystem.exists(path),
            this.refineExistence(path, this.exists)
          ),
          T.when_(
            matchTag_(this.pathType, {
              File: () =>
                T.unlessM_(
                  T.fail(
                    `Expected path '${O.getOrElse_(
                      value,
                      () => ""
                    )}' to be a regular file.`
                  ),
                  this.fileSystem.isRegularFile(path)
                ),
              Directory: () =>
                T.unlessM_(
                  T.fail(
                    `Expected path '${O.getOrElse_(
                      value,
                      () => ""
                    )}' to be a directory.`
                  ),
                  this.fileSystem.isDirectory(path)
                ),
              Either: () => T.unit
            }),
            () => this.exists._tag !== "No"
          )
        )
    )
  }

  private refineExistence(value: string, expected: Exists) {
    return (actual: boolean): IO<string, string> => {
      return matchTag_(
        expected,
        {
          No: () =>
            actual ? T.fail(`Path '${value}' must not exist.`) : T.succeed(value),
          Yes: () => (actual ? T.succeed(value) : T.fail(`Path '${value}' must exist.`))
        },
        () => T.succeed(value)
      )
    }
  }
}

/**
 * A primitive type representing a value selected from a set of allowed values.
 */
export class Enumeration<A> extends PrimType<A> {
  /**
   * @param cases A list of allowed parameter-value pairs.
   */
  constructor(readonly cases: Array<Tuple<[string, A]>>) {
    super(
      Help.text(
        `One of the following cases: ${A.join_(A.map_(cases, Tp.get(0)), ", ")}`
      ),
      "choice",
      O.some(A.join_(A.map_(cases, Tp.get(0)), " | "))
    )
  }

  validate(
    value: Option<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<string, A> {
    return T.chain_(
      T.orElseFail_(
        T.fromOption(value),
        `Enumeration options do not have a default value`
      ),
      (value) =>
        O.fold_(
          A.findFirstMap_(this.cases, (c) => (c.get(0) === value ? O.some(c) : O.none)),
          () =>
            T.fail(
              `Expected one of the following cases: ${A.join_(
                A.map_(this.cases, Tp.get(0)),
                ", "
              )}`
            ),
          (c) => T.succeed(c.get(1))
        )
    )
  }
}

/**
 * A primitive type representing any text.
 */
export class Text extends PrimType<string> {
  constructor() {
    super(Help.text("A user-defined piece of text."), "text", O.none)
  }

  validate(
    value: Option<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<string, string> {
    return attemptParse(value, T.succeed, this.typeName)
  }
}

/**
 * A primitive type representing float values.
 */
export class Float extends PrimType<number> {
  constructor() {
    super(Help.text("A floating point number."), "float", O.none)
  }

  validate(
    value: Option<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<string, NewType.Float> {
    return attemptParse(value, NewType.parseFloat, this.typeName)
  }
}

/**
 * A primitive type representing integer values.
 */
export class Integer extends PrimType<NewType.Integer> {
  constructor() {
    super(Help.text("An integer."), "integer", O.none)
  }

  validate(
    value: Option<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<string, NewType.Integer> {
    return attemptParse(value, NewType.parseInteger, this.typeName)
  }
}

/**
 * A primitive type representing a boolean value.
 *
 * * Truthy values can be passed as `"true"`, `"1"`, `"y"`, `"yes"` or `"on"`.
 * * Falsy values can be passed as `"false"`, `"o"`, `"n"`, `"no"` or `"off"`.
 */
export class Bool extends PrimType<boolean> {
  /**
   * @param defaultValue The default value that should be used when the
   * command-line argument is not provided.
   */
  constructor(readonly defaultValue: Option<boolean>) {
    super(Help.text("A true or false value."), "boolean", O.none)
  }

  validate(
    value: Option<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<string, boolean> {
    return O.fold_(
      O.map_(value, (text) => Config.normalizeCase_(config, text)),
      () =>
        T.orElseFail_(
          T.fromOption(this.defaultValue),
          `Missing default value for boolean parameter`
        ),
      (s) =>
        ["true", "1", "y", "yes", "on"].indexOf(s) !== -1
          ? T.succeed(true)
          : ["false", "0", "n", "no", "off"].indexOf(s) !== -1
          ? T.succeed(false)
          : T.fail(`'${s}' was not recognized as a valid boolean`)
    )
  }
}

/**
 * A primitive type representing a date (i.e. `"2007-12-03T10:15:30.00Z"`).
 *
 * The string passed as a date parameter must be parseable by the static `parse`
 * method on the `Date` object. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
 * for more detail on valid date strings.
 */
export class Date extends PrimType<globalThis.Date> {
  constructor() {
    super(Help.text("A valid string representation of a date."), "date", O.none)
  }

  validate(
    value: Option<string>,
    config: CliConfig = Config.defaultConfig
  ): IO<string, globalThis.Date> {
    return attemptParse(
      value,
      (u) => {
        const ms = globalThis.Date.parse(u)
        return Number.isNaN(ms)
          ? T.fail("invalid date")
          : T.succeed(new globalThis.Date(ms))
      },
      this.typeName
    )
  }
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function attemptParse<E, A>(
  value: Option<string>,
  parser: (value: string) => IO<E, A>,
  typeName: string
): T.IO<string, A> {
  return T.chain_(
    T.orElseFail_(
      T.fromOption(value),
      `${typeName} options do not have a default value`
    ),
    (value) => T.orElseFail_(parser(value), `'${value}' is not a ${typeName}`)
  )
}
