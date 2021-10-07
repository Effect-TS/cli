// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type { Either } from "@effect-ts/core/Either"
import * as E from "@effect-ts/core/Either"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * The outcome of an operation that might result in one or more errors.
 *
 * @template A The type of the valid value contained in a FigletResult.
 */
export type FigletResult<A> = Either<NonEmptyArray<FigletException>, A>

/**
 * Generic exception that can occur within the Figlet sublibrary.
 */
export type FigletException =
  | FigletError
  | FigletLoadingError
  | FigletFileError
  | FigHeaderError
  | FigCharacterError
  | FigFontError

/**
 * An error that occurred during the execution of the Figlet sublibrary.
 */
export class FigletError extends Tagged("FigletError")<{
  /**
   * @param message The description of the error.
   */
  readonly message: string
}> {}

/**
 * An error that can occur when loading a file.
 */
export class FigletLoadingError extends Tagged("FigletLoadingError")<{
  /**
   * @param message The description of the error.
   */
  readonly message: string
}> {}

/**
 * An error that can occur when interpreting a Figlet file.
 */
export class FigletFileError extends Tagged("FigletFileError")<{
  /**
   * @param message The description of the error.
   */
  readonly message: string
}> {}

/**
 * An error that can occur when interpreting a FigHeader.
 */
export class FigHeaderError extends Tagged("FigHeaderError")<{
  /**
   * @param message The description of the error.
   */
  readonly message: string
}> {}

/**
 * An error that can occur when interpreting a FigCharacter.
 */
export class FigCharacterError extends Tagged("FigCharacterError")<{
  /**
   * The description of the error.
   */
  readonly message: string
}> {}

/**
 * An error that can occur when interpreting a FigFontError.
 */
export class FigFontError extends Tagged("FigFontError")<{
  /**
   * The description of the error.
   */
  readonly message: string
}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export function toFigletError_<E, A>(
  a: A,
  check: (a: A) => Either<string, A>
): Either<NonEmptyArray<FigletException>, A> {
  return E.mapLeft_(check(a), (message) => NA.single(new FigletError({ message })))
}

// -----------------------------------------------------------------------------
// Instances
// -----------------------------------------------------------------------------

export const Applicative = E.getValidationApplicative(
  NA.getAssociative<FigletException>()
)
