---
title: Primitive.ts
nav_order: 13
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
- [getters](#getters)
  - [choices](#choices)
  - [helpDoc](#helpdoc)
  - [typeName](#typename)
- [models](#models)
  - [Bool (interface)](#bool-interface)
  - [Choice (interface)](#choice-interface)
  - [Date (interface)](#date-interface)
  - [Float (interface)](#float-interface)
  - [Integer (interface)](#integer-interface)
  - [Primitive (type alias)](#primitive-type-alias)
  - [Text (interface)](#text-interface)
- [symbol](#symbol)
  - [PrimitiveTypeId](#primitivetypeid)
  - [PrimitiveTypeId (type alias)](#primitivetypeid-type-alias)
- [validation](#validation)
  - [validate](#validate)

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
export declare const choice: <A>(choices: readonly [readonly [string, A], ...(readonly [string, A])[]]) => Primitive<A>
```

Added in v1.0.0

## date

**Signature**

```ts
export declare const date: Primitive<globalThis.Date>
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

# getters

## choices

**Signature**

```ts
export declare const choices: <A>(self: Primitive<A>) => Option<string>
```

Added in v1.0.0

## helpDoc

**Signature**

```ts
export declare const helpDoc: <A>(self: Primitive<A>) => any
```

Added in v1.0.0

## typeName

**Signature**

```ts
export declare const typeName: <A>(self: Primitive<A>) => string
```

Added in v1.0.0

# models

## Bool (interface)

Represents a boolean value.

True values can be passed as one of: `["true", "1", "y", "yes" or "on"]`.
False value can be passed as one of: `["false", "o", "n", "no" or "off"]`.

**Signature**

```ts
export interface Bool extends Primitive.Variance<boolean> {
  readonly _tag: 'Bool'
  /**
   * The default value to use if the parameter is not provided.
   */
  readonly defaultValue: Option<boolean>
}
```

Added in v1.0.0

## Choice (interface)

Represents a value selected from set of allowed values.

**Signature**

```ts
export interface Choice<A> extends Primitive.Variance<A> {
  readonly _tag: 'Choice'
  /**
   * The list of allowed parameter-value pairs.
   */
  readonly choices: NonEmptyReadonlyArray<readonly [string, A]>
}
```

Added in v1.0.0

## Date (interface)

Represents a date in ISO-8601 format, such as `2007-12-03T10:15:30`.

**Signature**

```ts
export interface Date extends Primitive.Variance<globalThis.Date> {
  readonly _tag: 'Date'
}
```

Added in v1.0.0

## Float (interface)

Represents a floating point number.

**Signature**

```ts
export interface Float extends Primitive.Variance<number> {
  readonly _tag: 'Float'
}
```

Added in v1.0.0

## Integer (interface)

Represents an integer.

**Signature**

```ts
export interface Integer extends Primitive.Variance<number> {
  readonly _tag: 'Integer'
}
```

Added in v1.0.0

## Primitive (type alias)

A `Primitive` represents the primitive types supported by Effect CLI.

Each primitive type has a way to parse and validate from a string.

**Signature**

```ts
export type Primitive<A> = Bool | Date | Choice<A> | Float | Integer | Text
```

Added in v1.0.0

## Text (interface)

Represents a string value.

**Signature**

```ts
export interface Text extends Primitive.Variance<string> {
  readonly _tag: 'Text'
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

# validation

## validate

**Signature**

```ts
export declare const validate: {
  (value: Option<string>): <A>(self: Primitive<A>) => Effect<never, string, A>
  <A>(self: Primitive<A>, value: Option<string>): Effect<never, string, A>
}
```

Added in v1.0.0
