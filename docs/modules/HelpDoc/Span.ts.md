---
title: HelpDoc/Span.ts
nav_order: 11
parent: Modules
---

## Span overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [concat](#concat)
  - [spans](#spans)
- [constructors](#constructors)
  - [code](#code)
  - [empty](#empty)
  - [error](#error)
  - [space](#space)
  - [strong](#strong)
  - [text](#text)
  - [uri](#uri)
  - [weak](#weak)
- [models](#models)
  - [Code (interface)](#code-interface)
  - [Error (interface)](#error-interface)
  - [Sequence (interface)](#sequence-interface)
  - [Span (type alias)](#span-type-alias)
  - [Strong (interface)](#strong-interface)
  - [Text (interface)](#text-interface)
  - [URI (interface)](#uri-interface)
  - [Weak (interface)](#weak-interface)

---

# combinators

## concat

**Signature**

```ts
export declare const concat: { (that: Span): (self: Span) => Span; (self: Span, that: Span): Span }
```

Added in v1.0.0

## spans

**Signature**

```ts
export declare const spans: (spans: Iterable<Span>) => Span
```

Added in v1.0.0

# constructors

## code

**Signature**

```ts
export declare const code: (value: string) => Span
```

Added in v1.0.0

## empty

**Signature**

```ts
export declare const empty: Span
```

Added in v1.0.0

## error

**Signature**

```ts
export declare const error: (value: string | Span) => Span
```

Added in v1.0.0

## space

**Signature**

```ts
export declare const space: Span
```

Added in v1.0.0

## strong

**Signature**

```ts
export declare const strong: (value: string | Span) => Span
```

Added in v1.0.0

## text

**Signature**

```ts
export declare const text: (value: string) => Span
```

Added in v1.0.0

## uri

**Signature**

```ts
export declare const uri: (value: string) => Span
```

Added in v1.0.0

## weak

**Signature**

```ts
export declare const weak: (value: string | Span) => Span
```

Added in v1.0.0

# models

## Code (interface)

**Signature**

```ts
export interface Code {
  readonly _tag: 'Code'
  readonly value: string
}
```

Added in v1.0.0

## Error (interface)

**Signature**

```ts
export interface Error {
  readonly _tag: 'Error'
  readonly value: Span
}
```

Added in v1.0.0

## Sequence (interface)

**Signature**

```ts
export interface Sequence {
  readonly _tag: 'Sequence'
  readonly left: Span
  readonly right: Span
}
```

Added in v1.0.0

## Span (type alias)

**Signature**

```ts
export type Span = Text | Code | Error | Weak | Strong | URI | Sequence
```

Added in v1.0.0

## Strong (interface)

**Signature**

```ts
export interface Strong {
  readonly _tag: 'Strong'
  readonly value: Span
}
```

Added in v1.0.0

## Text (interface)

**Signature**

```ts
export interface Text {
  readonly _tag: 'Text'
  readonly value: string
}
```

Added in v1.0.0

## URI (interface)

**Signature**

```ts
export interface URI {
  readonly _tag: 'URI'
  readonly value: string
}
```

Added in v1.0.0

## Weak (interface)

**Signature**

```ts
export interface Weak {
  readonly _tag: 'Weak'
  readonly value: Span
}
```

Added in v1.0.0
