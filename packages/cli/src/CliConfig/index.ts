// ets_tracing: off

import type { InternalFont } from "@effect-ts/figlet/Internal"

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
   * Threshold for when to show auto correct suggestions.
   */
  readonly autoCorrectLimit: number
  /**
   * Whether or not the CLI should be case-sensitive.
   */
  readonly caseSensitive: boolean
  /**
   * The Figlet font that will be used to render the banner for the CLI program.
   */
  readonly bannerFont: InternalFont
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export function make(
  params: Partial<{
    readonly autoCorrectLimit: number
    readonly caseSensitive: boolean
    readonly bannerFont: InternalFont
  }> = {}
): CliConfig {
  const defaultCliConfig = {
    autoCorrectLimit: 2,
    caseSensitive: true,
    bannerFont: "slant"
  }
  return Object.assign({}, defaultCliConfig, params)
}

/**
 * The default CLI configuration, which enforces case-sensitive option parsing.
 */
export const defaultConfig: CliConfig = make()

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
