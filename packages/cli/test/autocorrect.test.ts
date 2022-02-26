import * as AutoCorrect from "../src/AutoCorrect/index.js"
import * as Config from "../src/CliConfig/index.js"

describe("AutoCorrect", () => {
  it("should calculate the correct Levenstein distance between two strings", () => {
    expect(AutoCorrect.levensteinDistance("", "")).toBe(0)
    expect(AutoCorrect.levensteinDistance("--force", "")).toBe(7)
    expect(AutoCorrect.levensteinDistance("", "--force")).toBe(7)
    expect(AutoCorrect.levensteinDistance("--force", "force")).toBe(2)
    expect(AutoCorrect.levensteinDistance("--force", "--forc")).toBe(1)
    expect(AutoCorrect.levensteinDistance("--force", "--Force")).toBe(1)
    expect(AutoCorrect.levensteinDistance("foo", "bar")).toBe(3)
  })

  it("should calculate the correct Levenstein distance for non-ASCII characters", () => {
    expect(AutoCorrect.levensteinDistance("とんかつ", "とかつ")).toBe(1)
    expect(AutoCorrect.levensteinDistance("¯\\_(ツ)_/¯", "_(ツ)_/¯")).toBe(2)
  })

  it("should take into account the case sensitivity provided by the configuration", () => {
    const config = Config.make({ caseSensitive: false })
    expect(AutoCorrect.levensteinDistance("--force", "--force", config)).toBe(0)
    expect(AutoCorrect.levensteinDistance("--force", "--Force", config)).toBe(0)
    expect(AutoCorrect.levensteinDistance("--force", "--Force", config)).toBe(0)
  })
})
