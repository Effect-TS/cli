---
title: ValidationError.ts
nav_order: 20
parent: Modules
---

## ValidationError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [commandMismatch](#commandmismatch)
  - [correctedFlag](#correctedflag)
  - [invalidArgument](#invalidargument)
  - [invalidValue](#invalidvalue)
  - [keyValuesDetected](#keyvaluesdetected)
  - [missingFlag](#missingflag)
  - [missingSubcommand](#missingsubcommand)
  - [missingValue](#missingvalue)
  - [noBuiltInMatch](#nobuiltinmatch)
  - [unclusteredFlag](#unclusteredflag)
- [models](#models)
  - [CommandMismatch (interface)](#commandmismatch-interface)
  - [CorrectedFlag (interface)](#correctedflag-interface)
  - [InvalidArgument (interface)](#invalidargument-interface)
  - [InvalidValue (interface)](#invalidvalue-interface)
  - [KeyValuesDetected (interface)](#keyvaluesdetected-interface)
  - [MissingFlag (interface)](#missingflag-interface)
  - [MissingSubcommand (interface)](#missingsubcommand-interface)
  - [MissingValue (interface)](#missingvalue-interface)
  - [NoBuiltInMatch (interface)](#nobuiltinmatch-interface)
  - [UnclusteredFlag (interface)](#unclusteredflag-interface)
  - [ValidationError (type alias)](#validationerror-type-alias)
- [refinements](#refinements)
  - [isCommandMismatch](#iscommandmismatch)
  - [isCorrectedFlag](#iscorrectedflag)
  - [isInvalidArgument](#isinvalidargument)
  - [isInvalidValue](#isinvalidvalue)
  - [isKeyValuesDetected](#iskeyvaluesdetected)
  - [isMissingFlag](#ismissingflag)
  - [isMissingSubcommand](#ismissingsubcommand)
  - [isMissingValue](#ismissingvalue)
  - [isNoBuiltInMatch](#isnobuiltinmatch)
  - [isUnclusteredFlag](#isunclusteredflag)
- [symbols](#symbols)
  - [ValidationErrorTypeId](#validationerrortypeid)
  - [ValidationErrorTypeId (type alias)](#validationerrortypeid-type-alias)
- [utils](#utils)
  - [ValidationError (namespace)](#validationerror-namespace)
    - [Proto (interface)](#proto-interface)

---

# constructors

## commandMismatch

**Signature**

```ts
export declare const commandMismatch: (error: HelpDoc) => ValidationError
```

Added in v1.0.0

## correctedFlag

**Signature**

```ts
export declare const correctedFlag: (error: HelpDoc) => ValidationError
```

Added in v1.0.0

## invalidArgument

**Signature**

```ts
export declare const invalidArgument: (error: HelpDoc) => ValidationError
```

Added in v1.0.0

## invalidValue

**Signature**

```ts
export declare const invalidValue: (error: HelpDoc) => ValidationError
```

Added in v1.0.0

## keyValuesDetected

**Signature**

```ts
export declare const keyValuesDetected: (error: HelpDoc, keyValues: ReadonlyArray<string>) => ValidationError
```

Added in v1.0.0

## missingFlag

**Signature**

```ts
export declare const missingFlag: (error: HelpDoc) => ValidationError
```

Added in v1.0.0

## missingSubcommand

**Signature**

```ts
export declare const missingSubcommand: (error: HelpDoc) => ValidationError
```

Added in v1.0.0

## missingValue

**Signature**

```ts
export declare const missingValue: (error: HelpDoc) => ValidationError
```

Added in v1.0.0

## noBuiltInMatch

**Signature**

```ts
export declare const noBuiltInMatch: (error: HelpDoc) => ValidationError
```

Added in v1.0.0

## unclusteredFlag

**Signature**

```ts
export declare const unclusteredFlag: (
  error: HelpDoc,
  unclustered: ReadonlyArray<string>,
  rest: ReadonlyArray<string>
) => ValidationError
```

Added in v1.0.0

# models

## CommandMismatch (interface)

**Signature**

```ts
export interface CommandMismatch extends ValidationError.Proto {
  readonly _tag: "CommandMismatch"
}
```

Added in v1.0.0

## CorrectedFlag (interface)

**Signature**

```ts
export interface CorrectedFlag extends ValidationError.Proto {
  readonly _tag: "CorrectedFlag"
}
```

Added in v1.0.0

## InvalidArgument (interface)

**Signature**

```ts
export interface InvalidArgument extends ValidationError.Proto {
  readonly _tag: "InvalidArgument"
}
```

Added in v1.0.0

## InvalidValue (interface)

**Signature**

```ts
export interface InvalidValue extends ValidationError.Proto {
  readonly _tag: "InvalidValue"
}
```

Added in v1.0.0

## KeyValuesDetected (interface)

**Signature**

```ts
export interface KeyValuesDetected extends ValidationError.Proto {
  readonly _tag: "KeyValuesDetected"
  readonly keyValues: ReadonlyArray<string>
}
```

Added in v1.0.0

## MissingFlag (interface)

**Signature**

```ts
export interface MissingFlag extends ValidationError.Proto {
  readonly _tag: "MissingFlag"
}
```

Added in v1.0.0

## MissingSubcommand (interface)

**Signature**

```ts
export interface MissingSubcommand extends ValidationError.Proto {
  readonly _tag: "MissingSubcommand"
}
```

Added in v1.0.0

## MissingValue (interface)

**Signature**

```ts
export interface MissingValue extends ValidationError.Proto {
  readonly _tag: "MissingValue"
}
```

Added in v1.0.0

## NoBuiltInMatch (interface)

**Signature**

```ts
export interface NoBuiltInMatch extends ValidationError.Proto {
  readonly _tag: "NoBuiltInMatch"
}
```

Added in v1.0.0

## UnclusteredFlag (interface)

**Signature**

```ts
export interface UnclusteredFlag extends ValidationError.Proto {
  readonly _tag: "UnclusteredFlag"
  readonly unclustered: ReadonlyArray<string>
  readonly rest: ReadonlyArray<string>
}
```

Added in v1.0.0

## ValidationError (type alias)

**Signature**

```ts
export type ValidationError =
  | CommandMismatch
  | CorrectedFlag
  | InvalidArgument
  | InvalidValue
  | KeyValuesDetected
  | MissingValue
  | MissingFlag
  | MissingSubcommand
  | NoBuiltInMatch
  | UnclusteredFlag
```

Added in v1.0.0

# refinements

## isCommandMismatch

**Signature**

```ts
export declare const isCommandMismatch: (self: ValidationError) => self is CommandMismatch
```

Added in v1.0.0

## isCorrectedFlag

**Signature**

```ts
export declare const isCorrectedFlag: (self: ValidationError) => self is CorrectedFlag
```

Added in v1.0.0

## isInvalidArgument

**Signature**

```ts
export declare const isInvalidArgument: (self: ValidationError) => self is InvalidArgument
```

Added in v1.0.0

## isInvalidValue

**Signature**

```ts
export declare const isInvalidValue: (self: ValidationError) => self is InvalidValue
```

Added in v1.0.0

## isKeyValuesDetected

**Signature**

```ts
export declare const isKeyValuesDetected: (self: ValidationError) => self is KeyValuesDetected
```

Added in v1.0.0

## isMissingFlag

**Signature**

```ts
export declare const isMissingFlag: (self: ValidationError) => self is MissingFlag
```

Added in v1.0.0

## isMissingSubcommand

**Signature**

```ts
export declare const isMissingSubcommand: (self: ValidationError) => self is MissingSubcommand
```

Added in v1.0.0

## isMissingValue

**Signature**

```ts
export declare const isMissingValue: (self: ValidationError) => self is MissingValue
```

Added in v1.0.0

## isNoBuiltInMatch

**Signature**

```ts
export declare const isNoBuiltInMatch: (self: ValidationError) => self is NoBuiltInMatch
```

Added in v1.0.0

## isUnclusteredFlag

**Signature**

```ts
export declare const isUnclusteredFlag: (self: ValidationError) => self is UnclusteredFlag
```

Added in v1.0.0

# symbols

## ValidationErrorTypeId

**Signature**

```ts
export declare const ValidationErrorTypeId: typeof ValidationErrorTypeId
```

Added in v1.0.0

## ValidationErrorTypeId (type alias)

**Signature**

```ts
export type ValidationErrorTypeId = typeof ValidationErrorTypeId
```

Added in v1.0.0

# utils

## ValidationError (namespace)

Added in v1.0.0

### Proto (interface)

**Signature**

```ts
export interface Proto {
  readonly [ValidationErrorTypeId]: ValidationErrorTypeId
  readonly error: HelpDoc
}
```

Added in v1.0.0
