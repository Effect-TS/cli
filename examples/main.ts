import * as Prompt from "@effect/cli/Prompt"
import * as Terminal from "@effect/cli/Terminal"
import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"

const myPrompt: Prompt.Prompt<string> = pipe(
  Prompt.select({
    message: "Pick a color",
    choices: [
      { title: "Red", description: "This option has a description", value: "#ff0000" },
      { title: "Green", value: "#00ff00" },
      { title: "Blue", value: "#0000ff" }
    ]
  })
)

const program = pipe(
  Prompt.run(myPrompt),
  Effect.provideLayer(Terminal.layer)
)

Effect.runCallback(program, (exit) =>
  exit._tag === "Success"
    ? console.log(exit.value)
    : console.log(exit.cause))
