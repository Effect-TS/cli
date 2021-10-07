import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as E from "@effect-ts/core/Either"

import type { FigletResult } from "../../src/figlet/error/FigletException"

export function stringifyError<A>(value: FigletResult<A>) {
  return E.mapLeft_(
    value,
    NA.map((error) => `${error._tag} - ${error.message}`)
  )
}

// -----------------------------------------------------------------------------
// String Utilities
// -----------------------------------------------------------------------------

export class LinesIterator implements IterableIterator<string> {
  /**
   * Represents the character code of a carriage return character (`"\r"`).
   */
  static CR = 0x0d

  /**
   * Represents the character code of a line-feed character (`"\n"`).
   */
  static LF = 0x0a

  private index: number
  private length: number

  constructor(readonly s: string, readonly stripped: boolean = false) {
    this.index = 0
    this.length = s.length
  }

  next(): IteratorResult<string> {
    if (this.done()) {
      return { done: true, value: undefined }
    }

    const start = this.index

    while (!this.done() && !this.isLineBreak(this.s[this.index])) {
      this.index = this.index + 1
    }

    let end = this.index

    if (!this.done()) {
      const char = this.s[this.index]

      this.index = this.index + 1

      if (!this.done() && this.isLineBreak2(char, this.s[this.index])) {
        this.index = this.index + 1
      }

      if (!this.stripped) {
        end = this.index
      }
    }

    return { done: false, value: this.s.substring(start, end) }
  }

  [Symbol.iterator](): IterableIterator<string> {
    return new LinesIterator(this.s, this.stripped)
  }

  private done(): boolean {
    return this.index >= this.length
  }

  /**
   * Test if the provided character is a line break character (i.e. either `"\r"`
   * or `"\n"`).
   */
  private isLineBreak(char: string): boolean {
    const code = char.charCodeAt(0)
    return code === LinesIterator.CR || code === LinesIterator.LF
  }

  /**
   * Test if the provided characters combine to form a carriage return/line-feed
   * (i.e. `"\r\n"`).
   */
  private isLineBreak2(char0: string, char1: string): boolean {
    return (
      char0.charCodeAt(0) === LinesIterator.CR &&
      char1.charCodeAt(0) === LinesIterator.LF
    )
  }
}

function linesSeparated(s: string, stripped: boolean): LinesIterator {
  return new LinesIterator(s, stripped)
}

export function linesIterator(s: string): LinesIterator {
  return linesSeparated(s, true)
}

export function linesWithSeparators(s: string): LinesIterator {
  return linesSeparated(s, false)
}

export function stripMargin(
  template: TemplateStringsArray,
  ...expressions: string[]
): string {
  return stripMarginWith("|")(template, ...expressions)
}

export function stripMarginWith(marginChar: string) {
  return (template: TemplateStringsArray, ...expressions: string[]): string => {
    let out = ""

    const s = template.reduce(
      (accumulator, part, i) => accumulator + expressions[i - 1] + part
    )

    for (const line of linesWithSeparators(s)) {
      let index = 0

      while (index < line.length && line.charAt(index) <= " ") {
        index += 1
      }

      const stripped =
        index < line.length && line.charAt(index) === marginChar
          ? line.substring(index + 1)
          : line

      out += stripped
    }

    return out
  }
}
