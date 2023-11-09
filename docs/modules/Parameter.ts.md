---
title: Parameter.ts
nav_order: 13
parent: Modules
---

## Parameter overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Input (interface)](#input-interface)
  - [Named (interface)](#named-interface)
  - [Parameter (interface)](#parameter-interface)

---

# utils

## Input (interface)

Input is used to obtain a parameter from user.

**Signature**

```ts
export interface Input extends Parameter {
  isValid(input: string, config: CliConfig): Effect<never, ValidationError, ReadonlyArray<string>>
  parse(
    args: ReadonlyArray<string>,
    config: CliConfig
  ): Effect<never, ValidationError, readonly [ReadonlyArray<string>, ReadonlyArray<string>]>
}
```

Added in v1.0.0

## Named (interface)

Represent a parameter with name to be used as the options in Alternatives.

**Signature**

```ts
export interface Named extends Parameter {
  get names(): HashSet<string>
}
```

Added in v1.0.0

## Parameter (interface)

Abstraction employed by Wizard class. Parameter trait encompass `Command`,
`Options` and `Args` interfaces.

The `Wizard` processes subtypes of `Parameter` in different manners.

**Signature**

```ts
export interface Parameter {
  get help(): HelpDoc
  get shortDescription(): string
}
```

Added in v1.0.0
