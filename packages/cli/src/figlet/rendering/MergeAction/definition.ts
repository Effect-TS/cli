// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * Represents the result of the merger of data like `SubColumns`.
 */
export type MergeAction<A> = Continue<A> | CurrentLast<A> | Stop

/**
 * Represents a "keep the value and continue" condition.
 */
export class Continue<A> extends Tagged("Continue")<{
  readonly value: A
}> {}

/**
 * Represents a "stop processing, keep use the value of the current iteration"
 * conditio.
 */
export class CurrentLast<A> extends Tagged("CurrentLast")<{
  readonly value: A
}> {}

/**
 * Represents a "stop processing, use value of last iteration" condition.
 */
export class Stop extends Tagged("Stop")<{}> {}

// -----------------------------------------------------------------------------
// Type Class
// -----------------------------------------------------------------------------

export const MergeActionURI = "@effect-ts/cli/figlet/Rendering/MergeAction"

export type MergeActionURI = typeof MergeActionURI

declare module "@effect-ts/core/Prelude/HKT" {
  interface URItoKind<FC, TC, K, Q, W, X, I, S, R, E, A> {
    readonly [MergeActionURI]: MergeAction<A>
  }
}
