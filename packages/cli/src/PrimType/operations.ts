// ets_tracing: off

import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import { pipe } from "@effect-ts/core/Function"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import { matchTag_ } from "@effect-ts/core/Utils"

import type { CliConfig } from "../CliConfig/index.js"
import * as Config from "../CliConfig/index.js"
import type { Exists } from "../Exists/index.js"
import type { HelpDoc } from "../Help/index.js"
import * as Help from "../Help/index.js"
import * as NewType from "../Internal/NewType/index.js"
import type { Path } from "./_internal/Path.js"
import type { Instruction, PrimType } from "./definition.js"

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

/**
 * @ets_tagtimize identity
 */
export function instruction<A>(self: PrimType<A>): Instruction {
  // @ts-expect-error
  return self
}

/**
 * Returns the type name for the specified `PrimType`.
 */
export function typeName<A>(self: PrimType<A>): string {
  return matchTag_(instruction(self), {
    Bool: () => "boolean",
    Date: () => "date",
    Enumeration: (_) => "choice",
    Float: () => "float",
    Integer: () => "integer",
    Path: (_) =>
      matchTag_(_.pathType, {
        File: () => "file",
        Directory: () => "directory",
        Either: () => "path"
      }),
    Text: () => "text"
  })
}

/**
 * Returns the `HelpDoc` for the specified `PrimType`.
 */
export function helpDoc<A>(self: PrimType<A>): HelpDoc {
  return matchTag_(instruction(self), {
    Bool: () => Help.text("A true or false value."),
    Date: () => Help.text("A valid string representation of a date."),
    Enumeration: (_) =>
      Help.text(
        `One of the following cases: ${A.join_(A.map_(_.cases, Tp.get(0)), ", ")}`
      ),
    Float: () => Help.text("A floating point number."),
    Integer: () => Help.text("An integer."),
    Path: (_) =>
      matchTag_(_.shouldExist, {
        Yes: () =>
          matchTag_(_.pathType, {
            File: () => Help.text("An existing file."),
            Directory: () => Help.text("An existing directory."),
            Either: () => Help.text("An existing file or directory.")
          }),
        No: () =>
          matchTag_(_.pathType, {
            File: () => Help.text("A file that must not exist."),
            Directory: () => Help.text("A directory that must not exist."),
            Either: () => Help.text("A file or directory that must not exist.")
          }),
        Either: () =>
          matchTag_(_.pathType, {
            File: () => Help.text("A file."),
            Directory: () => Help.text("A directory."),
            Either: () => Help.text("A file or directory.")
          })
      }),
    Text: () => Help.text("A user-defined piece of text.")
  })
}

/**
 * Returns the valid choices for the specified `PrimType`.
 */
export function choices<A>(self: PrimType<A>): Option<string> {
  const I = instruction(self)
  return I._tag === "Enumeration"
    ? O.some(A.join_(A.map_(I.cases, Tp.get(0)), " | "))
    : O.none
}

/**
 * Validate the provided value against the specified `PrimType`.
 */
export function validate_<A>(
  self: PrimType<A>,
  value: Option<string>,
  config: CliConfig = Config.defaultConfig
): T.IO<string, A> {
  return matchTag_(instruction(self), {
    Bool: (_) =>
      pipe(
        O.map_(value, (text) => Config.normalizeCase_(config, text)),
        O.fold(
          () =>
            T.orElseFail_(
              T.fromOption(_.defaultValue),
              `Missing default value for boolean parameter`
            ),
          (a) =>
            ["true", "1", "y", "yes", "on"].indexOf(a) !== -1
              ? T.succeed(true)
              : ["false", "0", "n", "no", "off"].indexOf(a) !== -1
              ? T.succeed(false)
              : T.fail(`'${a}' was not recognized as a valid boolean`)
        )
      ),
    Date: () =>
      attemptParse(
        value,
        (u) => {
          const ms = globalThis.Date.parse(u)
          return Number.isNaN(ms)
            ? T.fail("invalid date")
            : T.succeed(new globalThis.Date(ms))
        },
        "date"
      ),
    Enumeration: (_) =>
      pipe(
        T.fromOption(value),
        T.orElseFail("Enumeration options do not have a default value"),
        T.chain((value) =>
          pipe(
            _.cases,
            A.findFirstMap((c) => (c.get(0) === value ? O.some(c) : O.none)),
            O.fold(
              () =>
                T.fail(
                  "Expected one of the following cases: " +
                    A.join_(A.map_(_.cases, Tp.get(0)), ", ")
                ),
              (c) => T.succeed(c.get(1))
            )
          )
        )
      ),
    Float: () => attemptParse(value, NewType.parseFloat, "float"),
    Integer: () => attemptParse(value, NewType.parseInteger, "integer"),
    Path: (p) =>
      T.gen(function* (_) {
        const path = yield* _(
          T.orElseFail_(
            T.fromOption(value),
            "Path options do not have a default value."
          )
        )
        const exists = yield* _(p.fileSystem.exists(path))

        yield* _(validatePathExistence(path, p.shouldExist, exists))

        yield* _(
          T.when_(
            validatePathType(p, path),
            () => p.shouldExist._tag !== "No" && exists
          )
        )

        return path
      }),
    Text: () => attemptParse(value, T.succeed, "text")
  }) as T.IO<string, A>
}

/**
 * Validate the provided value against the specified `PrimType`.
 *
 * @ets_data_first validate_
 */
export function validate(
  value: Option<string>,
  config: CliConfig = Config.defaultConfig
) {
  return <A>(self: PrimType<A>): T.IO<string, A> => validate_(self, value, config)
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function attemptParse<E, A>(
  value: Option<string>,
  parser: (value: string) => T.IO<E, A>,
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

function validatePathExistence(
  path: string,
  expected: Exists,
  actual: boolean
): T.IO<string, void> {
  return matchTag_(
    expected,
    {
      No: () => (actual ? T.fail(`Path '${path}' must not exist.`) : T.unit),
      Yes: () => (actual ? T.unit : T.fail(`Path '${path}' must exist.`))
    },
    () => T.succeed(path)
  )
}

function validatePathType(self: Path, path: string): T.IO<string, void> {
  return matchTag_(self.pathType, {
    File: () =>
      T.unlessM_(
        T.fail(`Expected path '${path}' to be a regular file.`),
        self.fileSystem.isRegularFile(path)
      ),
    Directory: () =>
      T.unlessM_(
        T.fail(`Expected path '${path}' to be a directory.`),
        self.fileSystem.isDirectory(path)
      ),
    Either: () => T.unit
  })
}
