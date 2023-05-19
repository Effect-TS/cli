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
  Prompt.flatMap((name) =>
    pipe(
      Prompt.text({
        message: `Hello, ${name}, what is your question?`,
        validate: (value) =>
          value.length > 0 ?
            Effect.succeed(value) :
            Effect.fail("Question must be provided")
      }),
      Prompt.map((question) => question.length)
    )
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
