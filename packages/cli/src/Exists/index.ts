// ets_tracing: off

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type Exists = Yes | No | Either

export class Yes {
  readonly _tag = "Yes"
}

export class No {
  readonly _tag = "No"
}

export class Either {
  readonly _tag = "Either"
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const yes: Exists = new Yes()

export const no: Exists = new No()

export const either: Exists = new Either()
