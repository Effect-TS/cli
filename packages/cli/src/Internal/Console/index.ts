import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import type { Has, Tag } from "@effect-ts/core/Has"
import { service, tag } from "@effect-ts/core/Has"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export const ConsoleId = Symbol()
export type ConsoleId = typeof ConsoleId

export function makeConsole() {
  return service(ConsoleId, {
    putStrLn: (x: string) =>
      T.succeedWith(() => {
        console.log(x)
      })
  })
}

export interface Console extends ReturnType<typeof makeConsole> {}

export type HasConsole = Has<Console>

export const Console: Tag<Console> = tag<Console>(ConsoleId)

export const LiveConsole: L.Layer<unknown, never, HasConsole> =
  L.fromFunction(Console)(makeConsole)

export const { putStrLn } = T.deriveLifted(Console)(["putStrLn"], [], [])
