---
title: BuiltInOption.ts
nav_order: 3
parent: Modules
---

## BuiltInOption overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [showCompletionScript](#showcompletionscript)
  - [showCompletions](#showcompletions)
  - [showHelp](#showhelp)
  - [wizard](#wizard)
- [models](#models)
  - [BuiltInOption (type alias)](#builtinoption-type-alias)
  - [ShowCompletionScript (interface)](#showcompletionscript-interface)
  - [ShowCompletions (interface)](#showcompletions-interface)
  - [ShowHelp (interface)](#showhelp-interface)
  - [Wizard (interface)](#wizard-interface)
- [options](#options)
  - [builtInOptions](#builtinoptions)
- [refinements](#refinements)
  - [isShowCompletionScript](#isshowcompletionscript)
  - [isShowCompletions](#isshowcompletions)
  - [isShowHelp](#isshowhelp)
  - [isWizard](#iswizard)

---

# constructors

## showCompletionScript

**Signature**

```ts
export declare const showCompletionScript: (pathToExecutable: string, shellType: ShellType) => BuiltInOption
```

Added in v1.0.0

## showCompletions

**Signature**

```ts
export declare const showCompletions: (index: number, shellType: ShellType) => BuiltInOption
```

Added in v1.0.0

## showHelp

**Signature**

```ts
export declare const showHelp: (usage: Usage, helpDoc: HelpDoc) => BuiltInOption
```

Added in v1.0.0

## wizard

**Signature**

```ts
export declare const wizard: (commmand: Command<unknown>) => BuiltInOption
```

Added in v1.0.0

# models

## BuiltInOption (type alias)

**Signature**

```ts
export type BuiltInOption = ShowHelp | ShowCompletionScript | ShowCompletions | Wizard
```

Added in v1.0.0

## ShowCompletionScript (interface)

**Signature**

```ts
export interface ShowCompletionScript {
  readonly _tag: 'ShowCompletionScript'
  readonly pathToExecutable: string
  readonly shellType: ShellType
}
```

Added in v1.0.0

## ShowCompletions (interface)

**Signature**

```ts
export interface ShowCompletions {
  readonly _tag: 'ShowCompletions'
  readonly index: number
  readonly shellType: ShellType
}
```

Added in v1.0.0

## ShowHelp (interface)

**Signature**

```ts
export interface ShowHelp {
  readonly _tag: 'ShowHelp'
  readonly usage: Usage
  readonly helpDoc: HelpDoc
}
```

Added in v1.0.0

## Wizard (interface)

**Signature**

```ts
export interface Wizard {
  readonly _tag: 'Wizard'
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
) => Options<Option<BuiltInOption>>
```

Added in v1.0.0

# refinements

## isShowCompletionScript

**Signature**

```ts
export declare const isShowCompletionScript: (self: BuiltInOption) => self is ShowCompletionScript
```

Added in v1.0.0

## isShowCompletions

**Signature**

```ts
export declare const isShowCompletions: (self: BuiltInOption) => self is ShowCompletions
```

Added in v1.0.0

## isShowHelp

**Signature**

```ts
export declare const isShowHelp: (self: BuiltInOption) => self is ShowHelp
```

Added in v1.0.0

## isWizard

**Signature**

```ts
export declare const isWizard: (self: BuiltInOption) => self is Wizard
```

Added in v1.0.0
