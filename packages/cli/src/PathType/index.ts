// ets_tracing: off

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Describes whether the command-line application wants a path to be a file
 * or a directory.
 */
export type PathType = File | Directory | Either

export class File {
  readonly _tag = "File"
}

export class Directory {
  readonly _tag = "Directory"
}

export class Either {
  readonly _tag = "Either"
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const file: PathType = new File()

export const directory: PathType = new Directory()

export const either: PathType = new Either()
