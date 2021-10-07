// ets_tracing: off

import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"

import type { MergeAction } from "./definition"
import { Continue, CurrentLast, Stop } from "./definition"

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

export function map_<A, B>(self: MergeAction<A>, f: (a: A) => B): MergeAction<B> {
  switch (self._tag) {
    case "Continue":
      return new Continue({ value: f(self.value) })
    case "CurrentLast":
      return new CurrentLast({ value: f(self.value) })
    case "Stop":
      return new Stop()
  }
}

/**
 * @ets_data_first map_
 */
export function map<A, B>(f: (a: A) => B) {
  return (self: MergeAction<A>): MergeAction<B> => map_(self, f)
}

export function zipBoth_<A, B>(
  fa: MergeAction<A>,
  fb: MergeAction<B>
): MergeAction<Tuple<[A, B]>> {
  if (fa._tag === "Stop" || fb._tag === "Stop") {
    return new Stop()
  }
  if (fa._tag === "Continue" && fb._tag === "Continue") {
    return new Continue({ value: Tp.tuple(fa.value, fb.value) })
  }
  return new CurrentLast({ value: Tp.tuple(fa.value, fb.value) })
}

/**
 * @ets_data_first zipBoth_
 */
export function zipBoth<B>(fb: MergeAction<B>) {
  return <A>(fa: MergeAction<A>): MergeAction<Tuple<[A, B]>> => zipBoth_(fa, fb)
}
