// ets_tracing: off

import type { URI } from "@effect-ts/core/Prelude"
import * as P from "@effect-ts/core/Prelude"

import type { OptionsURI } from "./definition.js"
import { None } from "./definition.js"
import { map, orElseEither_, zip } from "./operations.js"

export const Any = P.instance<P.Any<[URI<OptionsURI>]>>({
  any: () => new None()
})

export const AssociativeBoth = P.instance<P.AssociativeBoth<[URI<OptionsURI>]>>({
  both: zip
})

export const AssociativeEither = P.instance<P.AssociativeEither<[URI<OptionsURI>]>>({
  orElseEither: (fb) => (fa) => orElseEither_(fa, fb())
})

export const Covariant = P.instance<P.Covariant<[URI<OptionsURI>]>>({
  map
})

export const Applicative = P.instance<P.Applicative<[URI<OptionsURI>]>>({
  ...Any,
  ...Covariant,
  ...AssociativeBoth
})
