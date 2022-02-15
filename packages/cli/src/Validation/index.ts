// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"

import type { HelpDoc } from "../Help/index.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type ValidationError =
  | InvalidValue
  | MissingValue
  | CommandMismatch
  | MissingSubcommand
  | InvalidArgument

export class InvalidValue extends Tagged("InvalidValue")<{
  readonly help: HelpDoc
}> {}

export class MissingValue extends Tagged("MissingValue")<{
  readonly help: HelpDoc
}> {}

export class CommandMismatch extends Tagged("CommandMismatch")<{
  readonly help: HelpDoc
}> {}

export class MissingSubcommand extends Tagged("MissingSubcommand")<{
  readonly help: HelpDoc
}> {}

export class InvalidArgument extends Tagged("InvalidArgument")<{
  readonly help: HelpDoc
}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export function invalidValue(help: HelpDoc): ValidationError {
  return new InvalidValue({ help })
}

export function missingValue(help: HelpDoc): ValidationError {
  return new MissingValue({ help })
}

export function commandMismatch(help: HelpDoc): ValidationError {
  return new CommandMismatch({ help })
}

export function missingSubcommand(help: HelpDoc): ValidationError {
  return new MissingSubcommand({ help })
}

export function invalidArgument(help: HelpDoc): ValidationError {
  return new InvalidArgument({ help })
}

// -----------------------------------------------------------------------------
// Refinements
// -----------------------------------------------------------------------------

export function isInvalidValue(self: ValidationError): self is InvalidValue {
  return self._tag === "InvalidValue"
}

export function isMissingValue(self: ValidationError): self is MissingValue {
  return self._tag === "MissingValue"
}

export function isCommandMismatch(self: ValidationError): self is CommandMismatch {
  return self._tag === "CommandMismatch"
}

export function isMissingSubcommand(self: ValidationError): self is MissingSubcommand {
  return self._tag === "MissingSubcommand"
}

export function isInvalidArgument(self: ValidationError): self is InvalidArgument {
  return self._tag === "InvalidArgument"
}
