---
title: Console.ts
nav_order: 8
parent: Modules
---

## Console overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [accessors](#accessors)
  - [log](#log)
- [context](#context)
  - [Console](#console)
  - [layer](#layer)
- [models](#models)
  - [Console (interface)](#console-interface)

---

# accessors

## log

**Signature**

```ts
export declare const log: (text: string) => Effect.Effect<Console, never, void>
```

Added in v1.0.0

# context

## Console

**Signature**

```ts
export declare const Console: Context.Tag<Console>
```

Added in v1.0.0

## layer

**Signature**

```ts
export declare const layer: Layer.Layer<never, never, Console>
```

Added in v1.0.0

# models

## Console (interface)

**Signature**

```ts
export interface Console {
  log(text: string): Effect.Effect<never, never, void>
}
```

Added in v1.0.0
