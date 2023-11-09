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
  - [atLeast](#atleast)
  - [atMost](#atmost)
  - [between](#between)
  - [repeated](#repeated)
  - [repeatedAtLeastOnce](#repeatedatleastonce)
- [constructors](#constructors)
  - [all](#all)
  - [boolean](#boolean)
  - [choice](#choice)
  - [date](#date)
  - [float](#float)
  - [integer](#integer)
  - [none](#none)
  - [text](#text)
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
- [utils](#utils)
  - [All (namespace)](#all-namespace)
    - [ArgsAny (type alias)](#argsany-type-alias)
    - [Return (type alias)](#return-type-alias)
    - [ReturnIterable (type alias)](#returniterable-type-alias)
    - [ReturnObject (type alias)](#returnobject-type-alias)
    - [ReturnTuple (type alias)](#returntuple-type-alias)
  - [Args (namespace)](#args-namespace)
    - [ArgsConfig (interface)](#argsconfig-interface)
    - [Variance (interface)](#variance-interface)

---

# combinators

## atLeast

**Signature**

```ts
export declare const atLeast: {
  (times: 0): <A>(self: Args<A>) => Args<readonly A[]>
  (times: number): <A>(self: Args<A>) => Args<readonly [A, ...A[]]>
  <A>(self: Args<A>, times: 0): Args<readonly A[]>
  <A>(self: Args<A>, times: number): Args<readonly [A, ...A[]]>
}
```

Added in v1.0.0

## atMost

**Signature**

```ts
export declare const atMost: {
  (times: number): <A>(self: Args<A>) => Args<readonly A[]>
  <A>(self: Args<A>, times: number): Args<readonly A[]>
}
```

Added in v1.0.0

## between

**Signature**

```ts
export declare const between: {
  (min: 0, max: number): <A>(self: Args<A>) => Args<readonly A[]>
  (min: number, max: number): <A>(self: Args<A>) => Args<readonly [A, ...A[]]>
  <A>(self: Args<A>, min: 0, max: number): Args<readonly A[]>
  <A>(self: Args<A>, min: number, max: number): Args<readonly [A, ...A[]]>
}
```

Added in v1.0.0

## repeated

**Signature**

```ts
export declare const repeated: <A>(self: Args<A>) => Args<readonly A[]>
```

Added in v1.0.0

## repeatedAtLeastOnce

**Signature**

```ts
export declare const repeatedAtLeastOnce: <A>(self: Args<A>) => Args<readonly [A, ...A[]]>
```

Added in v1.0.0

# constructors

## all

**Signature**

```ts
export declare const all: <const Arg extends Iterable<Args<any>> | Record<string, Args<any>>>(
  arg: Arg
) => All.Return<Arg>
```

Added in v1.0.0

## boolean

Creates a boolean argument.

Can optionally provide a custom argument name (defaults to `"boolean"`).

**Signature**

```ts
export declare const boolean: (options?: Args.ArgsConfig) => Args<boolean>
```

Added in v1.0.0

## choice

Creates a choice argument.

Can optionally provide a custom argument name (defaults to `"choice"`).

**Signature**

```ts
export declare const choice: <A>(choices: readonly [[string, A], ...[string, A][]], config?: Args.ArgsConfig) => Args<A>
```

Added in v1.0.0

## date

Creates a date argument.

Can optionally provide a custom argument name (defaults to `"date"`).

**Signature**

```ts
export declare const date: (config?: Args.ArgsConfig) => Args<globalThis.Date>
```

Added in v1.0.0

## float

Creates a floating point number argument.

Can optionally provide a custom argument name (defaults to `"float"`).

**Signature**

```ts
export declare const float: (config?: Args.ArgsConfig) => Args<number>
```

Added in v1.0.0

## integer

Creates an integer argument.

Can optionally provide a custom argument name (defaults to `"integer"`).

**Signature**

```ts
export declare const integer: (config?: Args.ArgsConfig) => Args<number>
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
export declare const text: (config?: Args.ArgsConfig) => Args<string>
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
  <A, B>(f: (a: A) => Either<HelpDoc, B>): (self: Args<A>) => Args<B>
  <A, B>(self: Args<A>, f: (a: A) => Either<HelpDoc, B>): Args<B>
}
```

Added in v1.0.0

## mapTryCatch

**Signature**

```ts
export declare const mapTryCatch: {
  <A, B>(f: (a: A) => B, onError: (e: unknown) => HelpDoc): (self: Args<A>) => Args<B>
  <A, B>(self: Args<A>, f: (a: A) => B, onError: (e: unknown) => HelpDoc): Args<B>
}
```

Added in v1.0.0

# models

## Args (interface)

Represents arguments that can be passed to a command-line application.

**Signature**

```ts
export interface Args<A> extends Args.Variance<A>, Parameter, Pipeable {
  get maxSize(): number
  get minSize(): number
  get identifier(): Option<string>
  get usage(): Usage
  validate(
    args: ReadonlyArray<string>,
    config: CliConfig
  ): Effect<never, ValidationError, readonly [ReadonlyArray<string>, A]>
  addDescription(description: string): Args<A>
}
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

# utils

## All (namespace)

Added in v1.0.0

### ArgsAny (type alias)

**Signature**

```ts
export type ArgsAny = Args<any>
```

Added in v1.0.0

### Return (type alias)

**Signature**

```ts
export type Return<Arg extends Iterable<ArgsAny> | Record<string, ArgsAny>> = [Arg] extends [ReadonlyArray<ArgsAny>]
  ? ReturnTuple<Arg>
  : [Arg] extends [Iterable<ArgsAny>]
  ? ReturnIterable<Arg>
  : [Arg] extends [Record<string, ArgsAny>]
  ? ReturnObject<Arg>
  : never
```

Added in v1.0.0

### ReturnIterable (type alias)

**Signature**

```ts
export type ReturnIterable<T extends Iterable<ArgsAny>> = [T] extends [Iterable<Args.Variance<infer A>>]
  ? Args<Array<A>>
  : never
```

Added in v1.0.0

### ReturnObject (type alias)

**Signature**

```ts
export type ReturnObject<T> = [T] extends [{ [K: string]: ArgsAny }]
  ? Args<{
      -readonly [K in keyof T]: [T[K]] extends [Args.Variance<infer _A>] ? _A : never
    }>
  : never
```

Added in v1.0.0

### ReturnTuple (type alias)

**Signature**

```ts
export type ReturnTuple<T extends ReadonlyArray<unknown>> = Args<
  T[number] extends never
    ? []
    : {
        -readonly [K in keyof T]: [T[K]] extends [Args.Variance<infer _A>] ? _A : never
      }
> extends infer X
  ? X
  : never
```

Added in v1.0.0

## Args (namespace)

Added in v1.0.0

### ArgsConfig (interface)

**Signature**

```ts
export interface ArgsConfig {
  readonly name?: string
}
```

Added in v1.0.0

### Variance (interface)

**Signature**

```ts
export interface Variance<A> {
  readonly [ArgsTypeId]: {
    readonly _A: (_: never) => A
  }
}
```

Added in v1.0.0
