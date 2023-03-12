import type * as Console from "@effect/cli/Console"
import * as Context from "@effect/data/Context"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"

class ConsoleImpl {
  printLine(text: string): Effect.Effect<never, never, void> {
    return Effect.sync(() => {
      console.log(text)
    })
  }
}

/** @internal */
export const Tag = Context.Tag<Console.Console>()

/** @internal */
export const layer: Layer.Layer<never, never, Console.Console> = Layer.sync(Tag, () => new ConsoleImpl())
