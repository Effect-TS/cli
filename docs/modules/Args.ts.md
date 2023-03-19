---
title: Args.ts
nav_order: 1
parent: Modules
---

## Args overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [addDescription](#adddescription)
  - [atLeast](#atleast)
  - [atMost](#atmost)
  - [between](#between)
  - [repeat](#repeat)
  - [repeat1](#repeat1)
- [constructors](#constructors)
  - [boolean](#boolean)
  - [choice](#choice)
  - [date](#date)
  - [float](#float)
  - [integer](#integer)
  - [none](#none)
  - [text](#text)
- [getters](#getters)
  - [helpDoc](#helpdoc)
  - [maxSize](#maxsize)
  - [minSize](#minsize)
  - [uid](#uid)
  - [usage](#usage)
- [mapping](#mapping)
  - [map](#map)
  - [mapOrFail](#maporfail)
  - [mapTryCatch](#maptrycatch)
- [models](#models)
  - [Args (interface)](#args-interface)
- [refinements](#refinements)
  - [isArgs](#isargs)
- [symbols](#symbols)
  - [ArgsTypeId](#argstypeid)
  - [ArgsTypeId (type alias)](#argstypeid-type-alias)
- [validation](#validation)
  - [validate](#validate)
- [zipping](#zipping)
  - [zip](#zip)
  - [zipFlatten](#zipflatten)
  - [zipWith](#zipwith)

---

# combinators

## addDescription

**Signature**

```ts
export declare const addDescription: {
  (description: string): <A>(self: Args<A>) => Args<A>
  <A>(self: Args<A>, description: string): Args<A>
}
```

Added in v1.0.0

## atLeast

**Signature**

```ts
export declare const atLeast: {
  (times: number): <A>(self: Args<A>) => Args<Chunk<A>>
  <A>(self: Args<A>, times: number): Args<Chunk<A>>
}
```

Added in v1.0.0

## atMost

**Signature**

```ts
export declare const atMost: {
  (times: number): <A>(self: Args<A>) => Args<Chunk<A>>
  <A>(self: Args<A>, times: number): Args<Chunk<A>>
}
```

Added in v1.0.0

## between

**Signature**

```ts
export declare const between: {
  (min: number, max: number): <A>(self: Args<A>) => Args<Chunk<A>>
  <A>(self: Args<A>, min: number, max: number): Args<Chunk<A>>
}
```

Added in v1.0.0

## repeat

**Signature**

```ts
export declare const repeat: <A>(self: Args<A>) => Args<Chunk<A>>
```

Added in v1.0.0

## repeat1

**Signature**

```ts
export declare const repeat1: <A>(self: Args<A>) => Args<Chunk<A>>
```

Added in v1.0.0

# constructors

## boolean

Creates a boolean argument.

Can optionally provide a custom argument name (defaults to `"boolean"`).

**Signature**

```ts
export declare const boolean: (options?: Args.ArgsConfig | undefined) => Args<boolean>
```

Added in v1.0.0

## choice

Creates a choice argument.

Can optionally provide a custom argument name (defaults to `"choice"`).

**Signature**

```ts
export declare const choice: <A>(
  choices: readonly [[string, A], ...[string, A][]],
  config?: Args.ArgsConfig | undefined
) => Args<A>
```

Added in v1.0.0

## date

Creates a date argument.

Can optionally provide a custom argument name (defaults to `"date"`).

**Signature**

```ts
export declare const date: (config?: Args.ArgsConfig | undefined) => Args<globalThis.Date>
```

Added in v1.0.0

## float

Creates a floating point number argument.

Can optionally provide a custom argument name (defaults to `"float"`).

**Signature**

```ts
export declare const float: (config?: Args.ArgsConfig | undefined) => Args<number>
```

Added in v1.0.0

## integer

Creates an integer argument.

Can optionally provide a custom argument name (defaults to `"integer"`).

**Signature**

```ts
export declare const integer: (config?: Args.ArgsConfig | undefined) => Args<number>
```

Added in v1.0.0

## none

Creates an empty argument.

**Signature**

```ts
export declare const none: Args<void>
```

Added in v1.0.0

## text

Creates a text argument.

Can optionally provide a custom argument name (defaults to `"text"`).

**Signature**

```ts
export declare const text: (config?: Args.ArgsConfig | undefined) => Args<string>
```

Added in v1.0.0

# getters

## helpDoc

**Signature**

```ts
export declare const helpDoc: <A>(self: Args<A>) => any
```

Added in v1.0.0

## maxSize

**Signature**

```ts
export declare const maxSize: <A>(self: Args<A>) => number
```

Added in v1.0.0

## minSize

**Signature**

```ts
export declare const minSize: <A>(self: Args<A>) => number
```

Added in v1.0.0

## uid

**Signature**

```ts
export declare const uid: <A>(self: Args<A>) => Option<string>
```

Added in v1.0.0

## usage

**Signature**

```ts
export declare const usage: <A>(self: Args<A>) => any
```

Added in v1.0.0

# mapping

## map

**Signature**

```ts
export declare const map: {
  <A, B>(f: (a: A) => B): (self: Args<A>) => Args<B>
  <A, B>(self: Args<A>, f: (a: A) => B): Args<B>
}
```

Added in v1.0.0

## mapOrFail

**Signature**

```ts
export declare const mapOrFail: {
  <A, B>(f: (a: A) => Either<any, B>): (self: Args<A>) => Args<B>
  <A, B>(self: Args<A>, f: (a: A) => Either<any, B>): Args<B>
}
```

Added in v1.0.0

## mapTryCatch

**Signature**

```ts
export declare const mapTryCatch: {
  <A, B>(f: (a: A) => B, onError: (e: unknown) => any): (self: Args<A>) => Args<B>
  <A, B>(self: Args<A>, f: (a: A) => B, onError: (e: unknown) => any): Args<B>
}
```

Added in v1.0.0

# models

## Args (interface)

Represents arguments that can be passed to a command-line application.

**Signature**

```ts
export interface Args<A> extends Args.Variance<A> {}
```

Added in v1.0.0

# refinements

## isArgs

**Signature**

```ts
export declare const isArgs: (u: unknown) => u is Args<unknown>
```

Added in v1.0.0

# symbols

## ArgsTypeId

**Signature**

```ts
export declare const ArgsTypeId: typeof ArgsTypeId
```

Added in v1.0.0

## ArgsTypeId (type alias)

**Signature**

```ts
export type ArgsTypeId = typeof ArgsTypeId
```

Added in v1.0.0

# validation

## validate

**Signature**

```ts
export declare const validate: {
  (args: ReadonlyArray<string>): <A>(self: Args<A>) => Effect<never, any, readonly [readonly string[], A]>
  <A>(self: Args<A>, args: ReadonlyArray<string>): Effect<never, any, readonly [readonly string[], A]>
}
```

Added in v1.0.0

# zipping

## zip

**Signature**

```ts
export declare const zip: {
  <B>(that: Args<B>): <A>(self: Args<A>) => Args<readonly [A, B]>
  <A, B>(self: Args<A>, that: Args<B>): Args<readonly [A, B]>
}
```

Added in v1.0.0

## zipFlatten

**Signature**

```ts
export declare const zipFlatten: {
  <B>(that: Args<B>): <A extends readonly any[]>(self: Args<A>) => Args<[...A, B]>
  <A extends readonly any[], B>(self: Args<A>, that: Args<B>): Args<[...A, B]>
}
```

Added in v1.0.0

## zipWith

**Signature**

```ts
export declare const zipWith: {
  <B, A, C>(that: Args<B>, f: (a: A, b: B) => C): (self: Args<A>) => Args<C>
  <A, B, C>(self: Args<A>, that: Args<B>, f: (a: A, b: B) => C): Args<C>
}
```

Added in v1.0.0
