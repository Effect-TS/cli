import type * as RegularLanguage from "@effect/cli/Completion/RegularLanguage"
import * as primitive from "@effect/cli/internal_effect_untraced/primitive"
import { dual } from "@effect/data/Function"
import * as Option from "@effect/data/Option"

const toStringMap: {
  [K in RegularLanguage.RegularLanguage["_tag"]]: (
    self: Extract<RegularLanguage.RegularLanguage, { _tag: K }>
  ) => string
} = {
  Empty: () => "∅",
  Epsilon: () => "ε",
  StringToken: (self) => `StringToken(${self.value})`,
  AnyStringToken: () => "AnyStringToken",
  PrimitiveToken: (self) => `PrimitiveToken(${primitive.typeName(self.value)})`,
  Cat: (self) => {
    const left = toStringMap[self.left._tag](self.left as any)
    const right = toStringMap[self.right._tag](self.right as any)
    return `Cat(${left}, ${right})`
  },
  Alt: (self) => {
    const left = toStringMap[self.left._tag](self.left as any)
    const right = toStringMap[self.right._tag](self.right as any)
    return `Cat(${left}, ${right})`
  },
  Repeat: (self) => `Repeat(${toStringMap[self.language._tag](self.language as any)}, ${self.min}, ${self.max})`,
  Permutation: (self) => {
    const values = self.values.map((value) => toStringMap[value._tag](value as any)).join(", ")
    return `Permutation(${values})`
  }
}

const proto = {
  toString(this: RegularLanguage.RegularLanguage): string {
    return toStringMap[this._tag](this as any)
  }
}

/** @internal */
export const alt = dual<
  (
    that: string | RegularLanguage.RegularLanguage
  ) => (
    self: RegularLanguage.RegularLanguage
  ) => RegularLanguage.RegularLanguage,
  (
    self: RegularLanguage.RegularLanguage,
    that: string | RegularLanguage.RegularLanguage
  ) => RegularLanguage.RegularLanguage
>(2, (self, that) => {
  const op = Object.create(proto)
  op._tag = "Alt"
  op.left = self
  op.right = typeof that === "string" ? stringToken(that) : that
  return op
})

/** @internal */
export const atLeast = dual<
  (min: number) => (self: RegularLanguage.RegularLanguage) => RegularLanguage.RegularLanguage,
  (self: RegularLanguage.RegularLanguage, min: number) => RegularLanguage.RegularLanguage
>(2, (self, min) => rep(self, Option.some(min), Option.none()))

/** @internal */
export const atMost = dual<
  (max: number) => (self: RegularLanguage.RegularLanguage) => RegularLanguage.RegularLanguage,
  (self: RegularLanguage.RegularLanguage, max: number) => RegularLanguage.RegularLanguage
>(2, (self, max) => rep(self, Option.none(), Option.some(max)))

/** @internal */
export const between = dual<
  (min: number, max: number) => (self: RegularLanguage.RegularLanguage) => RegularLanguage.RegularLanguage,
  (self: RegularLanguage.RegularLanguage, min: number, max: number) => RegularLanguage.RegularLanguage
>(3, (self, min, max) => rep(self, Option.some(min), Option.some(max)))

/** @internal */
export const concat = dual<
  (
    that: string | RegularLanguage.RegularLanguage
  ) => (
    self: RegularLanguage.RegularLanguage
  ) => RegularLanguage.RegularLanguage,
  (
    self: RegularLanguage.RegularLanguage,
    that: string | RegularLanguage.RegularLanguage
  ) => RegularLanguage.RegularLanguage
>(2, (self, that) => {
  const op = Object.create(proto)
  op._tag = "Cat"
  op.left = self
  op.right = typeof that === "string" ? stringToken(that) : that
  return op
})

/** @internal */
export const empty: RegularLanguage.RegularLanguage = (() => {
  const op = Object.create(proto)
  op._tag = "Empty"
  return op
})()

/** @internal */
export const epsilon: RegularLanguage.RegularLanguage = (() => {
  const op = Object.create(proto)
  op._tag = "Epsilon"
  return op
})()

const isNullableMap: {
  [K in RegularLanguage.RegularLanguage["_tag"]]: (
    self: Extract<RegularLanguage.RegularLanguage, { _tag: K }>
  ) => boolean
} = {
  Empty: () => false,
  Epsilon: () => true,
  StringToken: () => false,
  AnyStringToken: () => false,
  PrimitiveToken: () => false,
  Cat: (self) => isNullableMap[self.left._tag](self.left as any) && isNullableMap[self.right._tag](self.right as any),
  Alt: (self) => isNullableMap[self.left._tag](self.left as any) || isNullableMap[self.right._tag](self.right as any),
  Repeat: (self) => Option.isNone(self.min) || self.min.value <= 0,
  Permutation: (self) => self.values.every((value) => isNullableMap[value._tag](value as any))
}

/** @internal */
export const isNullable = (self: RegularLanguage.RegularLanguage): boolean => isNullableMap[self._tag](self as any)

export const optional = (self: RegularLanguage.RegularLanguage): RegularLanguage.RegularLanguage => alt(self, epsilon)

/** @internal */
export const repeat = (self: RegularLanguage.RegularLanguage): RegularLanguage.RegularLanguage =>
  rep(self, Option.none(), Option.none())

/** @internal */
export const stringToken = (value: string): RegularLanguage.RegularLanguage => ({
  _tag: "StringToken",
  value
})

const rep = (
  self: RegularLanguage.RegularLanguage,
  min: Option.Option<number>,
  max: Option.Option<number>
): RegularLanguage.RegularLanguage => {
  const op = Object.create(proto)
  op._tag = "Repeat"
  op.language = self
  op.min = min
  op.max = max
  return op
}
