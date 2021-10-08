// ets_tracing: off

import { Tagged } from "@effect-ts/core/Case"
import * as Structural from "@effect-ts/core/Structural"

import type { FigFont } from "../../core/FigFont"
import type { HorizontalLayout } from "../ClientOptions/HorizontalLayout"
import type { Justification } from "../ClientOptions/Justification"
import type { PrintDirection } from "../ClientOptions/PrintDirection"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * The `BuilderAction` data structure is used to defer the call of the
 * FigFont API at rendering time, to avoid dealing with calls that might fai,
 * such as loading a font, as well as the management of effects, while the user
 * is constructing the the font options.
 */
export type BuilderAction =
  | DefaultFontAction
  | DefaultHorizontalLayout
  | DefaultJustification
  | DefaultMaxWidthAction
  | DefaultPrintDirection
  | LoadFontAction
  | LoadInternalFontAction
  | SetFontAction
  | SetHorizontalLayout
  | SetJustification
  | SetMaxWidthAction
  | SetPrintDirection
  | SetTextAction

export class DefaultFontAction extends Tagged("DefaultFontAction")<{}> {
  actionTag = new FontTag()
}

export class DefaultHorizontalLayout extends Tagged("DefaultHorizontalLayout")<{}> {
  actionTag = new HorizontalLayoutTag()
}

export class DefaultJustification extends Tagged("DefaultJustification")<{}> {
  actionTag = new JustificationTag()
}

export class DefaultMaxWidthAction extends Tagged("DefaultMaxWidthAction")<{}> {
  actionTag = new MaxWidthActionTag()
}

export class DefaultPrintDirection extends Tagged("DefaultPrintDirection")<{}> {
  actionTag = new PrintDirectionTag()
}

export class LoadFontAction extends Tagged("LoadFontAction")<{
  readonly fontPath: string
}> {
  actionTag = new FontTag()
}

export class LoadInternalFontAction extends Tagged("LoadInternalFontAction")<{
  readonly fontPath: string
}> {
  actionTag = new FontTag()
}

export class SetFontAction extends Tagged("SetFontAction")<{
  readonly font: FigFont
}> {
  actionTag = new FontTag()
}

export class SetHorizontalLayout extends Tagged("SetHorizontalLayout")<{
  readonly layout: HorizontalLayout
}> {
  actionTag = new HorizontalLayoutTag()
}

export class SetJustification extends Tagged("SetJustification")<{
  readonly justification: Justification
}> {
  actionTag = new JustificationTag()
}

export class SetMaxWidthAction extends Tagged("SetMaxWidthAction")<{
  readonly maxWidth: number
}> {
  actionTag = new MaxWidthActionTag()
}

export class SetPrintDirection extends Tagged("SetPrintDirection")<{
  readonly direction: PrintDirection
}> {
  actionTag = new PrintDirectionTag()
}

export class SetTextAction extends Tagged("SetTextAction")<{
  readonly text: string
}> {
  actionTag = new TextTag()
}

export type ActionTag =
  | FontTag
  | HorizontalLayoutTag
  | JustificationTag
  | MaxWidthActionTag
  | PrintDirectionTag
  | TextTag

export class FontTag extends Tagged("FontTag")<{}> {}

export class HorizontalLayoutTag extends Tagged("HorizontalLayoutTag")<{}> {}

export class JustificationTag extends Tagged("JustificationTag")<{}> {}

export class MaxWidthActionTag extends Tagged("MaxWidthActionTag")<{}> {}

export class PrintDirectionTag extends Tagged("PrintDirectionTag")<{}> {}

export class TextTag extends Tagged("TextTag")<{}> {}

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

/**
 * Determines if two actions belong to the same group by using the action's
 * `ActionTag`.
 */
export function sameGroupAs_(a: BuilderAction, b: BuilderAction): boolean {
  return a.actionTag[Structural.equalsSym](b.actionTag)
}

/**
 * Determines if two actions belong to the same group by using the action's
 * `ActionTag`.
 *
 * @ets_data_first sameGroupAs_
 */
export function sameGroupAs(b: BuilderAction) {
  return (a: BuilderAction): boolean => sameGroupAs_(a, b)
}
