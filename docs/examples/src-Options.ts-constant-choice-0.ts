import * as Options from '../../src/Options'

export const animal: Options.Options<"dog" | "cat"> = Options.choice(
  "animal",
  ["dog", "cat"]
)
