// ets_tracing: off

import * as DSL from "@effect-ts/core/Prelude/DSL"

import { Applicative, Covariant } from "./instances"

export const struct = DSL.structF(Applicative)

export const tuple = DSL.tupleF(Applicative)

export const { match, matchIn, matchMorph, matchTag, matchTagIn } =
  DSL.matchers(Covariant)

const branch = DSL.conditionalF(Covariant)
const branch_ = DSL.conditionalF_(Covariant)

export { branch as if, branch_ as if_ }
