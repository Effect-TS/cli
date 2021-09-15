// ets_tracing: off

import * as T from "@effect-ts/core/Effect"

export interface IntegerBrand {
  readonly Integer: unique symbol
}

export type Integer = number & IntegerBrand

export function isInteger(n: number): n is Integer {
  return Number.isInteger(n)
}

export function parseInteger(s: string): T.IO<string, Integer> {
  const n = Number.parseFloat(s)
  return !Number.isNaN(n) && isInteger(n)
    ? T.succeed(n)
    : T.fail(`Unable to parse integer from "${s}"`)
}
