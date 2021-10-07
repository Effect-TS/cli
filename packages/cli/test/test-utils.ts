import * as T from "@effect-ts/core/Effect"

import type { FileSystem } from "../src/Internal/FileSystem"

// -----------------------------------------------------------------------------
// Mock FileSystem
// -----------------------------------------------------------------------------

export interface MockFileSystemOptions {
  readonly pathExists: boolean
  readonly pathIsDirectory: boolean
  readonly pathIsRegularFile: boolean
}

export function mockFileSystem(
  options: Partial<MockFileSystemOptions> = {}
): FileSystem {
  const defaultOptions: MockFileSystemOptions = {
    pathExists: true,
    pathIsDirectory: false,
    pathIsRegularFile: false
  }

  const { pathExists, pathIsDirectory, pathIsRegularFile } = {
    ...defaultOptions,
    ...options
  }

  return {
    exists: () => T.succeed(pathExists),
    isDirectory: () => T.succeed(pathIsDirectory),
    isRegularFile: () => T.succeed(pathIsRegularFile)
  }
}
