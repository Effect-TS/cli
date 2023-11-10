---
title: RegularLanguage.ts
nav_order: 18
parent: Modules
---

## RegularLanguage overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [concat](#concat)
  - [contains](#contains)
  - [derive](#derive)
  - [firstTokens](#firsttokens)
  - [isNullable](#isnullable)
  - [optional](#optional)
  - [orElse](#orelse)
  - [repeated](#repeated)
- [constructors](#constructors)
  - [anyString](#anystring)
  - [empty](#empty)
  - [epsilon](#epsilon)
  - [permutation](#permutation)
  - [primitive](#primitive)
  - [string](#string)
- [models](#models)
  - [Alt (interface)](#alt-interface)
  - [AnyStringToken (interface)](#anystringtoken-interface)
  - [Cat (interface)](#cat-interface)
  - [Empty (interface)](#empty-interface)
  - [Epsilon (interface)](#epsilon-interface)
  - [Permutation (interface)](#permutation-interface)
  - [PrimitiveToken (interface)](#primitivetoken-interface)
  - [RegularLanguage (type alias)](#regularlanguage-type-alias)
  - [Repeat (interface)](#repeat-interface)
  - [StringToken (interface)](#stringtoken-interface)
- [refinements](#refinements)
  - [isAlt](#isalt)
  - [isAnyStringToken](#isanystringtoken)
  - [isCat](#iscat)
  - [isEmpty](#isempty)
  - [isEpsilon](#isepsilon)
  - [isPermutation](#ispermutation)
  - [isPrimitiveToken](#isprimitivetoken)
  - [isRegularLanguage](#isregularlanguage)
  - [isRepeat](#isrepeat)
  - [isStringToken](#isstringtoken)
- [symbols](#symbols)
  - [RegularLanguageTypeId](#regularlanguagetypeid)
  - [RegularLanguageTypeId (type alias)](#regularlanguagetypeid-type-alias)
- [utils](#utils)
  - [RegularLanguage (namespace)](#regularlanguage-namespace)
    - [Proto (interface)](#proto-interface)
    - [RepetitionConfiguration (interface)](#repetitionconfiguration-interface)

---

# combinators

## concat

**Signature**

```ts
export declare const concat: {
  (that: string | RegularLanguage): (self: RegularLanguage) => RegularLanguage
  (self: RegularLanguage, that: string | RegularLanguage): RegularLanguage
}
```

Added in v1.0.0

## contains

Checks to see if the input token list is a member of the language.

Returns `true` if and only if `tokens` is in the language.

**Signature**

```ts
export declare const contains: {
  (tokens: ReadonlyArray<string>, config: CliConfig): (self: RegularLanguage) => Effect<FileSystem, never, boolean>
  (self: RegularLanguage, tokens: ReadonlyArray<string>, config: CliConfig): Effect<FileSystem, never, boolean>
}
```

Added in v1.0.0

## derive

Calculate the Brzozowski derivative of this language with respect to the given string. This is an effectful
function because it can call PrimType.validate (e.g., when validating file paths, etc.).

**Signature**

```ts
export declare const derive: {
  (token: string, config: CliConfig): (self: RegularLanguage) => Effect<FileSystem, never, RegularLanguage>
  (self: RegularLanguage, token: string, config: CliConfig): Effect<FileSystem, never, RegularLanguage>
}
```

Added in v1.0.0

## firstTokens

Returns a set consisting of the first token of all strings in this language
that are useful for CLI tab completion. For infinite or unwieldly languages,
it is perfectly fine to return the empty set: This will simply not display
any completions to the user.

If you'd like the cursor to advance to the next word when tab completion
unambiguously matches the prefix to a token, append a space (`" "`) character
to the end of the returned token. Otherwise, the cursor will skip to the end
of the completed token in the terminal.

Some examples of different use cases:

1. Completing file/directory names:
   - Append a space to the ends of file names (e.g., `"bippy.pdf"`). This
     is because we want the cursor to jump to the next argument position if
     tab completion unambiguously succeeds.

- Do not append a space to the end of a directory name (e.g., `"foo/"`).
  This is because we want the user to be able to press tab again to
  gradually complete a lengthy file path.

- Append a space to the ends of string tokens.

You may be asking why we don't try to use the `-o nospace` setting of
`compgen` and `complete`. The answer is they appear to be all or nothing: For
a given tab completion execution, you have to choose one behavior or the
other. This does not work well when completing both file names and directory
names at the same time.

**Signature**

```ts
export declare const firstTokens: ((
  prefix: string,
  compgen: Compgen
) => (self: RegularLanguage) => Effect<never, never, HashSet<string>>) &
  ((self: RegularLanguage, prefix: string, compgen: Compgen) => Effect<never, never, HashSet<string>>)
```

Added in v1.0.0

## isNullable

This is the delta (`δ`) predicate from "Parsing With Derivatives", indicating
whether this language contains the empty string.

Returns `true` if and only if this language contains the empty string.

**Signature**

```ts
export declare const isNullable: (self: RegularLanguage) => boolean
```

Added in v1.0.0

## optional

**Signature**

```ts
export declare const optional: (self: RegularLanguage) => RegularLanguage
```

Added in v1.0.0

## orElse

**Signature**

```ts
export declare const orElse: {
  (that: string | RegularLanguage): (self: RegularLanguage) => RegularLanguage
  (self: RegularLanguage, that: string | RegularLanguage): RegularLanguage
}
```

Added in v1.0.0

## repeated

**Signature**

```ts
export declare const repeated: {
  (params?: Partial<RegularLanguage.RepetitionConfiguration>): (self: RegularLanguage) => RegularLanguage
  (self: RegularLanguage, params?: Partial<RegularLanguage.RepetitionConfiguration>): RegularLanguage
}
```

Added in v1.0.0

# constructors

## anyString

**Signature**

```ts
export declare const anyString: RegularLanguage
```

Added in v1.0.0

## empty

**Signature**

```ts
export declare const empty: RegularLanguage
```

Added in v1.0.0

## epsilon

**Signature**

```ts
export declare const epsilon: RegularLanguage
```

Added in v1.0.0

## permutation

**Signature**

```ts
export declare const permutation: (values: ReadonlyArray<RegularLanguage>) => RegularLanguage
```

Added in v1.0.0

## primitive

**Signature**

```ts
export declare const primitive: (primitive: Primitive<unknown>) => RegularLanguage
```

Added in v1.0.0

## string

**Signature**

```ts
export declare const string: (value: string) => RegularLanguage
```

Added in v1.0.0

# models

## Alt (interface)

`Alt` represents the union of two regular languages. We call it "Alt" for
consistency with the names used in the "Parsing With Derivatives" paper.

**Signature**

```ts
export interface Alt extends RegularLanguage.Proto, Case, Pipeable {
  readonly _tag: "Alt"
  readonly left: RegularLanguage
  readonly right: RegularLanguage
}
```

Added in v1.0.0

## AnyStringToken (interface)

`AnyStringToken` represents the set of all strings. For tab completion
purposes, this is used to represent the name of the executable (It may be
aliased or renamed to be different).

**Signature**

```ts
export interface AnyStringToken extends RegularLanguage.Proto, Case, Pipeable {
  readonly _tag: "AnyStringToken"
}
```

Added in v1.0.0

## Cat (interface)

`Cat` represents the concatenation of two regular languages.

**Signature**

```ts
export interface Cat extends RegularLanguage.Proto, Case, Pipeable {
  readonly _tag: "Cat"
  readonly left: RegularLanguage
  readonly right: RegularLanguage
}
```

Added in v1.0.0

## Empty (interface)

The `Empty` language (`∅`) accepts no strings.

**Signature**

```ts
export interface Empty extends RegularLanguage.Proto, Case, Pipeable {
  readonly _tag: "Empty"
}
```

Added in v1.0.0

## Epsilon (interface)

The `Epsilon` language (`ε`) accepts only the empty string.

**Signature**

```ts
export interface Epsilon extends RegularLanguage.Proto, Case, Pipeable {
  readonly _tag: "Epsilon"
}
```

Added in v1.0.0

## Permutation (interface)

Permutation is like `Cat`, but it is a commutative monoid. A
`Permutation(a_1, a_2, ..., a_{k})` is equivalent to the following language:

```
a2 ~ Permutation(a_1, a_3, ..., a_k) | a1 ~ Permutation(a_2, a_3, ..., a_k) | ... ak ~ Permutation(a_1, a_2, ..., a_{k - 1})
```

So when we calculate its derivative, we apply the above "desugaring"
transformation, then compute the derivative as usual.

**Signature**

```ts
export interface Permutation extends RegularLanguage.Proto, Case, Pipeable {
  readonly _tag: "Permutation"
  readonly values: ReadonlyArray<RegularLanguage>
}
```

Added in v1.0.0

## PrimitiveToken (interface)

A `PrimitiveToken` language represents the regular language containing any
strings `s` where `value.validate(s)` succeeds.

**Signature**

```ts
export interface PrimitiveToken extends RegularLanguage.Proto, Case, Pipeable {
  readonly _tag: "PrimitiveToken"
  readonly primitive: Primitive<unknown>
}
```

Added in v1.0.0

## RegularLanguage (type alias)

`RegularLanguage` is an implementation of "Parsing With Derivatives" (Might
et al. 2011) that is used for CLI tab completion. Unlike your usual regular
languages that are sets of strings of symbols, our regular languages are sets
of lists of tokens, where tokens can be strings or `Primitive` instances. (If
you think about it, `Primitive.validate` is an intensional definition of a
set of strings.)

**Signature**

```ts
export type RegularLanguage =
  | Empty
  | Epsilon
  | StringToken
  | AnyStringToken
  | PrimitiveToken
  | Cat
  | Alt
  | Repeat
  | Permutation
```

Added in v1.0.0

## Repeat (interface)

`Repeat` represents the repetition of `language`. The number of repetitions
can be bounded via `min` and `max`. Setting `max=None` represents the
"Kleene star" of `language`.

**Signature**

```ts
export interface Repeat extends RegularLanguage.Proto, Case, Pipeable {
  readonly _tag: "Repeat"
  readonly language: RegularLanguage
  readonly min: Option<number>
  readonly max: Option<number>
}
```

Added in v1.0.0

## StringToken (interface)

A `StringToken` language represents the regular language that contains only
`value`.

**Signature**

```ts
export interface StringToken extends RegularLanguage.Proto, Case, Pipeable {
  readonly _tag: "StringToken"
  readonly value: string
}
```

Added in v1.0.0

# refinements

## isAlt

**Signature**

```ts
export declare const isAlt: (self: RegularLanguage) => self is Alt
```

Added in v1.0.0

## isAnyStringToken

**Signature**

```ts
export declare const isAnyStringToken: (self: RegularLanguage) => self is AnyStringToken
```

Added in v1.0.0

## isCat

**Signature**

```ts
export declare const isCat: (self: RegularLanguage) => self is Cat
```

Added in v1.0.0

## isEmpty

**Signature**

```ts
export declare const isEmpty: (self: RegularLanguage) => self is Empty
```

Added in v1.0.0

## isEpsilon

**Signature**

```ts
export declare const isEpsilon: (self: RegularLanguage) => self is Epsilon
```

Added in v1.0.0

## isPermutation

**Signature**

```ts
export declare const isPermutation: (self: RegularLanguage) => self is Permutation
```

Added in v1.0.0

## isPrimitiveToken

**Signature**

```ts
export declare const isPrimitiveToken: (self: RegularLanguage) => self is PrimitiveToken
```

Added in v1.0.0

## isRegularLanguage

**Signature**

```ts
export declare const isRegularLanguage: (u: unknown) => u is RegularLanguage
```

Added in v1.0.0

## isRepeat

**Signature**

```ts
export declare const isRepeat: (self: RegularLanguage) => self is Repeat
```

Added in v1.0.0

## isStringToken

**Signature**

```ts
export declare const isStringToken: (self: RegularLanguage) => self is StringToken
```

Added in v1.0.0

# symbols

## RegularLanguageTypeId

**Signature**

```ts
export declare const RegularLanguageTypeId: typeof RegularLanguageTypeId
```

Added in v1.0.0

## RegularLanguageTypeId (type alias)

**Signature**

```ts
export type RegularLanguageTypeId = typeof RegularLanguageTypeId
```

Added in v1.0.0

# utils

## RegularLanguage (namespace)

Added in v1.0.0

### Proto (interface)

**Signature**

```ts
export interface Proto {
  readonly [RegularLanguageTypeId]: (_: never) => never
}
```

Added in v1.0.0

### RepetitionConfiguration (interface)

**Signature**

```ts
export interface RepetitionConfiguration {
  readonly min?: number
  readonly max?: number
}
```

Added in v1.0.0
