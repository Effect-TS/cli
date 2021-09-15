// ets_tracing: off

import * as T from "@effect-ts/core/Effect"

export interface FloatBrand {
  readonly Float: unique symbol
}

export type Float = number & FloatBrand

export function isFloat(n: number): n is Float {
  return Number.isFinite(n)
}

export function parseFloat(s: string): T.IO<string, Float> {
  const n = Number.parseFloat(s)
  return !Number.isNaN(n) && isFloat(n)
    ? T.succeed(n)
    : T.fail(`Unable to parse float from "${s}"`)
}
