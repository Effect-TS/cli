---
title: CliConfig.ts
nav_order: 5
parent: Modules
---

## CliConfig overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [defaultConfig](#defaultconfig)
  - [make](#make)
- [context](#context)
  - [CliConfig](#cliconfig)
  - [defaultLayer](#defaultlayer)
  - [layer](#layer)
- [models](#models)
  - [CliConfig (interface)](#cliconfig-interface)
- [utilities](#utilities)
  - [normalizeCase](#normalizecase)

---

# constructors

## defaultConfig

**Signature**

```ts
export declare const defaultConfig: CliConfig
```

Added in v1.0.0

## make

**Signature**

```ts
export declare const make: (isCaseSensitive: boolean, autoCorrectLimit: number) => CliConfig
```

Added in v1.0.0

# context

## CliConfig

**Signature**

```ts
export declare const CliConfig: Context.Tag<CliConfig, CliConfig>
```

Added in v1.0.0

## defaultLayer

**Signature**

```ts
export declare const defaultLayer: Layer.Layer<never, never, CliConfig>
```

Added in v1.0.0

## layer

**Signature**

```ts
export declare const layer: (config: CliConfig) => Layer.Layer<never, never, CliConfig>
```

Added in v1.0.0

# models

## CliConfig (interface)

Represents how arguments from the command-line are to be parsed.

**Signature**

```ts
export interface CliConfig {
  /**
   * Whether or not the argument parser should be case sensitive.
   */
  readonly isCaseSensitive: boolean
  /**
   * Threshold for when to show auto correct suggestions.
   */
  readonly autoCorrectLimit: number
}
```

Added in v1.0.0

# utilities

## normalizeCase

**Signature**

```ts
export declare const normalizeCase: {
  (text: string): (self: CliConfig) => string
  (self: CliConfig, text: string): string
}
```

Added in v1.0.0
