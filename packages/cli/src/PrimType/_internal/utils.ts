import * as T from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"

export function attemptParse<E, A>(
  value: Option<string>,
  parser: (value: string) => T.IO<E, A>,
  typeName: string
): T.IO<string, A> {
  return T.chain_(
    T.orElseFail_(
      T.fromOption(value),
      `${typeName} options do not have a default value`
    ),
    (value) => T.orElseFail_(parser(value), `'${value}' is not a ${typeName}`)
  )
}
