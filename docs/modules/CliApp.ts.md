---
title: CliApp.ts
nav_order: 4
parent: Modules
---

## CliApp overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [execution](#execution)
  - [run](#run)
- [models](#models)
  - [CliApp (interface)](#cliapp-interface)

---

# constructors

## make

**Signature**

```ts
export declare const make: <A>(config: {
  name: string
  version: string
  command: Command<A>
  summary?: Span | undefined
  footer?: HelpDoc | undefined
}) => CliApp<A>
```

Added in v1.0.0

# execution

## run

**Signature**

```ts
export declare const run: {
  <R, E, A>(args: ReadonlyArray<string>, f: (a: A) => Effect<Console | R, E, void>): (
    self: CliApp<A>
  ) => Effect<Console | R, ValidationError | E, void>
  <R, E, A>(self: CliApp<A>, args: ReadonlyArray<string>, f: (a: A) => Effect<Console | R, E, void>): Effect<
    Console | R,
    ValidationError | E,
    void
  >
}
```

Added in v1.0.0

# models

## CliApp (interface)

A `CliApp<A>` is a complete description of a command-line application.

**Signature**

```ts
export interface CliApp<A> {
  readonly name: string
  readonly version: string
  readonly command: Command<A>
  readonly summary: Span
  readonly footer: HelpDoc
}
```

Added in v1.0.0
