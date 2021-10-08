// ets_tracing: off

import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import type { Option } from "@effect-ts/core/Option"
import * as O from "@effect-ts/core/Option"

import * as ClientHorizontalLayout from "../../client/ClientOptions/HorizontalLayout"
import type { RenderOptions } from "../../client/RenderOptions"
import type * as FontHorizontalLayout from "../../core/FigFontParameters/HorizontalLayout"
import type { HorizontalSmushingRule } from "../../core/FigFontParameters/HorizontalSmushingRule"
import * as MergeAction from "../MergeAction"
import type { MergeState, MergeStrategy } from "../MergeStrategy"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type SmushingStrategy = (char0: string, char1: string) => Option<string>

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

/**
 * Creates a merge strategy to perform horizontal merging, based on the given
 * `RenderOptions`.
 *
 * @param options The `RenderOptions` used to build the `MergeStrategy`.
 * @return A `MergeStrategy` function that performs horizontal merging.
 */
export function mergeStrategy(options: RenderOptions): MergeStrategy {
  const chosenLayout = ClientHorizontalLayout.toInternalLayout_(
    options.horizontalLayout,
    options.font
  )
  return layoutToMergeStrategy_(chosenLayout, options.font.header.hardblank)
}

/**
 * Returns the merge strategy function for a given layout.
 */
function layoutToMergeStrategy_(
  layout: FontHorizontalLayout.HorizontalLayout,
  hardblank: string
): MergeStrategy {
  switch (layout._tag) {
    case "FullWidth":
      return fullWidthStrategy
    case "HorizontalFitting":
      return horizontalFittingStrategy
    case "UniversalSmushing":
      return universalHorizontalSmushingStrategy(hardblank)
    case "ControlledSmushing":
      return controlledHorizontalSmushingStrategy(hardblank, layout.rules)
  }
}

/**
 * A `MergeStrategy` for the `FullWidth` horizontal layout.
 */
const fullWidthStrategy: MergeStrategy = () => () => new MergeAction.Stop()

/**
 * A `MergeStrategy` for the `HorizontalFitting` horizontal layout.
 */
const horizontalFittingStrategy: MergeStrategy = () => (a, b) => {
  if (b === " ") return new MergeAction.Continue({ value: a })
  if (a === " ") return new MergeAction.Continue({ value: b })
  return new MergeAction.Stop()
}

/**
 * A `MergeStrategy` for the `UniversalSmushing` horizontal layout.
 */
function universalHorizontalSmushingStrategy(hardblank: string): MergeStrategy {
  return (state) => (a, b) => {
    if (b === " ") return new MergeAction.Continue({ value: a })
    if (a === " ") return new MergeAction.Continue({ value: b })
    if (skipSmushing(state)) return new MergeAction.Stop()
    if (b === hardblank) {
      return a === hardblank
        ? new MergeAction.Stop()
        : new MergeAction.CurrentLast({ value: a })
    }
    return new MergeAction.CurrentLast({ value: b })
  }
}

/**
 * A `MergeStrategy` for the `ControlledSmushing` horizontal layout.
 */
function controlledHorizontalSmushingStrategy(
  hardblank: string,
  rules: Chunk<HorizontalSmushingRule>
): MergeStrategy {
  return (state) => (a, b) => {
    if (b === " ") return new MergeAction.Continue({ value: a })
    if (a === " ") return new MergeAction.Continue({ value: b })
    if (skipSmushing(state)) return new MergeAction.Stop()
    return O.fold_(
      C.head(
        C.compact(
          C.map_(C.map_(rules, ruleToSmushingStrategy(hardblank)), (f) => f(a, b))
        )
      ),
      () => new MergeAction.Stop(),
      (value) => new MergeAction.CurrentLast({ value })
    )
  }
}

/**
 * A note in the original figlet source code states: "Disallows overlapping
 * if the previous character or the current character has a width of 1 or zero".
 * This is an undocumented behaviour.
 */
function skipSmushing(state: MergeState): boolean {
  return state.lastCharWidth <= 1 || state.currentCharWidth <= 1
}

/**
 * Returns a smushing strategy function given the smushing rule.
 */
function ruleToSmushingStrategy(hardblank: string) {
  return (rule: HorizontalSmushingRule): SmushingStrategy => {
    switch (rule._tag) {
      case "EqualCharacter":
        return equalCharacterSmushingRule(hardblank)
      case "Underscore":
        return underscoreSmushingRule
      case "Hierarchy":
        return hierarchySmushingRule
      case "OppositePair":
        return oppositePairSmushingRule
      case "BigX":
        return bigXSmushingRule
      case "Hardblank":
        return hardblankSmushingRule(hardblank)
    }
  }
}

/**
 * Two sub-characters are smushed into a single sub-character if they are the
 * same. This rule does not smush hardblanks.
 */
function equalCharacterSmushingRule(hardblank: string): SmushingStrategy {
  return (a, b) => (a === b && a !== hardblank ? O.some(a) : O.none)
}

/**
 * An underscore (`"_"`) will be replaced by any of: `"|", "/", "\", "[", "]",
 * "{", "}", "(", ")", "<", or ">"`.
 */
const underscoreSmushingRule: SmushingStrategy = (a, b) => {
  const replaceWith = "|/\\[]{}()<>"
  if (a === "_" && replaceWith.includes(b)) return O.some(b)
  if (b === "_" && replaceWith.includes(a)) return O.some(a)
  return O.none
}

/**
 * A hierarchy of six classes is used: `"|", "/\", "[]", "{}", "()", and "<>"`.
 * When two smushing sub-characters are from different classes, the one from
 * the latter class will be used.
 */
const hierarchySmushingRule: SmushingStrategy = (a, b) => {
  const classes = C.from(["|", "/\\", "[]", "{}", "()", "<>"])
  const aClass = C.indexWhere_(classes, (_) => _.includes(a))
  const bClass = C.indexWhere_(classes, (_) => _.includes(b))
  if (aClass >= 0 && bClass >= 0 && aClass !== bClass) {
    return aClass > bClass ? O.some(a) : O.some(b)
  }
  return O.none
}

/**
 * Smushes opposing brackets (`"[]"` or `"]["`), braces (`"{}"` or `"}{"`) and
 * parentheses (`"()"` or `")("`) together, replacing any such pair with a
 * vertical bar (`"|"`).
 */
const oppositePairSmushingRule: SmushingStrategy = (a, b) => {
  if (a === "{" && b === "}") return O.some("|")
  if (a === "}" && b === "{") return O.some("|")
  if (a === "[" && b === "]") return O.some("|")
  if (a === "]" && b === "[") return O.some("|")
  if (a === "(" && b === ")") return O.some("|")
  if (a === ")" && b === "(") return O.some("|")
  return O.none
}

/**
 * Smushes `"/\"` into `"|"`, `"\/"` into `"Y"`, and `"><"` into `"X"`.
 *
 * Note that `"<>"` is not smushed in any way by this rule. The name "BIG X" is
 * historical; originally all three pairs were smushed into `"X"`.
 */
const bigXSmushingRule: SmushingStrategy = (a, b) => {
  if (a === "/" && b === "\\") return O.some("|")
  if (a === "\\" && b === "/") return O.some("Y")
  if (a === ">" && b === "<") return O.some("X")
  return O.none
}

/**
 * Smushes two hardblanks together, replacing them with a single hardblank.
 */
function hardblankSmushingRule(hardblank: string): SmushingStrategy {
  return (a, b) => (a === hardblank && a === b ? O.some(a) : O.none)
}
