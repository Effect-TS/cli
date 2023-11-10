---
title: Compgen.ts
nav_order: 8
parent: Modules
---

## Compgen overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [Compgen](#compgen)
  - [LiveCompgen](#livecompgen)
  - [TestCompgen](#testcompgen)
- [models](#models)
  - [Compgen (interface)](#compgen-interface)

---

# context

## Compgen

**Signature**

```ts
export declare const Compgen: Tag<Compgen, Compgen>
```

Added in v1.0.0

## LiveCompgen

**Signature**

```ts
export declare const LiveCompgen: Layer<CommandExecutor, never, Compgen>
```

Added in v1.0.0

## TestCompgen

**Signature**

```ts
export declare const TestCompgen: (workingDirectory: string) => Layer<CommandExecutor, never, Compgen>
```

Added in v1.0.0

# models

## Compgen (interface)

`Compgen` simplifies the process of calling Bash's built-in `compgen` command.

**Signature**

```ts
export interface Compgen {
  completeFileNames(word: string): Effect<never, PlatformError, ReadonlyArray<string>>
  completeDirectoryNames(word: string): Effect<never, PlatformError, ReadonlyArray<string>>
}
```

Added in v1.0.0
