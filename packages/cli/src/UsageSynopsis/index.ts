// ets_tracing: off

import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as IO from "@effect-ts/core/IO"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

import type { HelpDoc } from "../Help"
import * as Help from "../Help"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type UsageSynopsis =
  | Named
  | Optional
  | Repeated
  | Concat
  | Alternation
  | Mixed
  | None

export class Named {
  readonly _tag = "Named"
  constructor(readonly name: string, readonly choices: Option<string>) {}
}

export class Optional {
  readonly _tag = "Optional"
  constructor(readonly value: UsageSynopsis) {}
}

export class Repeated {
  readonly _tag = "Repeated"
  constructor(readonly value: UsageSynopsis) {}
}

export class Concat {
  readonly _tag = "Concat"
  constructor(readonly left: UsageSynopsis, readonly right: UsageSynopsis) {}
}

export class Alternation {
  readonly _tag = "Alternation"
  constructor(readonly left: UsageSynopsis, readonly right: UsageSynopsis) {}
}

export class Mixed {
  readonly _tag = "Mixed"
}

export class None {
  readonly _tag = "None"
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export function named(name: string, choices: Option<string>): UsageSynopsis {
  return new Named(name, choices)
}

export function optional(value: UsageSynopsis): UsageSynopsis {
  return new Optional(value)
}

export function repeated(value: UsageSynopsis): UsageSynopsis {
  return new Repeated(value)
}

export function concat_(left: UsageSynopsis, right: UsageSynopsis): UsageSynopsis {
  return new Concat(left, right)
}

/**
 * @ets_data_first concat_
 */
export function concat(right: UsageSynopsis) {
  return (left: UsageSynopsis): UsageSynopsis => concat_(left, right)
}

export function concats(synopses: Array<UsageSynopsis>): UsageSynopsis {
  return A.foldLeft_(
    synopses,
    () => none,
    (head, tail) => {
      const synopses = A.filter_(tail, (synopsis) => synopsis._tag !== "None")
      return synopses.length === 0 ? head : A.reduce_(synopses, head, concat_)
    }
  )
}

export function concatsT(...synopses: Array<UsageSynopsis>): UsageSynopsis {
  return concats(synopses)
}

export function alternation_(left: UsageSynopsis, right: UsageSynopsis): UsageSynopsis {
  return new Alternation(left, right)
}

/**
 * @ets_data_first alternation_
 */
export function alternation(right: UsageSynopsis) {
  return (left: UsageSynopsis): UsageSynopsis => alternation_(left, right)
}

export const mixed: UsageSynopsis = new Mixed()

export const none: UsageSynopsis = new None()

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

function renderRec(self: UsageSynopsis): IO.IO<HelpDoc> {
  return IO.gen(function* (_) {
    switch (self._tag) {
      case "Named": {
        return O.fold_(
          self.choices,
          () => Help.text(self.name),
          (choices) => Help.text(`${self.name} ${choices}`)
        )
      }
      case "Optional": {
        const inner = yield* _(renderRec(self.value))
        return Help.spansT(Help.text("["), inner, Help.text("]"))
      }
      case "Repeated": {
        const value = yield* _(renderRec(self.value))
        return Help.concat_(value, Help.text("..."))
      }
      case "Concat": {
        const left = yield* _(renderRec(self.left))
        const right = yield* _(renderRec(self.right))
        if (left._tag === "Empty") return right
        if (right._tag === "Empty") return left
        return Help.spansT(left, Help.space, right)
      }
      case "Alternation": {
        const left = yield* _(renderRec(self.left))
        const right = yield* _(renderRec(self.right))
        if (left._tag === "Empty") return right
        if (right._tag === "Empty") return left
        return Help.spansT(left, Help.text("|"), right)
      }
      case "Mixed": {
        return Help.text("<command> [<args>]")
      }
      case "None":
        return Help.empty
    }
  })
}

export function render(self: UsageSynopsis): HelpDoc {
  return IO.run(renderRec(self))
}
