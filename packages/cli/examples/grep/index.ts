#!/usr/bin/env node

import { pipe } from "@effect-ts/core/Function"
import * as R from "@effect-ts/node/Runtime"

import * as Args from "../../src/Args"
import * as CliApp from "../../src/CliApp"
import * as Command from "../../src/Command"
import * as Help from "../../src/Help"
import { putStrLn } from "../../src/Internal/Console"
import * as Options from "../../src/Options"

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

const afterFlag = pipe(Options.integer("after"), Options.alias("A"))

const beforeFlag = pipe(Options.integer("before"), Options.alias("B"))

const grepOptions = Options.tuple(afterFlag, beforeFlag)

const grepArgs = Args.text

const grepCommand = Command.make("grep", grepOptions, grepArgs)

// -----------------------------------------------------------------------------
// Application
// -----------------------------------------------------------------------------

const grepApp = CliApp.make({
  name: "Grep",
  version: "0.1.0",
  summary: Help.text("Simple grep"),
  command: grepCommand
})

// -----------------------------------------------------------------------------
// Program
// -----------------------------------------------------------------------------

pipe(
  grepApp,
  CliApp.run(process.argv.slice(2), ({ tuple: [after, before] }) =>
    putStrLn(`Called grep with after set to ${after} and before set to ${before}`)
  ),
  R.runMain
)
