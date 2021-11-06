// ets_tracing: off

import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
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
    readonly shouldExist: Exists,
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
  return matchTag_(self.shouldExist, {
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

function validateExistence(
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

export function validate_(self: Path, value: Option<string>): T.IO<string, string> {
  return T.gen(function* (_) {
    const path = yield* _(
      T.orElseFail_(T.fromOption(value), "Path options do not have a default value.")
    )
    const exists = yield* _(self.fileSystem.exists(path))

    yield* _(validateExistence(path, self.shouldExist, exists))

    yield* _(validatePathType(self, path))

    return path
  })
}

/**
 * @ets_data_first validate_
 */
export function validate(value: Option<string>) {
  return (self: Path): T.IO<string, string> => validate_(self, value)
}
