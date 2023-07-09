---
title: CommandDirective.ts
nav_order: 7
parent: Modules
---

## CommandDirective overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [builtIn](#builtin)
  - [userDefined](#userdefined)
- [mapping](#mapping)
  - [map](#map)
- [models](#models)
  - [BuiltIn (interface)](#builtin-interface)
  - [CommandDirective (type alias)](#commanddirective-type-alias)
  - [UserDefined (interface)](#userdefined-interface)
- [refinements](#refinements)
  - [isBuiltIn](#isbuiltin)
  - [isUserDefined](#isuserdefined)

---

# constructors

## builtIn

**Signature**

```ts
export declare const builtIn: (option: BuiltInOption) => CommandDirective<never>
```

Added in v1.0.0

## userDefined

**Signature**

```ts
export declare const userDefined: <A>(leftover: ReadonlyArray<string>, value: A) => CommandDirective<A>
```

Added in v1.0.0

# mapping

## map

**Signature**

```ts
export declare const map: {
  <A, B>(f: (a: A) => B): (self: CommandDirective<A>) => CommandDirective<B>
  <A, B>(self: CommandDirective<A>, f: (a: A) => B): CommandDirective<B>
}
```

Added in v1.0.0

# models

## BuiltIn (interface)

**Signature**

```ts
export interface BuiltIn {
  readonly _tag: 'BuiltIn'
  readonly option: BuiltInOption
}
```

Added in v1.0.0

## CommandDirective (type alias)

**Signature**

```ts
export type CommandDirective<A> = BuiltIn | UserDefined<A>
```

Added in v1.0.0

## UserDefined (interface)

**Signature**

```ts
export interface UserDefined<A> {
  readonly _tag: 'UserDefined'
  readonly leftover: ReadonlyArray<string>
  readonly value: A
}
```

Added in v1.0.0

# refinements

## isBuiltIn

**Signature**

```ts
export declare const isBuiltIn: <A>(self: CommandDirective<A>) => self is BuiltIn
```

Added in v1.0.0

## isUserDefined

**Signature**

```ts
export declare const isUserDefined: <A>(self: CommandDirective<A>) => self is UserDefined<A>
```

Added in v1.0.0
