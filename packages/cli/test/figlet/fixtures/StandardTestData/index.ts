import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import { pipe } from "@effect-ts/system/Function"

import type { OptionsBuilder } from "../../../../src/figlet/client/OptionsBuilder"
import * as Builder from "../../../../src/figlet/client/OptionsBuilder"
import { SubLines } from "../../../../src/figlet/core/SubElements/SubLines"

export const standardBuilder: OptionsBuilder = pipe(
  Builder.builder(),
  Builder.withDefaultFont
)

export const standardInput = "~ * Fao & C 123"

export const standardLines: SubLines = new SubLines({
  value: C.from([
    " /\\/|         _____              ___      ____   _ ____  _____ ",
    "|/\\/  __/\\__ |  ___|_ _  ___    ( _ )    / ___| / |___ \\|___ / ",
    "      \\    / | |_ / _` |/ _ \\   / _ \\/\\ | |     | | __) | |_ \\ ",
    "      /_  _\\ |  _| (_| | (_) | | (_>  < | |___  | |/ __/ ___) |",
    "        \\/   |_|  \\__,_|\\___/   \\___/\\/  \\____| |_|_____|____/ ",
    "                                                               "
  ])
})
