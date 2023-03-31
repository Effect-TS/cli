---
title: Options.ts
nav_order: 12
parent: Modules
---

## Options overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [alias](#alias)
  - [atLeast](#atleast)
  - [atMost](#atmost)
  - [between](#between)
  - [filterMap](#filtermap)
  - [optional](#optional)
  - [orElse](#orelse)
  - [orElseEither](#orelseeither)
  - [repeat](#repeat)
  - [repeat1](#repeat1)
  - [withDefault](#withdefault)
  - [withDescription](#withdescription)
- [constructors](#constructors)
  - [all](#all)
  - [boolean](#boolean)
  - [choice](#choice)
  - [date](#date)
  - [float](#float)
  - [integer](#integer)
  - [keyValueMap](#keyvaluemap)
  - [keyValueMapFromOption](#keyvaluemapfromoption)
  - [none](#none)
  - [text](#text)
- [getters](#getters)
  - [helpDoc](#helpdoc)
  - [uid](#uid)
  - [usage](#usage)
- [mapping](#mapping)
  - [map](#map)
  - [mapOrFail](#maporfail)
  - [mapTryCatch](#maptrycatch)
- [models](#models)
  - [Options (interface)](#options-interface)
- [predicates](#predicates)
  - [isBool](#isbool)
- [refinements](#refinements)
  - [isOptions](#isoptions)
- [symbols](#symbols)
  - [OptionsTypeId](#optionstypeid)
  - [OptionsTypeId (type alias)](#optionstypeid-type-alias)
- [validation](#validation)
  - [validate](#validate)
- [zipping](#zipping)
  - [zip](#zip)
  - [zipFlatten](#zipflatten)
  - [zipWith](#zipwith)

---

# combinators

## alias

**Signature**

```ts
export declare const alias: {
  (alias: string): <A>(self: Options<A>) => Options<A>
  <A>(self: Options<A>, alias: string): Options<A>
}
```

Added in v1.0.0

## atLeast

**Signature**

```ts
export declare const atLeast: {
  (times: 0): <A>(self: Options<A>) => Options<Chunk<A>>
  <A>(self: Options<A>, times: number): Options<Chunk<A>>
}
```

Added in v1.0.0

## atMost

**Signature**

```ts
export declare const atMost: {
  (times: number): <A>(self: Options<A>) => Options<Chunk<A>>
  <A>(self: Options<A>, times: number): Options<Chunk<A>>
}
```

Added in v1.0.0

## between

**Signature**

```ts
export declare const between: {
  (min: number, max: number): <A>(self: Options<A>) => Options<Chunk<A>>
  <A>(self: Options<A>, min: number, max: number): Options<Chunk<A>>
}
```

Added in v1.0.0

## filterMap

**Signature**

```ts
export declare const filterMap: {
  <A, B>(f: (a: A) => Option<B>, message: string): (self: Options<A>) => Options<B>
  <A, B>(self: Options<A>, f: (a: A) => Option<B>, message: string): Options<B>
}
```

Added in v1.0.0

## optional

**Signature**

```ts
export declare const optional: <A>(self: Options<A>) => Options<Option<A>>
```

Added in v1.0.0

## orElse

**Signature**

```ts
export declare const orElse: {
  <A>(that: Options<A>): <B>(self: Options<B>) => Options<A | B>
  <A, B>(self: Options<A>, that: Options<B>): Options<A | B>
}
```

Added in v1.0.0

## orElseEither

**Signature**

```ts
export declare const orElseEither: {
  <A>(that: Options<A>): <B>(self: Options<B>) => Options<Either<B, A>>
  <A, B>(self: Options<A>, that: Options<B>): Options<Either<B, A>>
}
```

Added in v1.0.0

## repeat

**Signature**

```ts
export declare const repeat: <A>(self: Options<A>) => Options<Chunk<A>>
```

Added in v1.0.0

## repeat1

**Signature**

```ts
export declare const repeat1: <A>(self: Options<A>) => Options<NonEmptyChunk<A>>
```

Added in v1.0.0

## withDefault

**Signature**

```ts
export declare const withDefault: {
  <A>(value: A): (self: Options<A>) => Options<A>
  <A>(self: Options<A>, value: A): Options<A>
}
```

Added in v1.0.0

## withDescription

**Signature**

```ts
export declare const withDescription: {
  (description: string): <A>(self: Options<A>) => Options<A>
  <A>(self: Options<A>, description: string): Options<A>
}
```

Added in v1.0.0

# constructors

## all

**Signature**

```ts
export declare const all: {
  <A, T extends readonly Options<any>[]>(self: Options<A>, ...args: T): Options<
    readonly [
      A,
      ...(T['length'] extends 0 ? [] : Readonly<{ [K in keyof T]: [T[K]] extends [Options<infer A>] ? A : never }>)
    ]
  >
  <T extends readonly Options<any>[]>(args: [...T]): Options<
    T[number] extends never ? [] : Readonly<{ [K in keyof T]: [T[K]] extends [Options<infer A>] ? A : never }>
  >
  <T extends Readonly<{ [K: string]: Options<any> }>>(args: T): Options<
    Readonly<{ [K in keyof T]: [T[K]] extends [Options<infer A>] ? A : never }>
  >
}
```

Added in v1.0.0

## boolean

**Signature**

```ts
export declare const boolean: (name: string, options?: Options.BooleanOptionConfig | undefined) => Options<boolean>
```

Added in v1.0.0

## choice

**Signature**

```ts
export declare const choice: <A, C extends readonly [readonly [string, A], ...(readonly [string, A])[]]>(
  name: string,
  choices: C
) => Options<A>
```

Added in v1.0.0

## date

**Signature**

```ts
export declare const date: (name: string) => Options<globalThis.Date>
```

Added in v1.0.0

## float

**Signature**

```ts
export declare const float: (name: string) => Options<number>
```

Added in v1.0.0

## integer

**Signature**

```ts
export declare const integer: (name: string) => Options<number>
```

Added in v1.0.0

## keyValueMap

**Signature**

```ts
export declare const keyValueMap: (name: string) => Options<HashMap<string, string>>
```

Added in v1.0.0

## keyValueMapFromOption

**Signature**

```ts
export declare const keyValueMapFromOption: (argumentOption: Options<string>) => Options<HashMap<string, string>>
```

Added in v1.0.0

## none

**Signature**

```ts
export declare const none: Options<void>
```

Added in v1.0.0

## text

**Signature**

```ts
export declare const text: (name: string) => Options<string>
```

Added in v1.0.0

# getters

## helpDoc

**Signature**

```ts
export declare const helpDoc: <A>(self: Options<A>) => any
```

Added in v1.0.0

## uid

**Signature**

```ts
export declare const uid: <A>(self: Options<A>) => Option<string>
```

Added in v1.0.0

## usage

**Signature**

```ts
export declare const usage: <A>(self: Options<A>) => any
```

Added in v1.0.0

# mapping

## map

**Signature**

```ts
export declare const map: {
  <A, B>(f: (a: A) => B): (self: Options<A>) => Options<B>
  <A, B>(self: Options<A>, f: (a: A) => B): Options<B>
}
```

Added in v1.0.0

## mapOrFail

**Signature**

```ts
export declare const mapOrFail: {
  <A, B>(f: (a: A) => Either<any, B>): (self: Options<A>) => Options<B>
  <A, B>(self: Options<A>, f: (a: A) => Either<any, B>): Options<B>
}
```

Added in v1.0.0

## mapTryCatch

**Signature**

```ts
export declare const mapTryCatch: {
  <A, B>(f: (a: A) => B, onError: (e: unknown) => any): (self: Options<A>) => Options<B>
  <A, B>(self: Options<A>, f: (a: A) => B, onError: (e: unknown) => any): Options<B>
}
```

Added in v1.0.0

# models

## Options (interface)

**Signature**

```ts
export interface Options<A> extends Options.Variance<A> {}
```

Added in v1.0.0

# predicates

## isBool

Returns `true` if the specified `Options` is a boolean flag, `false`
otherwise.

**Signature**

```ts
export declare const isBool: <A>(self: Options<A>) => boolean
```

Added in v1.0.0

# refinements

## isOptions

**Signature**

```ts
export declare const isOptions: (u: unknown) => u is Options<unknown>
```

Added in v1.0.0

# symbols

## OptionsTypeId

**Signature**

```ts
export declare const OptionsTypeId: typeof OptionsTypeId
```

Added in v1.0.0

## OptionsTypeId (type alias)

**Signature**

```ts
export type OptionsTypeId = typeof OptionsTypeId
```

Added in v1.0.0

# validation

## validate

**Signature**

```ts
export declare const validate: {
  (args: ReadonlyArray<string>, config: any): <A>(
    self: Options<A>
  ) => Effect<never, any, readonly [readonly string[], A]>
  <A>(self: Options<A>, args: ReadonlyArray<string>, config: any): Effect<never, any, readonly [readonly string[], A]>
}
```

Added in v1.0.0

# zipping

## zip

**Signature**

```ts
export declare const zip: {
  <B>(that: Options<B>): <A>(self: Options<A>) => Options<readonly [A, B]>
  <A, B>(self: Options<A>, that: Options<B>): Options<readonly [A, B]>
}
```

Added in v1.0.0

## zipFlatten

**Signature**

```ts
export declare const zipFlatten: {
  <B>(that: Options<B>): <A extends readonly any[]>(self: Options<A>) => Options<[...A, B]>
  <A extends readonly any[], B>(self: Options<A>, that: Options<B>): Options<[...A, B]>
}
```

Added in v1.0.0

## zipWith

**Signature**

```ts
export declare const zipWith: {
  <B, A, C>(that: Options<B>, f: (a: A, b: B) => C): (self: Options<A>) => Options<C>
  <A, B, C>(self: Options<A>, that: Options<B>, f: (a: A, b: B) => C): Options<C>
}
```

Added in v1.0.0
