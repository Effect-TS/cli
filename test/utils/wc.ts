import * as Args from "@effect/cli/Args"
import * as Command from "@effect/cli/Command"
import * as Options from "@effect/cli/Options"
import type { Chunk } from "@effect/data/Chunk"
import { pipe } from "@effect/data/Function"

const bytesFlag = Options.boolean("c")
const linesFlag = Options.boolean("l")
const wordsFlag = Options.boolean("w")
const charFlag = Options.boolean("m")
export const options: Options.Options<readonly [boolean, boolean, boolean, boolean]> = pipe(
  bytesFlag,
  Options.zip(linesFlag),
  Options.zipFlatten(wordsFlag),
  Options.zipFlatten(charFlag)
)

export const args: Args.Args<Chunk<string>> = Args.repeat(Args.text({ name: "files" }))

export const command: Command.Command<readonly [readonly [boolean, boolean, boolean, boolean], Chunk<string>]> = Command
  .make("wc", options, args)
