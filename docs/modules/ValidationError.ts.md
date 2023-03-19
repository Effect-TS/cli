---
title: ValidationError.ts
nav_order: 16
parent: Modules
---

## ValidationError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [commandMismatch](#commandmismatch)
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
  - [isValidationError](#isvalidationerror)
- [symbols](#symbols)
  - [ValidationErrorTypeId](#validationerrortypeid)
  - [ValidationErrorTypeId (type alias)](#validationerrortypeid-type-alias)

---

# constructors

## commandMismatch

**Signature**

```ts
export declare const commandMismatch: (error: any) => ValidationError
```

Added in v1.0.0

## invalidArgument

**Signature**

```ts
export declare const invalidArgument: (error: any) => ValidationError
```

Added in v1.0.0

## invalidValue

**Signature**

```ts
export declare const invalidValue: (error: any) => ValidationError
```

Added in v1.0.0

## make

**Signature**

```ts
export declare const make: (type: ValidationError.Type, error: any) => ValidationError
```

Added in v1.0.0

## missingSubCommand

**Signature**

```ts
export declare const missingSubCommand: (error: any) => ValidationError
```

Added in v1.0.0

## missingValue

**Signature**

```ts
export declare const missingValue: (error: any) => ValidationError
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
