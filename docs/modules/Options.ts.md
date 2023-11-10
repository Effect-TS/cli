---
title: Options.ts
nav_order: 13
parent: Modules
---

## Options overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [filterMap](#filtermap)
  - [isBool](#isbool)
  - [map](#map)
  - [mapOrFail](#maporfail)
  - [mapTryCatch](#maptrycatch)
  - [optional](#optional)
  - [orElse](#orelse)
  - [orElseEither](#orelseeither)
  - [toRegularLanguage](#toregularlanguage)
  - [validate](#validate)
  - [withAlias](#withalias)
  - [withDefault](#withdefault)
  - [withDescription](#withdescription)
  - [withPseudoName](#withpseudoname)
- [constructors](#constructors)
  - [all](#all)
  - [boolean](#boolean)
  - [choice](#choice)
  - [choiceWithValue](#choicewithvalue)
  - [date](#date)
  - [directory](#directory)
  - [file](#file)
  - [float](#float)
  - [integer](#integer)
  - [keyValueMap](#keyvaluemap)
  - [none](#none)
  - [text](#text)
- [models](#models)
  - [Options (interface)](#options-interface)
- [refinements](#refinements)
  - [isOptions](#isoptions)
- [symbols](#symbols)
  - [OptionsTypeId](#optionstypeid)
  - [OptionsTypeId (type alias)](#optionstypeid-type-alias)
- [utils](#utils)
  - [All (namespace)](#all-namespace)
    - [OptionsAny (type alias)](#optionsany-type-alias)
    - [Return (type alias)](#return-type-alias)
    - [ReturnIterable (type alias)](#returniterable-type-alias)
    - [ReturnObject (type alias)](#returnobject-type-alias)
    - [ReturnTuple (type alias)](#returntuple-type-alias)
  - [Options (namespace)](#options-namespace)
    - [BooleanOptionsConfig (interface)](#booleanoptionsconfig-interface)
    - [PathOptionsConfig (interface)](#pathoptionsconfig-interface)
    - [Variance (interface)](#variance-interface)

---

# combinators

## filterMap

**Signature**

```ts
export declare const filterMap: {
  <A, B>(f: (a: A) => Option<B>, message: string): (self: Options<A>) => Options<B>
  <A, B>(self: Options<A>, f: (a: A) => Option<B>, message: string): Options<B>
}
```

Added in v1.0.0

## isBool

Returns `true` if the specified `Options` is a boolean flag, `false`
otherwise.

**Signature**

```ts
export declare const isBool: <A>(self: Options<A>) => boolean
```

Added in v1.0.0

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
  <A, B>(f: (a: A) => Either<ValidationError, B>): (self: Options<A>) => Options<B>
  <A, B>(self: Options<A>, f: (a: A) => Either<ValidationError, B>): Options<B>
}
```

Added in v1.0.0

## mapTryCatch

**Signature**

```ts
export declare const mapTryCatch: {
  <A, B>(f: (a: A) => B, onError: (e: unknown) => HelpDoc): (self: Options<A>) => Options<B>
  <A, B>(self: Options<A>, f: (a: A) => B, onError: (e: unknown) => HelpDoc): Options<B>
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

## toRegularLanguage

Returns a `RegularLanguage` whose accepted language is equivalent to the language accepted by the provided
`Options`.

**Signature**

```ts
export declare const toRegularLanguage: <A>(self: Options<A>) => RegularLanguage
```

Added in v1.0.0

## validate

**Signature**

```ts
export declare const validate: {
  (
    args: ReadonlyArray<string>,
    config: CliConfig
  ): <A>(
    self: Options<A>
  ) => Effect<FileSystem, ValidationError, readonly [Option<ValidationError>, readonly string[], A]>
  <A>(
    self: Options<A>,
    args: ReadonlyArray<string>,
    config: CliConfig
  ): Effect<FileSystem, ValidationError, readonly [Option<ValidationError>, readonly string[], A]>
}
```

Added in v1.0.0

## withAlias

**Signature**

```ts
export declare const withAlias: {
  (alias: string): <A>(self: Options<A>) => Options<A>
  <A>(self: Options<A>, alias: string): Options<A>
}
```

Added in v1.0.0

## withDefault

**Signature**

```ts
export declare const withDefault: {
  <A>(fallback: A): (self: Options<A>) => Options<A>
  <A>(self: Options<A>, fallback: A): Options<A>
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

## withPseudoName

**Signature**

```ts
export declare const withPseudoName: {
  (pseudoName: string): <A>(self: Options<A>) => Options<A>
  <A>(self: Options<A>, pseudoName: string): Options<A>
}
```

Added in v1.0.0

# constructors

## all

**Signature**

```ts
export declare const all: <const Arg extends Iterable<Options<any>> | Record<string, Options<any>>>(
  arg: Arg
) => All.Return<Arg>
```

Added in v1.0.0

## boolean

**Signature**

```ts
export declare const boolean: (name: string, options?: Options.BooleanOptionsConfig) => Options<boolean>
```

Added in v1.0.0

## choice

Constructs command-line `Options` that represent a choice between several
inputs. The input will be mapped to it's associated value during parsing.

**Signature**

```ts
export declare const choice: <A extends string, C extends readonly [A, ...A[]]>(
  name: string,
  choices: C
) => Options<C[number]>
```

**Example**

```ts
import * as Options from "@effect/cli/Options"

export const animal: Options.Options<"dog" | "cat"> = Options.choice("animal", ["dog", "cat"])
```

Added in v1.0.0

## choiceWithValue

Constructs command-line `Options` that represent a choice between several
inputs. The input will be mapped to it's associated value during parsing.

**Signature**

```ts
export declare const choiceWithValue: <C extends readonly [[string, any], ...[string, any][]]>(
  name: string,
  choices: C
) => Options<C[number][1]>
```

**Example**

```ts
import * as Options from "@effect/cli/Options"
import * as Data from "effect/Data"

export type Animal = Dog | Cat

export interface Dog extends Data.Case {
  readonly _tag: "Dog"
}

export const Dog = Data.tagged<Dog>("Dog")

export interface Cat extends Data.Case {
  readonly _tag: "Cat"
}

export const Cat = Data.tagged<Cat>("Cat")

export const animal: Options.Options<Animal> = Options.choiceWithValue("animal", [
  ["dog", Dog()],
  ["cat", Cat()]
])
```

Added in v1.0.0

## date

**Signature**

```ts
export declare const date: (name: string) => Options<globalThis.Date>
```

Added in v1.0.0

## directory

Creates a parameter expecting path to a directory.

**Signature**

```ts
export declare const directory: (name: string, config: Options.PathOptionsConfig) => Options<string>
```

Added in v1.0.0

## file

Creates a parameter expecting path to a file.

**Signature**

```ts
export declare const file: (name: string, config: Options.PathOptionsConfig) => Options<string>
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

# models

## Options (interface)

**Signature**

```ts
export interface Options<A> extends Options.Variance<A>, Parameter, Pipeable {
  get identifier(): Option<string>
  get usage(): Usage
  get flattened(): ReadonlyArray<Input>
  validate(args: HashMap<string, ReadonlyArray<string>>, config: CliConfig): Effect<FileSystem, ValidationError, A>
  /** @internal */
  modifySingle(f: <_>(single: InternalOptions.Single<_>) => InternalOptions.Single<_>): Options<A>
}
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

# utils

## All (namespace)

Added in v1.0.0

### OptionsAny (type alias)

**Signature**

```ts
export type OptionsAny = Options<any>
```

Added in v1.0.0

### Return (type alias)

**Signature**

```ts
export type Return<Arg extends Iterable<OptionsAny> | Record<string, OptionsAny>> = [Arg] extends [
  ReadonlyArray<OptionsAny>
]
  ? ReturnTuple<Arg>
  : [Arg] extends [Iterable<OptionsAny>]
  ? ReturnIterable<Arg>
  : [Arg] extends [Record<string, OptionsAny>]
  ? ReturnObject<Arg>
  : never
```

Added in v1.0.0

### ReturnIterable (type alias)

**Signature**

```ts
export type ReturnIterable<T extends Iterable<OptionsAny>> = [T] extends [Iterable<Options.Variance<infer A>>]
  ? Options<Array<A>>
  : never
```

Added in v1.0.0

### ReturnObject (type alias)

**Signature**

```ts
export type ReturnObject<T> = [T] extends [{ [K: string]: OptionsAny }]
  ? Options<{
      -readonly [K in keyof T]: [T[K]] extends [Options.Variance<infer _A>] ? _A : never
    }>
  : never
```

Added in v1.0.0

### ReturnTuple (type alias)

**Signature**

```ts
export type ReturnTuple<T extends ReadonlyArray<unknown>> = Options<
  T[number] extends never
    ? []
    : {
        -readonly [K in keyof T]: [T[K]] extends [Options.Variance<infer _A>] ? _A : never
      }
> extends infer X
  ? X
  : never
```

Added in v1.0.0

## Options (namespace)

Added in v1.0.0

### BooleanOptionsConfig (interface)

**Signature**

```ts
export interface BooleanOptionsConfig {
  readonly ifPresent?: boolean
  readonly negationNames?: NonEmptyReadonlyArray<string>
  readonly aliases?: NonEmptyReadonlyArray<string>
}
```

Added in v1.0.0

### PathOptionsConfig (interface)

**Signature**

```ts
export interface PathOptionsConfig {
  readonly exists?: Primitive.PathExists
}
```

Added in v1.0.0

### Variance (interface)

**Signature**

```ts
export interface Variance<A> {
  readonly [OptionsTypeId]: {
    _A: (_: never) => A
  }
}
```

Added in v1.0.0
