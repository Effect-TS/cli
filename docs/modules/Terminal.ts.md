---
title: Terminal.ts
nav_order: 17
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
export declare const layer: Layer<never, never, Terminal>
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
  readonly getUserInput: Effect<never, never, Terminal.UserInput>
  /**
   * Displays the provided message to the terminal.
   */
  display(message: string): Effect<never, never, void>
}
```

Added in v1.0.0
