---
title: Prompt/Action.ts
nav_order: 14
parent: Modules
---

## Action overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [beep](#beep)
  - [error](#error)
  - [nextFrame](#nextframe)
  - [submit](#submit)
- [models](#models)
  - [Beep (interface)](#beep-interface)
  - [Error (interface)](#error-interface)
  - [NextFrame (interface)](#nextframe-interface)
  - [PromptAction (type alias)](#promptaction-type-alias)
  - [Submit (interface)](#submit-interface)

---

# constructors

## beep

**Signature**

```ts
export declare const beep: PromptAction<never, never>
```

Added in v1.0.0

## error

**Signature**

```ts
export declare const error: (message: string) => PromptAction<never, never>
```

Added in v1.0.0

## nextFrame

**Signature**

```ts
export declare const nextFrame: <State>(state: State) => PromptAction<State, never>
```

Added in v1.0.0

## submit

**Signature**

```ts
export declare const submit: <Output>(value: Output) => PromptAction<never, Output>
```

Added in v1.0.0

# models

## Beep (interface)

**Signature**

```ts
export interface Beep {
  readonly _tag: 'Beep'
}
```

Added in v1.0.0

## Error (interface)

**Signature**

```ts
export interface Error {
  readonly _tag: 'Error'
  readonly message: string
}
```

Added in v1.0.0

## NextFrame (interface)

**Signature**

```ts
export interface NextFrame<State> {
  readonly _tag: 'NextFrame'
  readonly state: State
}
```

Added in v1.0.0

## PromptAction (type alias)

**Signature**

```ts
export type PromptAction<State, Output> = Beep | Error | NextFrame<State> | Submit<Output>
```

Added in v1.0.0

## Submit (interface)

**Signature**

```ts
export interface Submit<Output> {
  readonly _tag: 'Submit'
  readonly value: Output
}
```

Added in v1.0.0
