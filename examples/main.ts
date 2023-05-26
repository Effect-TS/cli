import * as Prompt from "@effect/cli/Prompt"
import * as Terminal from "@effect/cli/Terminal"
import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"

const myPrompt: Prompt.Prompt<number> = pipe(
  Prompt.text({
    message: "What is your name?",
    type: "password",
    validate: (value) =>
      value.length > 0 ?
        Effect.succeed(value) :
        Effect.fail("Name must be provided")
  }),
  Prompt.flatMap(() =>
    Prompt.int({
      message: `What is your favorite number?`,
      min: 0,
      max: 5
    })
  )
)

const program = pipe(
  Prompt.run(myPrompt),
  Effect.provideLayer(Terminal.layer)
)

Effect.runCallback(program, (exit) =>
  exit._tag === "Success"
    ? console.log(exit.value)
    : console.log(exit.cause))
