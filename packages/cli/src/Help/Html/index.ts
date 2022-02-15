// ets_tracing: off

import type { Doc } from "@effect-ts/printer/Core/Doc"

export type HtmlDoc = Doc<Html>

export type Html = Bold | Code | Error | Link | Header | Paragraph | ListItem | List

export class Bold {
  readonly _tag = "Bold"
}

export class Code {
  readonly _tag = "Code"
}

export class Error {
  readonly _tag = "Error"
}

export class Link {
  readonly _tag = "Link"
}

export class Paragraph {
  readonly _tag = "Paragraph"
}

export class Header {
  readonly _tag = "Header"
  constructor(readonly level: number) {}
}

export class ListItem {
  readonly _tag = "ListItem"
}

export class List {
  readonly _tag = "List"
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const bold: Html = new Bold()

export const code: Html = new Code()

export const error: Html = new Error()

export const link: Html = new Link()

export const paragraph: Html = new Paragraph()

export function header(level: number): Html {
  return new Header(level)
}

export const listItem: Html = new ListItem()

export const list: Html = new List()

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

export function getDefaultCss(): string {
  return `<style>
  h1 {
      color: rgb(36, 41, 46);
      font-weight: 600;
      line-height: 1.25;
      margin-bottom: 16px;
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
  }
  h2 {
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
      font-size: 24px;
      letter-spacing: 0px;
      word-spacing: 2px;
      color: rgb(36, 41, 46);
      font-weight: 600;
  }
  h3 {
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
      font-size: 21px;
      letter-spacing: 0px;
      word-spacing: 2px;
      color: rgb(36, 41, 46);
      font-weight: 700;
  }
  p {
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
      color: #24292e;
  }
  .error {
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
      color: #24292e;
  }
  a {
      border: 0;
      color: rgb(189, 39, 26);
      text-decoration: none;
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
      font-size: inherit;
      font-size: 100%;
      margin: 0;
      padding: 0;
      vertical-align: baseline;
  }
  a:hover {
      color: rgb(0, 0, 0);
  }
  pre {
    background-color: rgba(27, 31, 35, .05);
  }
  code {
      border-radius: 3px;
      color: rgb(36, 41, 46);
      font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
      font-size: 85%;
      margin: 0;
  }
</style>`
}
