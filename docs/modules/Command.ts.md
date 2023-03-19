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
  - [withHelp](#withhelp)
- [constructors](#constructors)
  - [make](#make)
- [getters](#getters)
  - [getSubcommands](#getsubcommands)
  - [helpDoc](#helpdoc)
  - [names](#names)
  - [usage](#usage)
- [mapping](#mapping)
  - [map](#map)
  - [mapOrFail](#maporfail)
- [models](#models)
  - [Command (interface)](#command-interface)
- [parsing](#parsing)
  - [parse](#parse)
- [symbols](#symbols)
  - [CommandTypeId](#commandtypeid)
  - [CommandTypeId (type alias)](#commandtypeid-type-alias)

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
  <Subcommands extends readonly [Command<any>, ...Command<any>[]]>(subcommands: [...Subcommands]): <A>(
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

## make

**Signature**

```ts
export declare const make: <Name extends string, OptionsType = void, ArgsType = void>(
  name: Name,
  config?: Command.ConstructorConfig<OptionsType, ArgsType> | undefined
) => Command<{ readonly name: Name; readonly options: OptionsType; readonly args: ArgsType }>
```

Added in v1.0.0

# getters

## getSubcommands

**Signature**

```ts
export declare const getSubcommands: <A>(self: Command<A>) => HashMap<string, Command<unknown>>
```

Added in v1.0.0

## helpDoc

**Signature**

```ts
export declare const helpDoc: <A>(self: Command<A>) => any
```

Added in v1.0.0

## names

**Signature**

```ts
export declare const names: <A>(self: Command<A>) => HashSet<string>
```

Added in v1.0.0

## usage

**Signature**

```ts
export declare const usage: <A>(self: Command<A>) => any
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

## mapOrFail

**Signature**

```ts
export declare const mapOrFail: {
  <A, B>(f: (a: A) => Either<any, B>): (self: Command<A>) => Command<B>
  <A, B>(self: Command<A>, f: (a: A) => Either<any, B>): Command<B>
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
export interface Command<A> extends Command.Variance<A> {}
```

Added in v1.0.0

# parsing

## parse

**Signature**

```ts
export declare const parse: {
  (args: ReadonlyArray<string>, config: any): <A>(self: Command<A>) => Effect<never, any, any>
  <A>(self: Command<A>, args: ReadonlyArray<string>, config: any): Effect<never, any, any>
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
