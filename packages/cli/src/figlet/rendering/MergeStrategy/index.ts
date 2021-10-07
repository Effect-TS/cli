// ets_tracing: off

import { Case } from "@effect-ts/core/Case"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import { constVoid } from "@effect-ts/core/Function"
import * as IO from "@effect-ts/core/IO"

import type { RenderOptions } from "../../client/RenderOptions"
import * as HorizontalMergeRules from "../HorizontalMergeRules"
import type { MergeAction } from "../MergeAction"
import * as MA from "../MergeAction"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type MergeStrategy = (
  state: MergeState
) => (char0: string, char1: string) => MergeAction<string>

export class MergeState extends Case<{
  readonly overlap: number
  readonly currentCharWidth: number
  readonly lastCharWidth: number
}> {}

/**
 * Represents the status of the merge loop.
 */
export class MergeLoopState extends Case<{
  readonly a: Columns
  readonly b: Columns
  readonly overlap: number
  readonly partialResult: Columns
  readonly appendLoopState: AppendLoopState
}> {}

/**
 * Represents the status of the append loop.
 */
export class AppendLoopState extends Case<{
  readonly lastCharWidth: number
}> {}

/**
 * Shortcut type for a set of columns.
 */
export type Columns = Chunk<string>

/**
 * Represents the three sections of a set of columns.
 */
export class Sections extends Case<{
  readonly left: Columns
  readonly overlap: Columns
  readonly right: Columns
}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export function sections(left: Columns, overlap: Columns, right: Columns): Sections {
  return new Sections({ left, overlap, right })
}

export function appendLoopState(lastCharWidth = 0): AppendLoopState {
  return new AppendLoopState({ lastCharWidth })
}

export function mergeLoopState(
  params: Partial<{
    readonly a: Columns
    readonly b: Columns
    readonly overlap: number
    readonly partialResult: Columns
    readonly appendLoopState: AppendLoopState
  }>
): MergeLoopState {
  return new MergeLoopState({
    a: C.empty(),
    b: C.empty(),
    overlap: 0,
    partialResult: C.empty(),
    appendLoopState: appendLoopState(),
    ...params
  })
}

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
  return HorizontalMergeRules.mergeStrategy(options)
}

export function appendLoop(
  options: RenderOptions,
  figures: Chunk<Columns>,
  partial: Chunk<Columns>,
  state: AppendLoopState
): Chunk<Columns> {
  return IO.run(appendLoopRec(options, figures, partial, state))
}

function appendLoopRec(
  options: RenderOptions,
  figures: Chunk<Columns>,
  partial: Chunk<Columns>,
  state: AppendLoopState
): IO.IO<Chunk<Columns>> {
  return IO.gen(function* (_) {
    if (C.isEmpty(figures)) {
      return partial
    }

    const {
      tuple: [head, remainingChars]
    } = C.splitAt_(figures, 1)
    const figChar = C.unsafeGet_(head, 0)
    const {
      tuple: [upperLines, last]
    } = C.splitAt_(partial, partial.length - 1)
    const lastLine = C.unsafeGet_(last, 0)

    const merged = yield* _(
      mergeRec(
        options,
        mergeLoopState({
          a: lastLine,
          b: figChar,
          appendLoopState: state
        })
      )
    )
    const onBorder = yield* _(mergeRec(options, mergeLoopState({ b: figChar })))
    const result =
      merged.length <= options.maxWidth
        ? C.append_(upperLines, merged)
        : C.append_(partial, onBorder)
    const nextState = state.copy({ lastCharWidth: figChar.length })

    return yield* _(appendLoopRec(options, remainingChars, result, nextState))
  })
}

function mergeRec(options: RenderOptions, state: MergeLoopState): IO.IO<Columns> {
  return IO.gen(function* (_) {
    if (state.overlap === 0) {
      return yield* _(
        mergeRec(
          options,
          state.copy({ overlap: 1, partialResult: C.concat_(state.a, state.b) })
        )
      )
    }

    if (state.overlap > state.b.length) {
      return state.partialResult
    }

    const mState = new MergeState({
      overlap: state.overlap,
      currentCharWidth: state.b.length,
      lastCharWidth: state.appendLoopState.lastCharWidth
    })

    const aLeftCut = Math.max(0, state.a.length - state.overlap)
    const aRightCut = Math.min(
      state.a.length,
      state.a.length - state.overlap + state.b.length
    )
    const aSections = splitSections(aLeftCut, aRightCut, state.a)

    const bLeftCut = Math.max(0, state.overlap - state.a.length)
    const bRightCut = Math.min(state.overlap, state.b.length)
    const bSections = splitSections(bLeftCut, bRightCut, state.b)

    const leftSide = mergeOnLeftBorder(options, mState, bSections.left)
    const merged = mergeOverlappingSections(
      options,
      mState,
      aSections.overlap,
      bSections.overlap
    )
    const rightSide = new MA.Continue({
      value: C.concat_(aSections.right, bSections.right)
    })

    const result = MA.map_(
      MA.tuple(leftSide, merged, rightSide),
      ([_, merged, right]) => C.concat_(aSections.left, C.concat_(merged, right))
    )

    switch (result._tag) {
      case "Stop":
        return state.partialResult
      case "CurrentLast":
        return result.value
      case "Continue":
        return yield* _(
          mergeRec(
            options,
            state.copy({ overlap: state.overlap + 1, partialResult: result.value })
          )
        )
    }
  })
}

/**
 * Divides a set of columns into 3 sections with cuts in 2 points.
 */
function splitSections(aPoint: number, bPoint: number, figure: Columns): Sections {
  return C.reduce_(
    C.zipWithIndex(figure),
    sections(C.empty(), C.empty(), C.empty()),
    (store, { tuple: [column, i] }) => {
      if (i < aPoint) return store.copy({ left: C.append_(store.left, column) })
      if (i >= bPoint) return store.copy({ right: C.append_(store.right, column) })
      return store.copy({ overlap: C.append_(store.overlap, column) })
    }
  )
}

/**
 * Merges the two overlapping sections of two characters.
 */
function mergeOverlappingSections(
  options: RenderOptions,
  state: MergeState,
  aSection: Columns,
  bSection: Columns
): MergeAction<Columns> {
  return C.forEachF_(
    C.zip_(aSection, bSection),
    MA.Applicative
  )(({ tuple: [aActiveColumn, bActiveColumn] }) =>
    MA.map_(
      C.forEachF_(
        C.zip_(C.from(aActiveColumn.split("")), C.from(bActiveColumn.split(""))),
        MA.Applicative
      )(({ tuple: [aChar, bChar] }) => mergeStrategy(options)(state)(aChar, bChar)),
      C.join("")
    )
  )
}

/**
 * Merges a character on the left border.
 */
function mergeOnLeftBorder(
  options: RenderOptions,
  state: MergeState,
  section: Columns
): MergeAction<void> {
  return MA.map_(
    C.forEachF_(
      section,
      MA.Applicative
    )((_) =>
      _ === " "
        ? mergeStrategy(options)(state)(options.font.header.hardblank, " ")
        : new MA.Stop()
    ),
    constVoid
  )
}
