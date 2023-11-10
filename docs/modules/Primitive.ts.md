---
title: Primitive.ts
nav_order: 15
parent: Modules
---

## Primitive overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Predicates](#predicates)
  - [isBool](#isbool)
- [constructors](#constructors)
  - [boolean](#boolean)
  - [choice](#choice)
  - [date](#date)
  - [float](#float)
  - [integer](#integer)
  - [text](#text)
- [models](#models)
  - [Primitive (interface)](#primitive-interface)
- [symbol](#symbol)
  - [PrimitiveTypeId](#primitivetypeid)
  - [PrimitiveTypeId (type alias)](#primitivetypeid-type-alias)
- [utils](#utils)
  - [Primitive (namespace)](#primitive-namespace)
    - [Variance (interface)](#variance-interface)
    - [PathExists (type alias)](#pathexists-type-alias)
    - [PathType (type alias)](#pathtype-type-alias)
    - [ValueType (type alias)](#valuetype-type-alias)

---

# Predicates

## isBool

**Signature**

```ts
export declare const isBool: <A>(self: Primitive<A>) => boolean
```

Added in v1.0.0

# constructors

## boolean

**Signature**

```ts
export declare const boolean: (defaultValue: Option<boolean>) => Primitive<boolean>
```

Added in v1.0.0

## choice

**Signature**

```ts
export declare const choice: <A>(alternatives: readonly [[string, A], ...[string, A][]]) => Primitive<A>
```

Added in v1.0.0

## date

**Signature**

```ts
export declare const date: Primitive<Date>
```

Added in v1.0.0

## float

**Signature**

```ts
export declare const float: Primitive<number>
```

Added in v1.0.0

## integer

**Signature**

```ts
export declare const integer: Primitive<number>
```

Added in v1.0.0

## text

**Signature**

```ts
export declare const text: Primitive<string>
```

Added in v1.0.0

# models

## Primitive (interface)

A `Primitive` represents the primitive types supported by Effect CLI.

Each primitive type has a way to parse and validate from a string.

**Signature**

```ts
export interface Primitive<A> extends Primitive.Variance<A> {
  get typeName(): string
  get help(): Span
  get choices(): Option<string>
  validate(value: Option<string>, config: CliConfig): Effect<FileSystem, string, A>
}
```

Added in v1.0.0

# symbol

## PrimitiveTypeId

**Signature**

```ts
export declare const PrimitiveTypeId: typeof PrimitiveTypeId
```

Added in v1.0.0

## PrimitiveTypeId (type alias)

**Signature**

```ts
export type PrimitiveTypeId = typeof PrimitiveTypeId
```

Added in v1.0.0

# utils

## Primitive (namespace)

Added in v1.0.0

### Variance (interface)

**Signature**

```ts
export interface Variance<A> extends Pipeable {
  readonly [PrimitiveTypeId]: {
    readonly _A: (_: never) => A
  }
}
```

Added in v1.0.0

### PathExists (type alias)

**Signature**

```ts
export type PathExists = "yes" | "no" | "either"
```

Added in v1.0.0

### PathType (type alias)

**Signature**

```ts
export type PathType = "file" | "directory" | "either"
```

Added in v1.0.0

### ValueType (type alias)

**Signature**

```ts
export type ValueType<P> = [P] extends [
  {
    readonly [PrimitiveTypeId]: {
      readonly _A: (_: never) => infer A
    }
  }
]
  ? A
  : never
```

Added in v1.0.0
