---
title: Command.ts
nav_order: 6
parent: Modules
---

## Command overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [orElse](#orelse)
  - [orElseEither](#orelseeither)
  - [subcommands](#subcommands)
  - [toRegularLanguage](#toregularlanguage)
  - [withHelp](#withhelp)
- [constructors](#constructors)
  - [prompt](#prompt)
  - [standard](#standard)
- [mapping](#mapping)
  - [map](#map)
- [models](#models)
  - [Command (interface)](#command-interface)
- [symbols](#symbols)
  - [CommandTypeId](#commandtypeid)
  - [CommandTypeId (type alias)](#commandtypeid-type-alias)
- [utils](#utils)
  - [Command (namespace)](#command-namespace)
    - [ConstructorConfig (interface)](#constructorconfig-interface)
    - [Variance (interface)](#variance-interface)
    - [ComputeParsedType (type alias)](#computeparsedtype-type-alias)
    - [GetParsedType (type alias)](#getparsedtype-type-alias)
    - [ParsedStandardCommand (type alias)](#parsedstandardcommand-type-alias)
    - [ParsedSubcommand (type alias)](#parsedsubcommand-type-alias)
    - [ParsedUserInputCommand (type alias)](#parseduserinputcommand-type-alias)
    - [Subcommands (type alias)](#subcommands-type-alias)

---

# combinators

## orElse

**Signature**

```ts
export declare const orElse: {
  <B>(that: Command<B>): <A>(self: Command<A>) => Command<B | A>
  <A, B>(self: Command<A>, that: Command<B>): Command<A | B>
}
```

Added in v1.0.0

## orElseEither

**Signature**

```ts
export declare const orElseEither: {
  <B>(that: Command<B>): <A>(self: Command<A>) => Command<Either<A, B>>
  <A, B>(self: Command<A>, that: Command<B>): Command<Either<A, B>>
}
```

Added in v1.0.0

## subcommands

**Signature**

```ts
export declare const subcommands: {
  <Subcommands extends readonly [Command<any>, ...Command<any>[]]>(
    subcommands: [...Subcommands]
  ): <A>(
    self: Command<A>
  ) => Command<
    Command.ComputeParsedType<A & Readonly<{ subcommand: Option<Command.GetParsedType<Subcommands[number]>> }>>
  >
  <A, Subcommands extends readonly [Command<any>, ...Command<any>[]]>(
    self: Command<A>,
    subcommands: [...Subcommands]
  ): Command<
    Command.ComputeParsedType<A & Readonly<{ subcommand: Option<Command.GetParsedType<Subcommands[number]>> }>>
  >
}
```

Added in v1.0.0

## toRegularLanguage

Returns a `RegularLanguage` whose accepted language is equivalent to the
language accepted by the provided `Command`.

**Signature**

```ts
export declare const toRegularLanguage: {
  (allowAlias: boolean): <A>(self: Command<A>) => RegularLanguage
  <A>(self: Command<A>, allowAlias: boolean): RegularLanguage
}
```

Added in v1.0.0

## withHelp

**Signature**

```ts
export declare const withHelp: {
  (help: string | HelpDoc): <A>(self: Command<A>) => Command<A>
  <A>(self: Command<A>, help: string | HelpDoc): Command<A>
}
```

Added in v1.0.0

# constructors

## prompt

**Signature**

```ts
export declare const prompt: <Name extends string, A>(
  name: Name,
  prompt: Prompt<A>
) => Command<{ readonly name: Name; readonly value: A }>
```

Added in v1.0.0

## standard

**Signature**

```ts
export declare const standard: <Name extends string, OptionsType = void, ArgsType = void>(
  name: Name,
  config?: Command.ConstructorConfig<OptionsType, ArgsType> | undefined
) => Command<{ readonly name: Name; readonly options: OptionsType; readonly args: ArgsType }>
```

Added in v1.0.0

# mapping

## map

**Signature**

```ts
export declare const map: {
  <A, B>(f: (a: A) => B): (self: Command<A>) => Command<B>
  <A, B>(self: Command<A>, f: (a: A) => B): Command<B>
}
```

Added in v1.0.0

# models

## Command (interface)

A `Command` represents a command in a command-line application.

Every command-line application will have at least one command: the
application itself. Other command-line applications may support multiple
commands.

**Signature**

```ts
export interface Command<A> extends Command.Variance<A>, Named, Pipeable {
  get usage(): Usage
  get subcommands(): HashMap<string, Command<unknown>>
  parse(
    args: ReadonlyArray<string>,
    config: CliConfig
  ): Effect<FileSystem | Terminal, ValidationError, CommandDirective<A>>
}
```

Added in v1.0.0

# symbols

## CommandTypeId

**Signature**

```ts
export declare const CommandTypeId: typeof CommandTypeId
```

Added in v1.0.0

## CommandTypeId (type alias)

**Signature**

```ts
export type CommandTypeId = typeof CommandTypeId
```

Added in v1.0.0

# utils

## Command (namespace)

Added in v1.0.0

### ConstructorConfig (interface)

**Signature**

```ts
export interface ConstructorConfig<OptionsType = void, ArgsType = void> {
  readonly options?: Options<OptionsType>
  readonly args?: Args<ArgsType>
}
```

Added in v1.0.0

### Variance (interface)

**Signature**

```ts
export interface Variance<A> {
  readonly [CommandTypeId]: {
    readonly _A: (_: never) => A
  }
}
```

Added in v1.0.0

### ComputeParsedType (type alias)

**Signature**

```ts
export type ComputeParsedType<A> = { [K in keyof A]: A[K] } extends infer X ? X : never
```

Added in v1.0.0

### GetParsedType (type alias)

**Signature**

```ts
export type GetParsedType<C> = C extends Command<infer P> ? P : never
```

Added in v1.0.0

### ParsedStandardCommand (type alias)

**Signature**

```ts
export type ParsedStandardCommand<Name extends string, OptionsType, ArgsType> = Command.ComputeParsedType<{
  readonly name: Name
  readonly options: OptionsType
  readonly args: ArgsType
}>
```

Added in v1.0.0

### ParsedSubcommand (type alias)

**Signature**

```ts
export type ParsedSubcommand<A extends NonEmptyReadonlyArray<any>> = A[number] extends Command<any>
  ? GetParsedType<A[number]>
  : never
```

Added in v1.0.0

### ParsedUserInputCommand (type alias)

**Signature**

```ts
export type ParsedUserInputCommand<Name extends string, ValueType> = Command.ComputeParsedType<{
  readonly name: Name
  readonly value: ValueType
}>
```

Added in v1.0.0

### Subcommands (type alias)

**Signature**

```ts
export type Subcommands<A extends NonEmptyReadonlyArray<Command<any>>> = GetParsedType<A[number]>
```

Added in v1.0.0
