---
title: Prompt.ts
nav_order: 14
parent: Modules
---

## Prompt overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [flatMap](#flatmap)
  - [map](#map)
- [constructors](#constructors)
  - [custom](#custom)
  - [succeed](#succeed)
  - [text](#text)
- [execution](#execution)
  - [run](#run)
- [models](#models)
  - [Prompt (interface)](#prompt-interface)
- [symbols](#symbols)
  - [PromptTypeId](#prompttypeid)
  - [PromptTypeId (type alias)](#prompttypeid-type-alias)

---

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
  render: (state: State, action: PromptAction<State, Output>) => Effect<never, never, string>,
  process: (input: Terminal.UserInput, state: State) => Effect<never, never, PromptAction<State, Output>>
) => Prompt<Output>
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
export declare const run: <Output>(self: Prompt<Output>) => Effect<Terminal, never, Output>
```

Added in v1.0.0

# models

## Prompt (interface)

**Signature**

```ts
export interface Prompt<Output> extends Prompt.Variance<Output> {}
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
