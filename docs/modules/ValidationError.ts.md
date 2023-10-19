---
title: ValidationError.ts
nav_order: 19
parent: Modules
---

## ValidationError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [commandMismatch](#commandmismatch)
  - [extraneousValue](#extraneousvalue)
  - [invalidArgument](#invalidargument)
  - [invalidValue](#invalidvalue)
  - [make](#make)
  - [missingSubCommand](#missingsubcommand)
  - [missingValue](#missingvalue)
- [models](#models)
  - [ValidationError (interface)](#validationerror-interface)
- [predicates](#predicates)
  - [isCommandMismatch](#iscommandmismatch)
  - [isInvalidArgument](#isinvalidargument)
  - [isInvalidValue](#isinvalidvalue)
  - [isMissingSubCommand](#ismissingsubcommand)
  - [isMissingValue](#ismissingvalue)
- [refinements](#refinements)
  - [isExtraneousValue](#isextraneousvalue)
  - [isValidationError](#isvalidationerror)
- [symbols](#symbols)
  - [ValidationErrorTypeId](#validationerrortypeid)
  - [ValidationErrorTypeId (type alias)](#validationerrortypeid-type-alias)
- [utils](#utils)
  - [ValidationError (namespace)](#validationerror-namespace)
    - [Proto (interface)](#proto-interface)
    - [Type (type alias)](#type-type-alias)

---

# constructors

## commandMismatch

**Signature**

```ts
export declare const commandMismatch: (error: HelpDoc) => ValidationError
```

Added in v1.0.0

## extraneousValue

**Signature**

```ts
export declare const extraneousValue: (error: HelpDoc) => ValidationError
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

## make

**Signature**

```ts
export declare const make: (type: ValidationError.Type, error: HelpDoc) => ValidationError
```

Added in v1.0.0

## missingSubCommand

**Signature**

```ts
export declare const missingSubCommand: (error: HelpDoc) => ValidationError
```

Added in v1.0.0

## missingValue

**Signature**

```ts
export declare const missingValue: (error: HelpDoc) => ValidationError
```

Added in v1.0.0

# models

## ValidationError (interface)

**Signature**

```ts
export interface ValidationError extends ValidationError.Proto {
  readonly type: ValidationError.Type
  readonly error: HelpDoc
}
```

Added in v1.0.0

# predicates

## isCommandMismatch

**Signature**

```ts
export declare const isCommandMismatch: (validationError: ValidationError) => boolean
```

Added in v1.0.0

## isInvalidArgument

**Signature**

```ts
export declare const isInvalidArgument: (validationError: ValidationError) => boolean
```

Added in v1.0.0

## isInvalidValue

**Signature**

```ts
export declare const isInvalidValue: (validationError: ValidationError) => boolean
```

Added in v1.0.0

## isMissingSubCommand

**Signature**

```ts
export declare const isMissingSubCommand: (validationError: ValidationError) => boolean
```

Added in v1.0.0

## isMissingValue

**Signature**

```ts
export declare const isMissingValue: (validationError: ValidationError) => boolean
```

Added in v1.0.0

# refinements

## isExtraneousValue

**Signature**

```ts
export declare const isExtraneousValue: (validationError: ValidationError) => boolean
```

Added in v1.0.0

## isValidationError

**Signature**

```ts
export declare const isValidationError: (u: unknown) => u is ValidationError
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
}
```

Added in v1.0.0

### Type (type alias)

**Signature**

```ts
export type Type =
  | 'ExtraneousValue'
  | 'InvalidValue'
  | 'MissingValue'
  | 'CommandMismatch'
  | 'MissingSubCommand'
  | 'InvalidArgument'
```

Added in v1.0.0
