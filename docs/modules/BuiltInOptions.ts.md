---
title: BuiltInOptions.ts
nav_order: 3
parent: Modules
---

## BuiltInOptions overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [showCompletionScript](#showcompletionscript)
  - [showCompletions](#showcompletions)
  - [showHelp](#showhelp)
  - [showWizard](#showwizard)
- [models](#models)
  - [BuiltInOptions (type alias)](#builtinoptions-type-alias)
  - [ShowCompletionScript (interface)](#showcompletionscript-interface)
  - [ShowCompletions (interface)](#showcompletions-interface)
  - [ShowHelp (interface)](#showhelp-interface)
  - [ShowWizard (interface)](#showwizard-interface)
- [options](#options)
  - [builtInOptions](#builtinoptions)
- [refinements](#refinements)
  - [isShowCompletionScript](#isshowcompletionscript)
  - [isShowCompletions](#isshowcompletions)
  - [isShowHelp](#isshowhelp)
  - [isShowWizard](#isshowwizard)

---

# constructors

## showCompletionScript

**Signature**

```ts
export declare const showCompletionScript: (pathToExecutable: string, shellType: ShellType) => BuiltInOptions
```

Added in v1.0.0

## showCompletions

**Signature**

```ts
export declare const showCompletions: (index: number, shellType: ShellType) => BuiltInOptions
```

Added in v1.0.0

## showHelp

**Signature**

```ts
export declare const showHelp: (usage: Usage, helpDoc: HelpDoc) => BuiltInOptions
```

Added in v1.0.0

## showWizard

**Signature**

```ts
export declare const showWizard: (commmand: Command<unknown>) => BuiltInOptions
```

Added in v1.0.0

# models

## BuiltInOptions (type alias)

**Signature**

```ts
export type BuiltInOptions = ShowHelp | ShowCompletionScript | ShowCompletions | ShowWizard
```

Added in v1.0.0

## ShowCompletionScript (interface)

**Signature**

```ts
export interface ShowCompletionScript {
  readonly _tag: "ShowCompletionScript"
  readonly pathToExecutable: string
  readonly shellType: ShellType
}
```

Added in v1.0.0

## ShowCompletions (interface)

**Signature**

```ts
export interface ShowCompletions {
  readonly _tag: "ShowCompletions"
  readonly index: number
  readonly shellType: ShellType
}
```

Added in v1.0.0

## ShowHelp (interface)

**Signature**

```ts
export interface ShowHelp {
  readonly _tag: "ShowHelp"
  readonly usage: Usage
  readonly helpDoc: HelpDoc
}
```

Added in v1.0.0

## ShowWizard (interface)

**Signature**

```ts
export interface ShowWizard {
  readonly _tag: "ShowWizard"
  readonly commmand: Command<unknown>
}
```

Added in v1.0.0

# options

## builtInOptions

**Signature**

```ts
export declare const builtInOptions: <A>(
  command: Command<A>,
  usage: Usage,
  helpDoc: HelpDoc
) => Options<Option<BuiltInOptions>>
```

Added in v1.0.0

# refinements

## isShowCompletionScript

**Signature**

```ts
export declare const isShowCompletionScript: (self: BuiltInOptions) => self is ShowCompletionScript
```

Added in v1.0.0

## isShowCompletions

**Signature**

```ts
export declare const isShowCompletions: (self: BuiltInOptions) => self is ShowCompletions
```

Added in v1.0.0

## isShowHelp

**Signature**

```ts
export declare const isShowHelp: (self: BuiltInOptions) => self is ShowHelp
```

Added in v1.0.0

## isShowWizard

**Signature**

```ts
export declare const isShowWizard: (self: BuiltInOptions) => self is ShowWizard
```

Added in v1.0.0
