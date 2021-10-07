import { Case } from "@effect-ts/core/Case"
import type { Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import type * as Map from "@effect-ts/core/Collections/Immutable/Map"
import { pipe } from "@effect-ts/core/Function"

import * as StandardFont from "../StandardFont"
import { TestHeader } from "../TestHeader"

export class TestFont extends Case<{
  readonly header: TestHeader
  readonly comment: string
  readonly characters: Map.Map<string, string>
  readonly codeTag: Map.Map<string, string>
}> {
  static default = new TestFont({
    header: TestHeader.default,
    comment: StandardFont.comment,
    characters: StandardFont.characters,
    codeTag: StandardFont.codeTag
  })

  allLines(includeTags = true): Chunk<string> {
    const updatedHeader = includeTags
      ? this.header
      : this.header.copy({ codeTagCount: "0" })

    const partial = pipe(
      C.from(this.comment.split("\n")),
      C.concat(
        C.chain_(C.from(this.characters.values()), (_) => C.from(_.split("\n")))
      ),
      C.prepend(updatedHeader.toLine())
    )

    return includeTags
      ? C.concat_(
          partial,
          C.chain_(C.from(this.codeTag.values()), (_) => C.from(_.split("\n")))
        )
      : partial
  }

  chainCharacters(
    f: (line: string, index: number) => Chunk<string>,
    includeTags = true
  ): Chunk<string> {
    const updatedHeader = includeTags
      ? this.header
      : this.header.copy({ codeTagCount: "0" })

    const newChars = pipe(
      C.from(this.characters.values()),
      C.zipWithIndex,
      C.chain(({ tuple: [line, index] }) => f(line, index)),
      C.chain((_) => C.from(_.split("\n")))
    )

    const partial = pipe(
      C.from(this.comment.split("\n")),
      C.concat(newChars),
      C.prepend(updatedHeader.toLine())
    )

    return includeTags
      ? C.concat_(
          partial,
          C.chain_(C.from(this.codeTag.values()), (_) => C.from(_.split("\n")))
        )
      : partial
  }

  chainTagged(f: (line: string, index: number) => Chunk<string>): Chunk<string> {
    const newTagged = pipe(
      C.from(this.codeTag.values()),
      C.zipWithIndex,
      C.chain(({ tuple: [line, index] }) => f(line, index)),
      C.chain((_) => C.from(_.split("\n")))
    )

    return pipe(
      C.from(this.comment.split("\n")),
      C.concat(
        C.chain_(C.from(this.characters.values()), (_) => C.from(_.split("\n")))
      ),
      C.concat(newTagged),
      C.prepend(this.header.toLine())
    )
  }
}
