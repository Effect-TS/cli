// ets_tracing: off

import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as Identity from "@effect-ts/core/Identity"
import * as IO from "@effect-ts/core/IO"
import * as String from "@effect-ts/core/String"
import * as Doc from "@effect-ts/printer/Core/Doc"
import * as DocTree from "@effect-ts/printer/Core/DocTree"
import type { LayoutOptions } from "@effect-ts/printer/Core/Layout"
import * as Layout from "@effect-ts/printer/Core/Layout"
import * as PageWidth from "@effect-ts/printer/Core/PageWidth"
import * as TermColor from "@effect-ts/printer/Terminal/Color"
import type { AnsiDoc } from "@effect-ts/printer/Terminal/Render"
import * as TermRender from "@effect-ts/printer/Terminal/Render"
import * as TermStyle from "@effect-ts/printer/Terminal/Style"

import type { HelpDoc } from "../Doc"
import type { HtmlDoc } from "../Html"
import * as Html from "../Html"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type RenderMode = PlainMode | HtmlMode

export class PlainMode {
  readonly _tag = "PlainMode"
  constructor(
    readonly lineWidth: number,
    readonly ribbonFraction: number,
    readonly ansi: boolean
  ) {}
}

export class HtmlMode {
  readonly _tag = "HtmlMode"
  constructor(readonly lineWidth: number, readonly ribbonFraction: number) {}
}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export function plainMode(
  lineWidth = 100,
  ribbonFraction = 1,
  ansi = true
): RenderMode {
  return new PlainMode(lineWidth, ribbonFraction, ansi)
}

export function htmlMode(lineWidth = 100, ribbonFraction = 1): RenderMode {
  return new HtmlMode(lineWidth, ribbonFraction)
}

// -----------------------------------------------------------------------------
// Plain Text
// -----------------------------------------------------------------------------

function helpDocToDocPlain(self: HelpDoc): IO.IO<AnsiDoc> {
  return IO.gen(function* (_) {
    switch (self._tag) {
      case "Empty":
        return Doc.empty
      case "Text":
        return Doc.text(self.value)
      case "Code":
        return Doc.annotate_(Doc.text(self.value), TermStyle.color(TermColor.white))
      case "Error":
        return Doc.annotate_(Doc.text(self.value), TermStyle.color(TermColor.red))
      case "Strong":
        return Doc.annotate_(Doc.text(self.value), TermStyle.bold)
      case "Link":
        return Doc.annotate_(Doc.text(self.value), TermStyle.underlined)
      case "Header": {
        const span = yield* _(helpDocToDocPlain(self.value))
        return Doc.cat_(Doc.annotate_(span, TermStyle.bold), Doc.hardLine)
      }
      case "Paragraph": {
        const span = yield* _(helpDocToDocPlain(self.value))
        return Doc.cat_(Doc.indent_(span, self.indentation), Doc.hardLine)
      }
      case "DescriptionList": {
        const definitions = A.map_(self.definitions, ({ tuple: [span, doc] }) => {
          const name = Doc.annotate_(IO.run(helpDocToDocPlain(span)), TermStyle.bold)
          const desc = Doc.indent_(IO.run(helpDocToDocPlain(doc)), 4)
          return Doc.cat_(Doc.indent_(Doc.appendWithLine_(name, desc), 4), Doc.hardLine)
        })
        return Doc.vcat(definitions)
      }
      case "Enumeration": {
        const elements = A.map_(self.elements, (b) => {
          const doc = IO.run(helpDocToDocPlain(b))
          const element = Doc.cat_(Doc.text("- "), doc)
          return Doc.indent_(element, 2)
        })
        return Doc.vcat(elements)
      }
      case "Concat": {
        const left = yield* _(helpDocToDocPlain(self.left))
        const right = yield* _(helpDocToDocPlain(self.right))
        if (left._tag === "Empty") return right
        if (right._tag === "Empty") return left
        return Doc.cat_(left, right)
      }
      case "Sequence": {
        const left = yield* _(helpDocToDocPlain(self.left))
        const right = yield* _(helpDocToDocPlain(self.right))
        if (left._tag === "Empty") return right
        if (right._tag === "Empty") return left
        return Doc.appendWithLine_(left, right)
      }
    }
  })
}

function helpDocToPlaintext(
  helpDoc: HelpDoc,
  options: LayoutOptions,
  ansi: boolean
): string {
  let doc = IO.run(helpDocToDocPlain(helpDoc))
  if (!ansi) {
    doc = Doc.unAnnotate(doc)
  }
  return TermRender.render(Layout.smart_(options, doc))
}

// -----------------------------------------------------------------------------
// Html
// -----------------------------------------------------------------------------

