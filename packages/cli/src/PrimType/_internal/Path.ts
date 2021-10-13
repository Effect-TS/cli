// ets_tracing: off

import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"
import { matchTag_ } from "@effect-ts/core/Utils"

import type { Exists } from "../../Exists"
import type { HelpDoc } from "../../Help"
import * as Help from "../../Help"
import { FileSystem } from "../../Internal/FileSystem"
import type { PathType } from "../../PathType"
import { Base } from "./Base"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A primitive type representing a file system path.
 */
export class Path extends Base<string> {
  readonly _tag = "Path"

  constructor(
    /**
     * Type of expected path
     * - `Directory` if the path is expected to be a directory
     * - `File` if the path is expected to be a regular file
     * - `Either` if both are acceptable.
     */
    readonly pathType: PathType,
    /**
     * Whether or not the path is expected to exist
     * - `Yes` if path is expected to exist
     * - `No` if the path is not expected to exist, or
     * - `Either` if either situation is acceptable
     */
    readonly exists: Exists,
    /**
     * An implementation of `FileSystem` interface.
     */
    readonly fileSystem: FileSystem = FileSystem
  ) {
    super()
  }
}

// -----------------------------------------------------------------------------
// Type Name
// -----------------------------------------------------------------------------

export function typeName(self: Path): string {
  return matchTag_(self.pathType, {
    File: () => "file",
    Directory: () => "directory",
    Either: () => "path"
  })
}

// -----------------------------------------------------------------------------
// HelpDoc
// -----------------------------------------------------------------------------

export function helpDoc(self: Path): HelpDoc {
  return matchTag_(self.exists, {
    Yes: () =>
      matchTag_(self.pathType, {
        File: () => Help.text("An existing file."),
        Directory: () => Help.text("An existing directory."),
        Either: () => Help.text("An existing file or directory.")
      }),
    No: () =>
      matchTag_(self.pathType, {
        File: () => Help.text("A file that must not exist."),
        Directory: () => Help.text("A directory that must not exist."),
        Either: () => Help.text("A file or directory that must not exist.")
      }),
    Either: () =>
      matchTag_(self.pathType, {
        File: () => Help.text("A file."),
        Directory: () => Help.text("A directory."),
        Either: () => Help.text("A file or directory.")
      })
  })
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

function refineExistence(value: string, expected: Exists) {
  return (actual: boolean): T.IO<string, string> => {
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

export function validate_(self: Path, value: Option<string>): T.IO<string, string> {
  return T.chain_(
    T.orElseFail_(T.fromOption(value), `Path options do not have a default value.`),
    (path) =>
      T.zipLeft_(
        T.chain_(self.fileSystem.exists(path), refineExistence(path, self.exists)),
        T.when_(
          matchTag_(self.pathType, {
            File: () =>
              T.unlessM_(
                T.fail(
                  `Expected path '${O.getOrElse_(value, () => "unknown")}' ` +
                    "to be a regular file."
                ),
                self.fileSystem.isRegularFile(path)
              ),
            Directory: () =>
              T.unlessM_(
                T.fail(
                  `Expected path '${O.getOrElse_(value, () => "unknown")}' ` +
                    "to be a directory."
                ),
                self.fileSystem.isDirectory(path)
              ),
            Either: () => T.unit
          }),
          () => self.exists._tag !== "No"
        )
      )
  )
}

/**
 * @ets_data_first validate_
 */
export function validate(value: Option<string>) {
  return (self: Path): T.IO<string, string> => validate_(self, value)
}
