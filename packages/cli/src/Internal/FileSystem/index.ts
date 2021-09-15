// ets_tracing: off

import * as T from "@effect-ts/core/Effect"
import * as NodeJSFileSystem from "fs"

export interface FileSystem {
  readonly exists: (path: string) => T.UIO<boolean>
  readonly isRegularFile: (path: string) => T.UIO<boolean>
  readonly isDirectory: (path: string) => T.UIO<boolean>
}

export const FileSystem: FileSystem = {
  exists: (path) =>
    T.effectAsync<unknown, never, boolean>((cb) => {
      NodeJSFileSystem.stat(path, (err) => {
        if (err != null) {
          if (err.code === "ENOENT") {
            cb(T.succeed(false))
          } else {
            cb(T.die(err))
          }
        } else {
          cb(T.succeed(true))
        }
      })
    }),
  isRegularFile: (path) =>
    T.effectAsync<unknown, never, boolean>((cb) => {
      NodeJSFileSystem.stat(path, (err, stats) => {
        if (err != null) {
          if (err.code === "ENOENT") {
            cb(T.succeed(false))
          } else {
            cb(T.die(err))
          }
        } else {
          cb(T.succeed(stats.isFile()))
        }
      })
    }),
  isDirectory: (path) =>
    T.effectAsync<unknown, never, boolean>((cb) => {
      NodeJSFileSystem.stat(path, (err, stats) => {
        if (err != null) {
          if (err.code === "ENOENT") {
            cb(T.succeed(false))
          } else {
            cb(T.die(err))
          }
        } else {
          cb(T.succeed(stats.isDirectory()))
        }
      })
    })
}
