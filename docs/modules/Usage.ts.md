---
title: Usage.ts
nav_order: 15
parent: Modules
---

## Usage overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [alternation](#alternation)
  - [concat](#concat)
  - [helpDoc](#helpdoc)
  - [optional](#optional)
  - [repeated](#repeated)
- [constructors](#constructors)
  - [empty](#empty)
  - [mixed](#mixed)
  - [named](#named)
- [models](#models)
  - [Alternation (interface)](#alternation-interface)
  - [Concat (interface)](#concat-interface)
  - [Empty (interface)](#empty-interface)
  - [Mixed (interface)](#mixed-interface)
  - [Named (interface)](#named-interface)
  - [Optional (interface)](#optional-interface)
  - [Repeated (interface)](#repeated-interface)
  - [Usage (type alias)](#usage-type-alias)

---

# combinators

## alternation

**Signature**

```ts
export declare const alternation: { (that: Usage): (self: Usage) => Usage; (self: Usage, that: Usage): Usage }
```

Added in v1.0.0

## concat

**Signature**

```ts
export declare const concat: { (that: Usage): (self: Usage) => Usage; (self: Usage, that: Usage): Usage }
```

Added in v1.0.0

## helpDoc

**Signature**

```ts
export declare const helpDoc: (self: Usage) => any
```

Added in v1.0.0

## optional

**Signature**

```ts
export declare const optional: (self: Usage) => Usage
```

Added in v1.0.0

## repeated

**Signature**

```ts
export declare const repeated: (self: Usage) => Usage
```

Added in v1.0.0

# constructors

## empty

**Signature**

```ts
export declare const empty: Usage
```

Added in v1.0.0

## mixed

**Signature**

```ts
export declare const mixed: Usage
```

Added in v1.0.0

## named

**Signature**

```ts
export declare const named: (names: Chunk<string>, acceptedValues: Option<string>) => Usage
```

Added in v1.0.0

# models

## Alternation (interface)

**Signature**

```ts
export interface Alternation {
  readonly _tag: 'Alternation'
  readonly left: Usage
  readonly right: Usage
}
```

Added in v1.0.0

## Concat (interface)

**Signature**

```ts
export interface Concat {
  readonly _tag: 'Concat'
  readonly left: Usage
  readonly right: Usage
}
```

Added in v1.0.0

## Empty (interface)

**Signature**

```ts
export interface Empty {
  readonly _tag: 'Empty'
}
```

Added in v1.0.0

## Mixed (interface)

**Signature**

```ts
export interface Mixed {
  readonly _tag: 'Mixed'
}
```

Added in v1.0.0

## Named (interface)

**Signature**

```ts
export interface Named {
  readonly _tag: 'Named'
  readonly names: Chunk<string>
  readonly acceptedValues: Option<string>
}
```

Added in v1.0.0

## Optional (interface)

**Signature**

```ts
export interface Optional {
  readonly _tag: 'Optional'
  readonly usage: Usage
}
```

Added in v1.0.0

## Repeated (interface)

**Signature**

```ts
export interface Repeated {
  readonly _tag: 'Repeated'
  readonly usage: Usage
}
```

Added in v1.0.0

## Usage (type alias)

**Signature**

```ts
export type Usage = Empty | Mixed | Named | Optional | Repeated | Alternation | Concat
```

Added in v1.0.0
