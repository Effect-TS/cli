import * as Tuple from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import { pipe } from "@effect-ts/core/Function"
import * as TE from "@effect-ts/jest/Test"

import * as Help from "../src/Help/index.js"

describe("HelpDoc", () => {
  const { it } = TE.runtime()

  describe("Constructors", () => {
    it("should produce a Header from a string with level 1", () =>
      T.succeedWith(() => {
        expect(Help.h1("foo")).toEqual(new Help.Header(new Help.Text("foo"), 1))
      }))

    it("should produce a Header from a string with level 2", () =>
      T.succeedWith(() => {
        expect(Help.h2("foo")).toEqual(new Help.Header(new Help.Text("foo"), 2))
      }))

    it("should produce a Header from a string with level 3", () =>
      T.succeedWith(() => {
        expect(Help.h3("foo")).toEqual(new Help.Header(new Help.Text("foo"), 3))
      }))

    it("should produce a Paragraph from a string", () =>
      T.succeedWith(() => {
        expect(Help.p("foo")).toEqual(new Help.Paragraph(new Help.Text("foo"), 0))
      }))

    it("should produce a Sequence from two HelpDocs", () =>
      T.succeedWith(() => {
        expect(Help.sequence_(Help.p("foo"), Help.p("bar"))).toEqual(
          new Help.Sequence(
            new Help.Paragraph(new Help.Text("foo"), 0),
            new Help.Paragraph(new Help.Text("bar"), 0)
          )
        )
      }))
  })

  describe("Operations", () => {
    it("isEmpty", () =>
      T.succeedWith(() => {
        expect(Help.isEmpty(Help.empty)).toBeTruthy()
        expect(Help.isEmpty(Help.h1("foo"))).toBeFalsy()
      }))
  })

  describe("Plain Text Rendering", () => {
    it("should render an empty HelpDoc", () =>
      T.succeedWith(() => {
        const help = pipe(Help.empty, Help.render(Help.plainMode()))

        expect(help).toBe("")
      }))

    it("should render a text HelpDoc", () =>
      T.succeedWith(() => {
        const help = pipe(Help.text("test"), Help.render(Help.plainMode()))

        expect(help).toBe("test")
      }))

    it("should render a code HelpDoc", () =>
      T.succeedWith(() => {
        const help = pipe(Help.code("test"), Help.render(Help.plainMode()))

        expect(help).toBe("\u001b[0;97mtest\u001b[0m")
      }))

    it("should render an error HelpDoc", () =>
      T.succeedWith(() => {
        const help = pipe(Help.error("test"), Help.render(Help.plainMode()))

        expect(help).toBe("\u001b[0;91mtest\u001b[0m")
      }))

    it("should render a strong HelpDoc", () =>
      T.succeedWith(() => {
        const help = pipe(Help.strong("test"), Help.render(Help.plainMode()))

        expect(help).toBe("\u001b[0;1mtest\u001b[0m")
      }))

    it("should render a link HelpDoc", () =>
      T.succeedWith(() => {
        const help = pipe(Help.link("test"), Help.render(Help.plainMode()))

        expect(help).toBe("\u001b[0;4mtest\u001b[0m")
      }))

    it("should render a header HelpDoc", () =>
      T.succeedWith(() => {
        const help = pipe(Help.h1("test"), Help.render(Help.plainMode()))

        expect(help).toBe("\u001b[0;1mtest\u001b[0m\n")
      }))

    it("should render a paragraph HelpDoc", () =>
      T.succeedWith(() => {
        const help = pipe(Help.p("test", 2), Help.render(Help.plainMode()))

        expect(help).toBe("  test\n")
      }))

    it("should render a description list HelpDoc", () =>
      T.succeedWith(() => {
        const help = pipe(
          Help.descriptionList([
            Tuple.tuple(Help.text("test"), Help.p("test description"))
          ]),
          Help.render(Help.plainMode())
        )
        const expected = `    \u001b[0;1mtest\u001b[0m
        test description

`

        expect(help).toBe(expected)
      }))

    it("should render an enumeration HelpDoc", () =>
      T.succeedWith(() => {
        const help = pipe(
          Help.enumeration([Help.text("one"), Help.text("two"), Help.text("three")]),
          Help.render(Help.plainMode())
        )
        const expected = `  - one
  - two
  - three`

        expect(help).toBe(expected)
      }))
  })
})