function helpDocToDocHtml(self: HelpDoc): IO.IO<HtmlDoc> {
  return IO.gen(function* (_) {
    switch (self._tag) {
      case "Empty":
        return Doc.empty
      case "Text":
        return Doc.annotate_(Doc.text(self.value), Html.paragraph)
      case "Code":
        return Doc.annotate_(Doc.text(self.value), Html.code)
      case "Error":
        return Doc.annotate_(Doc.text(self.value), Html.error)
      case "Strong":
        return Doc.annotate_(Doc.text(self.value), Html.bold)
      case "Link":
        return Doc.annotate_(Doc.text(self.value), Html.link)
      case "Header": {
        const doc = yield* _(helpDocToDocHtml(self.value))
        return Doc.annotate_(doc, Html.header(self.level))
      }
      case "Paragraph":
        return yield* _(helpDocToDocHtml(self.value))
      case "DescriptionList": {
        const definitions = A.map_(self.definitions, ({ tuple: [span, doc] }) => {
          const name = IO.run(helpDocToDocHtml(span))
          const desc = IO.run(helpDocToDocHtml(doc))
          return Doc.appendWithLine_(name, desc)
        })
        return Doc.vsep(definitions)
      }
      case "Enumeration": {
        const elements = A.map_(self.elements, (element) => {
          const li = IO.run(helpDocToDocHtml(element))
          return Doc.annotate_(li, Html.listItem)
        })
        return Doc.annotate_(Doc.indent_(Doc.vsep(elements), 4), Html.list)
      }
      case "Concat": {
        const left = yield* _(helpDocToDocHtml(self.left))
        const right = yield* _(helpDocToDocHtml(self.right))
        return Doc.cat_(left, right)
      }
      case "Sequence": {
        const left = yield* _(helpDocToDocHtml(self.left))
        const right = yield* _(helpDocToDocHtml(self.right))
        return Doc.appendWithLine_(left, right)
      }
    }
  })
}

function encloseInTagFor(x: string, html: Html.Html): string {
  switch (html._tag) {
    case "Bold":
      return `<strong>${x}</strong>`
    case "Code":
      return `<pre><code>${x}</code></pre>`
    case "Error":
      return `<span class="error">${x}</span>`
    case "Paragraph":
      return `<p>${x}</p>`
    case "Header":
      return `<h${html.level}>${x}</h${html.level}>`
    case "Link":
      return `<a href="${x}">${x}</a>`
    case "ListItem":
      return `<li>${x}</li>`
    case "List":
      return `<ul>${x}</ul>`
  }
}

function renderTreeRec(tree: DocTree.DocTree<Html.Html>): IO.IO<string> {
  return IO.gen(function* (_) {
    switch (tree._tag) {
      case "EmptyTree":
        return ""
      case "CharTree":
        return tree.char
      case "TextTree":
        return tree.text
      case "LineTree":
        return "\n" + DocTree.textSpaces(tree.indentation)
      case "AnnotationTree": {
        const x = yield* _(renderTreeRec(tree.tree))
        return encloseInTagFor(x, tree.annotation)
      }
      case "ConcatTree":
        return A.foldMap_(Identity.string)(tree.trees, (t) => IO.run(renderTreeRec(t)))
    }
  })
}

function helpDocToHtml(helpDoc: HelpDoc, options: LayoutOptions): string {
  const doc = IO.run(helpDocToDocHtml(helpDoc))
  const stream = Layout.smart_(options, doc)
  const tree = DocTree.treeForm(stream)
  const css = Html.getDefaultCss()
  const body = IO.run(renderTreeRec(tree))
  return `<!DOCTYPE html><html><head>${css}</head><body>${body}</body></html>`
}

// -----------------------------------------------------------------------------
// Render
// -----------------------------------------------------------------------------

export function render_(self: HelpDoc, mode: RenderMode): string {
  switch (mode._tag) {
    case "HtmlMode":
      return helpDocToHtml(
        self,
        Layout.layoutOptions(
          PageWidth.availablePerLine(mode.lineWidth, mode.ribbonFraction)
        )
      )
    case "PlainMode":
      return helpDocToPlaintext(
        self,
        Layout.layoutOptions(
          PageWidth.availablePerLine(mode.lineWidth, mode.ribbonFraction)
        ),
        mode.ansi
      )
  }
}

/**
 * @ets_data_first render_
 */
export function render(mode: RenderMode) {
  return (self: HelpDoc): string => render_(self, mode)
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

export function escapeHtml(s: string): string {
  return String.replace_(String.replace_(s, "<", "&lt;"), ">", "&gt;")
}
