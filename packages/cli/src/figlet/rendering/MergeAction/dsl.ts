// ets_tracing: off

import * as DSL from "@effect-ts/core/Prelude/DSL"

import { Applicative } from "./instances"

// -----------------------------------------------------------------------------
// Instances
// -----------------------------------------------------------------------------

export const succeed = DSL.succeedF(Applicative)

export const ap = DSL.apF(Applicative)

export const tuple = DSL.tupleF(Applicative)

export const struct = DSL.tupleF(Applicative)
