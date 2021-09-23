import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import type { Has } from "@effect-ts/core/Has"
import { tag } from "@effect-ts/core/Has"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export const ConsoleServiceSymbol = Symbol()
export type ConsoleServiceSymbol = typeof ConsoleServiceSymbol

export interface ConsoleService {
  readonly [ConsoleServiceSymbol]: ConsoleServiceSymbol
  readonly putStrLn: (x: string) => T.UIO<void>
}

export interface Console extends ConsoleService {}

export type HasConsole = Has<Console>

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const Console = tag<Console>()

export const defaultConsole: Console = {
  [ConsoleServiceSymbol]: ConsoleServiceSymbol,
  putStrLn: (x) =>
    T.succeedWith(() => {
      console.log(x)
    })
}

export const LiveConsole = L.pure(Console)(defaultConsole)

export const { putStrLn } = T.deriveLifted(Console)(["putStrLn"], [], [])
