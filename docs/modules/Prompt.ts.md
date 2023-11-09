---
title: Prompt.ts
nav_order: 15
parent: Modules
---

## Prompt overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [collecting & elements](#collecting--elements)
  - [all](#all)
- [combinators](#combinators)
  - [flatMap](#flatmap)
  - [map](#map)
- [constructors](#constructors)
  - [custom](#custom)
  - [float](#float)
  - [integer](#integer)
  - [select](#select)
  - [succeed](#succeed)
  - [text](#text)
- [execution](#execution)
  - [run](#run)
- [models](#models)
  - [Prompt (interface)](#prompt-interface)
- [symbols](#symbols)
  - [PromptTypeId](#prompttypeid)
  - [PromptTypeId (type alias)](#prompttypeid-type-alias)
- [utils](#utils)
  - [All (namespace)](#all-namespace)
    - [PromptAny (type alias)](#promptany-type-alias)
    - [Return (type alias)](#return-type-alias)
    - [ReturnIterable (type alias)](#returniterable-type-alias)
    - [ReturnTuple (type alias)](#returntuple-type-alias)
  - [Prompt (namespace)](#prompt-namespace)
    - [FloatOptions (interface)](#floatoptions-interface)
    - [IntegerOptions (interface)](#integeroptions-interface)
    - [SelectOptions (interface)](#selectoptions-interface)
    - [TextOptions (interface)](#textoptions-interface)
    - [Variance (interface)](#variance-interface)
    - [VarianceStruct (interface)](#variancestruct-interface)
    - [Action (type alias)](#action-type-alias)

---

# collecting & elements

## all

Runs all the provided prompts in sequence respecting the structure provided
in input.

Supports multiple arguments, a single argument tuple / array or record /
struct.

**Signature**

```ts
export declare const all: <const Arg extends Iterable<Prompt<any>>>(arg: Arg) => All.Return<Arg>
```

Added in v1.0.0

# combinators

## flatMap

**Signature**

```ts
export declare const flatMap: {
  <Output, Output2>(f: (output: Output) => Prompt<Output2>): (self: Prompt<Output>) => Prompt<Output2>
  <Output, Output2>(self: Prompt<Output>, f: (output: Output) => Prompt<Output2>): Prompt<Output2>
}
```

Added in v1.0.0

## map

**Signature**

```ts
export declare const map: {
  <Output, Output2>(f: (output: Output) => Output2): (self: Prompt<Output>) => Prompt<Output2>
  <Output, Output2>(self: Prompt<Output>, f: (output: Output) => Output2): Prompt<Output2>
}
```

Added in v1.0.0

# constructors

## custom

Creates a custom `Prompt` from the provided `render` and `process` functions
with the specified initial state.

The `render` function will be used to render the terminal prompt to a user
and is invoked at the beginning of each terminal render frame. The `process`
function is invoked immediately after a user presses a key.

**Signature**

```ts
export declare const custom: <State, Output>(
  initialState: State,
  render: (state: State, action: Prompt.Action<State, Output>) => Effect.Effect<never, never, string>,
  process: (input: Terminal.UserInput, state: State) => Effect.Effect<never, never, Prompt.Action<State, Output>>
) => Prompt<Output>
```

Added in v1.0.0

## float

**Signature**

```ts
export declare const float: (options: Prompt.FloatOptions) => Prompt<number>
```

Added in v1.0.0

## integer

**Signature**

```ts
export declare const integer: (options: Prompt.IntegerOptions) => Prompt<number>
```

Added in v1.0.0

## select

**Signature**

```ts
export declare const select: (options: Prompt.SelectOptions) => Prompt<string>
```

Added in v1.0.0

## succeed

Creates a `Prompt` which immediately succeeds with the specified value.

**NOTE**: This method will not attempt to obtain user input or render
anything to the screen.

**Signature**

```ts
export declare const succeed: <A>(value: A) => Prompt<A>
```

Added in v1.0.0

## text

**Signature**

```ts
export declare const text: (options: Prompt.TextOptions) => Prompt<string>
```

Added in v1.0.0

# execution

## run

Executes the specified `Prompt`.

**Signature**

```ts
export declare const run: <Output>(self: Prompt<Output>) => Effect.Effect<Terminal, never, Output>
```

Added in v1.0.0

# models

## Prompt (interface)

**Signature**

```ts
export interface Prompt<Output>
  extends Prompt.Variance<Output>,
    Pipeable.Pipeable,
    Effect.Effect<Terminal, never, Output> {}
```

Added in v1.0.0

# symbols

## PromptTypeId

**Signature**

```ts
export declare const PromptTypeId: typeof PromptTypeId
```

Added in v1.0.0

## PromptTypeId (type alias)

**Signature**

```ts
export type PromptTypeId = typeof PromptTypeId
```

Added in v1.0.0

# utils

## All (namespace)

Added in v1.0.0

### PromptAny (type alias)

**Signature**

```ts
export type PromptAny = Prompt<any>
```

Added in v1.0.0

### Return (type alias)

**Signature**

```ts
export type Return<Arg extends Iterable<PromptAny>> = [Arg] extends [ReadonlyArray<PromptAny>]
  ? ReturnTuple<Arg>
  : [Arg] extends [Iterable<PromptAny>]
  ? ReturnIterable<Arg>
  : never
```

Added in v1.0.0

### ReturnIterable (type alias)

**Signature**

```ts
export type ReturnIterable<T extends Iterable<PromptAny>> = [T] extends [Iterable<Prompt.Variance<infer A>>]
  ? Prompt<Array<A>>
  : never
```

Added in v1.0.0

### ReturnTuple (type alias)

**Signature**

```ts
export type ReturnTuple<T extends ReadonlyArray<unknown>> = Prompt<
  T[number] extends never ? [] : { -readonly [K in keyof T]: [T[K]] extends [Prompt.Variance<infer _A>] ? _A : never }
> extends infer X
  ? X
  : never
```

Added in v1.0.0

## Prompt (namespace)

Added in v1.0.0

### FloatOptions (interface)

**Signature**

```ts
export interface FloatOptions extends IntegerOptions {
  readonly precision?: number
}
```

Added in v1.0.0

### IntegerOptions (interface)

**Signature**

```ts
export interface IntegerOptions {
  readonly message: string
  readonly min?: number
  readonly max?: number
  readonly incrementBy?: number
  readonly decrementBy?: number
  readonly validate?: (value: number) => Effect.Effect<never, string, number>
}
```

Added in v1.0.0

### SelectOptions (interface)

**Signature**

```ts
export interface SelectOptions {
  readonly message: string
  readonly choices: ReadonlyArray<{
    readonly title: string
    readonly description?: string
    readonly value: string
  }>
}
```

Added in v1.0.0

### TextOptions (interface)

**Signature**

```ts
export interface TextOptions {
  readonly message: string
  readonly type?: "hidden" | "password" | "text"
  readonly default?: string
  readonly validate?: (value: string) => Effect.Effect<never, string, string>
}
```

Added in v1.0.0

### Variance (interface)

**Signature**

```ts
export interface Variance<Output> {
  readonly [PromptTypeId]: Prompt.VarianceStruct<Output>
}
```

Added in v1.0.0

### VarianceStruct (interface)

**Signature**

```ts
export interface VarianceStruct<Output> {
  readonly _Output: (_: never) => Output
}
```

Added in v1.0.0

### Action (type alias)

**Signature**

```ts
export type Action<State, Output> = PromptAction<State, Output>
```

Added in v1.0.0
