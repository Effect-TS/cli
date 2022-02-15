// ets_tracing: off

import type { CliConfig } from "../CliConfig/index.js"
import * as Config from "../CliConfig/index.js"

export function levensteinDistance(
  first: string,
  second: string,
  config: CliConfig = Config.defaultConfig
): number {
  if (first.length === 0) return second.length
  if (second.length === 0) return first.length

  const rowCount = first.length
  const columnCount = second.length

  const matrix = new Array<Array<number>>(rowCount)
  const normalFirst = Config.normalizeCase_(config, first)
  const normalSecond = Config.normalizeCase_(config, second)

  // Increment each row in the first column
  for (let x = 0; x <= rowCount; x++) {
    matrix[x] = new Array<number>(columnCount)
    matrix[x][0] = x
  }

  // Increment each column in the first row
  for (let y = 0; y <= columnCount; y++) {
    matrix[0][y] = y
  }

  // Fill in the rest of the matrix
  for (let row = 1; row <= rowCount; row++) {
    for (let col = 1; col <= columnCount; col++) {
      const cost = normalFirst.charAt(row - 1) === normalSecond.charAt(col - 1) ? 0 : 1

      matrix[row][col] = Math.min(
        matrix[row][col - 1] + 1,
        Math.min(matrix[row - 1][col] + 1, matrix[row - 1][col - 1] + cost)
      )
    }
  }

  return matrix[rowCount][columnCount]
}
