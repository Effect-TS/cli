// ets_tracing: off

const SHORT_OPTION_REGEX = /^-{1}([^-]|$)/
const LONG_OPTION_REGEX = /^-{2}([^-]|$)/

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

/**
 * A `CliConfig` describes how arguments from the command-line should be parsed.
 */
export interface CliConfig {
  /**
   * Whether or not the CLI should be case-sensitive.
   */
  readonly caseSensitive: boolean
  /**
   * Threshold for when to show auto correct suggestions.
   */
  readonly autoCorrectLimit: number
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export function make(caseSensitive: boolean, autoCorrectLimit: number): CliConfig {
  return {
    caseSensitive,
    autoCorrectLimit
  }
}

/**
 * The default CLI configuration, which enforces case-sensitive option parsing.
 */
export const defaultConfig: CliConfig = make(true, 2)

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

export function normalizeCase_(self: CliConfig, text: string) {
  return self.caseSensitive ? text : text.toLowerCase()
}

/**
 * @ets_data_first normalizeCase_
 */
export function normalizeCase(text: string) {
  return (self: CliConfig) => normalizeCase_(self, text)
}

export function isShortOption(text: string): boolean {
  return SHORT_OPTION_REGEX.test(text.trim())
}

export function isLongOption(text: string): boolean {
  return LONG_OPTION_REGEX.test(text.trim())
}

export function isOption(text: string): boolean {
  return isShortOption(text) || isLongOption(text)
}
