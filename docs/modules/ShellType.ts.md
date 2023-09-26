---
title: ShellType.ts
nav_order: 15
parent: Modules
---

## ShellType overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [bash](#bash)
  - [zShell](#zshell)
- [models](#models)
  - [Bash (interface)](#bash-interface)
  - [ShellType (type alias)](#shelltype-type-alias)
  - [ZShell (interface)](#zshell-interface)
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

## zShell

**Signature**

```ts
export declare const zShell: ShellType
```

Added in v1.0.0

# models

## Bash (interface)

**Signature**

```ts
export interface Bash {
  readonly _tag: 'Bash'
}
```

Added in v1.0.0

## ShellType (type alias)

**Signature**

```ts
export type ShellType = Bash | ZShell
```

Added in v1.0.0

## ZShell (interface)

**Signature**

```ts
export interface ZShell {
  readonly _tag: 'ZShell'
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
