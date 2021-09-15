// ets_tracing: off

import type { HelpDoc } from "../Help"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export class ValidationError {
  constructor(readonly type: ValidationErrorType, readonly error: HelpDoc) {}
}

export type ValidationErrorType =
  | InvalidValue
  | MissingValue
  | CommandMismatch
  | MissingSubcommand
  | InvalidArgument

export class InvalidValue {
  readonly _tag = "InvalidValue"
}

export class MissingValue {
  readonly _tag = "MissingValue"
}

export class CommandMismatch {
  readonly _tag = "CommandMismatch"
}

export class MissingSubcommand {
  readonly _tag = "MissingSubcommand"
}

export class InvalidArgument {
  readonly _tag = "InvalidArgument"
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const invalidValue: ValidationErrorType = new InvalidValue()

export const missingValue: ValidationErrorType = new MissingValue()

export const commandMismatch: ValidationErrorType = new CommandMismatch()

export const missingSubcommand: ValidationErrorType = new MissingSubcommand()

export const invalidArgument: ValidationErrorType = new InvalidArgument()

export function invalidValueError(error: HelpDoc): ValidationError {
  return new ValidationError(invalidValue, error)
}

export function missingValueError(error: HelpDoc): ValidationError {
  return new ValidationError(missingValue, error)
}

export function commandMismatchError(error: HelpDoc): ValidationError {
  return new ValidationError(commandMismatch, error)
}

export function missingSubcommandError(error: HelpDoc): ValidationError {
  return new ValidationError(missingSubcommand, error)
}

export function invalidArgumentError(error: HelpDoc): ValidationError {
  return new ValidationError(invalidArgument, error)
}

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

export function isOptionMissing(self: ValidationError): boolean {
  return self.type instanceof MissingValue
}
