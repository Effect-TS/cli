import * as Effect from "@effect/io/Effect"

/** @internal */
export interface Ansi {
  /**
   * Play a beeping sound.
   */
  readonly beep: string
  /**
   * Clear from cursor to beginning of the screen.
   */
  readonly clearUp: string
  /**
   * Clear from cursor to end of screen.
   */
  readonly clearDown: string
  /**
   * Clear from cursor to the start of the line. Cursor position does not change.
   */
  readonly clearLeft: string
  /**
   * Clear from cursor to the end of the line. Cursor position does not change.
   */
  readonly clearRight: string
  /**
   * Clear entire screen. And moves cursor to upper left on DOS.
   */
  readonly clearScreen: string
  /**
   * Clear the current line. Cursor position does not change.
   */
  readonly clearLine: string
  /**
   * Clear the specified number of lines.
   */
  clearLines(lines: number): string
  /**
   * Saves the position of the cursor.
   */
  readonly cursorSave: string
  /**
   * Saves the position of the cursor.
   */
  readonly cursorRestore: string
  /**
   * Sets the cursor position to the absolute coordinates `x` and `y`.
   */
  setCursorPosition(x: number, y?: number): string
  /**
   * Move the cursor position by the relative coordinates `x` and `y`.
   */
  moveCursor(x: number, y: number): string
  /**
   * Move the cursor up by the specified number of `lines`.
   */
  moveCursorUp(lines: number): string
  /**
   * Move the cursor down by the specified number of `lines`.
   */
  moveCursorDown(lines: number): string
  /**
   * Move the cursor left by the specified number of `columns`.
   */
  moveCursorLeft(columns: number): string
  /**
   * Move the cursor right by the specified number of `columns`.
   */
  moveCursorRight(columns: number): string
}

const BEEP = "\x07"
const ESC = "\x1B"
const CSI = `${ESC}[`

const movements = {
  moveTo: "H",
  forceTo: "f",
  moveUp: "A",
  moveDown: "B",
  forward: "C",
  backward: "D",
  nextLine: "E",
  prevLine: "F",
  moveToColumn: "G",
  scrollUp: "S",
  scrollDown: "T"
}

export const actions = {
  hide: "?25l",
  show: "?25h",
  clearUp: "1J",
  clearDown: "J",
  clearLeft: "1K",
  clearRight: "K",
  clearLine: "2K",
  clearScreen: "2J"
}

const moveCursorUp = (lines: number) => `${CSI}${lines}${movements.moveUp}`
const moveCursorDown = (lines: number) => `${CSI}${lines}${movements.moveDown}`
const moveCursorLeft = (columns: number) => `${CSI}${columns}${movements.backward}`
const moveCursorRight = (columns: number) => `${CSI}${columns}${movements.forward}`

const setCursorPosition = (x: number, y?: number) => {
  if (y === undefined) {
    return `${CSI}${x + 1}${movements.moveToColumn}`
  }
  return `${CSI}${y + 1};${x + 1}${movements.moveTo}`
}

const moveCursor = (x: number, y: number) => {
  let move = ""
  if (x > 0) {
    move = move + moveCursorRight(x)
  } else if (x < 0) {
    move = move + moveCursorLeft(-x)
  }
  if (y > 0) {
    move = move + moveCursorDown(y)
  } else if (y < 0) {
    move = move + moveCursorUp(-y)
  }
  return move
}

const clearLines = (lines: number) => {
  let clear = ""
  for (let i = 0; i < lines; i++) {
    clear += ansi.clearLine + (i < lines - 1 ? ansi.moveCursorUp(1) : "")
  }
  if (lines) {
    clear += ansi.moveCursorLeft(1)
  }
  return clear
}

export const ansi: Ansi = {
  beep: BEEP,
  clearUp: `${CSI}${actions.clearUp}`,
  clearDown: `${CSI}${actions.clearDown}`,
  clearLeft: `${CSI}${actions.clearLeft}`,
  clearRight: `${CSI}${actions.clearRight}`,
  clearScreen: `${CSI}${actions.clearScreen}`,
  clearLine: `${CSI}${actions.clearLine}`,
  clearLines,
  cursorSave: `${ESC}7`,
  cursorRestore: `${ESC}8`,
  moveCursor,
  moveCursorUp,
  moveCursorDown,
  moveCursorLeft,
  moveCursorRight,
  setCursorPosition
}

const main = {
  arrowUp: "↑",
  arrowDown: "↓",
  arrowLeft: "←",
  arrowRight: "→",
  radioOn: "◉",
  radioOff: "◯",
  tick: "✔",
  cross: "✖",
  ellipsis: "…",
  pointerSmall: "›",
  line: "─",
  pointer: "❯"
}

const win = {
  arrowUp: main.arrowUp,
  arrowDown: main.arrowDown,
  arrowLeft: main.arrowLeft,
  arrowRight: main.arrowRight,
  radioOn: "(*)",
  radioOff: "( )",
  tick: "√",
  cross: "×",
  ellipsis: "...",
  pointerSmall: "»",
  line: "─",
  pointer: ">"
}

export const figures = Effect.map(
  Effect.sync(() => process.platform === "win32"),
  (isWindows) => isWindows ? win : main
)

const strip = (str: string) => {
  const pattern = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))"
  ].join("|")
  const RGX = new RegExp(pattern, "g")
  return typeof str === "string" ? str.replace(RGX, "") : str
}

const width = (str: string) => [...strip(str)].length

/** @internal */
export const lines = (msg: string, perLine: number) => {
  const lines = String(strip(msg) || "").split(/\r?\n/)

  if (!perLine) return lines.length
  return lines.map((l) => Math.ceil(l.length / perLine))
    .reduce((a, b) => a + b)
}

/** @internal */
export const clearPromptLines = (prompt: string, perLine?: number) => {
  if (!perLine) return ansi.clearLine + ansi.setCursorPosition(0)
  let rows = 0
  const lines = prompt.split(/\r?\n/)
  for (const line of lines) {
    rows += 1 + Math.floor(Math.max(width(line) - 1, 0) / perLine)
  }

  return ansi.clearLines(rows)
}
