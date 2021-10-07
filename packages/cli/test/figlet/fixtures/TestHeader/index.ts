import { Case } from "@effect-ts/core/Case"
import type { Array } from "@effect-ts/core/Collections/Immutable/Array"
import * as A from "@effect-ts/core/Collections/Immutable/Array"

import * as FigHeader from "../../../../src/figlet/core/FigHeader"
import type { FigletResult } from "../../../../src/figlet/error/FigletException"
import * as StandardFont from "../StandardFont"

export class TestHeader extends Case<{
  readonly signature: string
  readonly hardblank: string
  readonly height: string
  readonly baseline: string
  readonly maxLength: string
  readonly oldLayout: string
  readonly commentLines: string
  readonly printDirection: string
  readonly fullLayout: string
  readonly codeTagCount: string
}> {
  static default = new TestHeader({
    signature: StandardFont.signature,
    hardblank: StandardFont.hardblank,
    height: StandardFont.height,
    baseline: StandardFont.baseline,
    maxLength: StandardFont.maxLength,
    oldLayout: StandardFont.oldLayout,
    commentLines: StandardFont.commentLines,
    printDirection: StandardFont.printDirection,
    fullLayout: StandardFont.fullLayout,
    codeTagCount: StandardFont.codetagCount
  })

  toArray(): Array<string> {
    return [
      this.signature,
      this.hardblank,
      this.height,
      this.baseline,
      this.maxLength,
      this.oldLayout,
      this.commentLines,
      this.printDirection,
      this.fullLayout,
      this.codeTagCount
    ]
  }

  toFigHeader(): FigletResult<FigHeader.FigHeader> {
    return FigHeader.fromLine(this.toLine())
  }

  toLine(): string {
    return A.join_(this.toArray(), " ").replace(" ", "")
  }

  withoutPrintDirection(): string {
    return A.join_(A.dropRight_(this.toArray(), 3), " ").replace(" ", "")
  }

  withoutFullLayout(): string {
    return A.join_(A.dropRight_(this.toArray(), 2), " ").replace(" ", "")
  }

  withoutCodetagCount(): string {
    return A.join_(A.dropRight_(this.toArray(), 1), " ").replace(" ", "")
  }
}
