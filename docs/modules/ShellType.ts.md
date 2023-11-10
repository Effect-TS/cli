---
title: ShellType.ts
nav_order: 19
parent: Modules
---

## ShellType overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [bash](#bash)
  - [fish](#fish)
  - [zsh](#zsh)
- [models](#models)
  - [Bash (interface)](#bash-interface)
  - [Fish (interface)](#fish-interface)
  - [ShellType (type alias)](#shelltype-type-alias)
  - [Zsh (interface)](#zsh-interface)
- [options](#options)
  - [shellOption](#shelloption)

---

# constructors

## bash

**Signature**

```ts
export declare const bash: ShellType
```

Added in v1.0.0

## fish

**Signature**

```ts
export declare const fish: ShellType
```

Added in v1.0.0

## zsh

**Signature**

```ts
export declare const zsh: ShellType
```

Added in v1.0.0

# models

## Bash (interface)

**Signature**

```ts
export interface Bash {
  readonly _tag: "Bash"
}
```

Added in v1.0.0

## Fish (interface)

**Signature**

```ts
export interface Fish {
  readonly _tag: "Fish"
}
```

Added in v1.0.0

## ShellType (type alias)

**Signature**

```ts
export type ShellType = Bash | Fish | Zsh
```

Added in v1.0.0

## Zsh (interface)

**Signature**

```ts
export interface Zsh {
  readonly _tag: "Zsh"
}
```

Added in v1.0.0

# options

## shellOption

**Signature**

```ts
export declare const shellOption: Options<ShellType>
```

Added in v1.0.0
