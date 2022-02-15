// ets_tracing: off

import type { Exists } from "../../Exists/index.js"
import { FileSystem } from "../../Internal/FileSystem/index.js"
import type { PathType } from "../../PathType/index.js"
import { Base } from "./Base.js"

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
