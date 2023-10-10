---
title: Terminal.ts
nav_order: 16
parent: Modules
---

## Terminal overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [Terminal](#terminal)
  - [layer](#layer)
- [models](#models)
  - [Terminal (interface)](#terminal-interface)
- [utils](#utils)
  - [Terminal (namespace)](#terminal-namespace)
    - [UserInput (interface)](#userinput-interface)
    - [Action (type alias)](#action-type-alias)

---

# context

## Terminal

**Signature**

```ts
export declare const Terminal: Context.Tag<Terminal, Terminal>
```

Added in v1.0.0

## layer

**Signature**

```ts
export declare const layer: Layer.Layer<never, never, Terminal>
```

Added in v1.0.0

# models

## Terminal (interface)

Represents a teletype-style (TTY) terminal interface that allows for
obtaining user input and rendering text.

**Signature**

```ts
export interface Terminal {
  /**
   * Obtains the user's input from the terminal.
   */
  readonly getUserInput: Effect.Effect<never, never, Terminal.UserInput>
  /**
   * Displays the provided message to the terminal.
   */
  display(message: string): Effect.Effect<never, never, void>
}
```

Added in v1.0.0

# utils

## Terminal (namespace)

Added in v1.0.0

### UserInput (interface)

Represents a user's input to a terminal.

**Signature**

```ts
export interface UserInput {
  readonly action: Action
  readonly value: string
}
```

Added in v1.0.0

### Action (type alias)

Represents the action parsed from a user's input to a terminal.

**Signature**

```ts
export type Action =
  | 'Backspace'
  | 'CursorFirst'
  | 'CursorLast'
  | 'CursorUp'
  | 'CursorDown'
  | 'CursorLeft'
  | 'CursorRight'
  | 'Delete'
  | 'End'
  | 'Exit'
  | 'Next'
  | 'NextPage'
  | 'PreviousPage'
  | 'Reset'
  | 'Retry'
  | 'Start'
  | 'Submit'
```

Added in v1.0.0
