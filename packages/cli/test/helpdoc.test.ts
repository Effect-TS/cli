import * as Help from "../src/Help"

describe("HelpDoc", () => {
  describe("constructors", () => {
    it("should produce a Header from a string with level 1", () => {
      expect(Help.h1("foo")).toEqual(new Help.Header(new Help.Text("foo"), 1))
    })

    it("should produce a Header from a string with level 2", () => {
      expect(Help.h2("foo")).toEqual(new Help.Header(new Help.Text("foo"), 2))
    })

    it("should produce a Header from a string with level 3", () => {
      expect(Help.h3("foo")).toEqual(new Help.Header(new Help.Text("foo"), 3))
    })

    it("should produce a Paragraph from a string", () => {
      expect(Help.p("foo")).toEqual(new Help.Paragraph(new Help.Text("foo"), 0))
    })

    it("should produce a Sequence from two HelpDocs", () => {
      expect(Help.sequence_(Help.p("foo"), Help.p("bar"))).toEqual(
        new Help.Sequence(
          new Help.Paragraph(new Help.Text("foo"), 0),
          new Help.Paragraph(new Help.Text("bar"), 0)
        )
      )
    })
  })

  describe("operations", () => {
    it("isEmpty", () => {
      expect(Help.isEmpty(Help.empty)).toBeTruthy()
      expect(Help.isEmpty(Help.h1("foo"))).toBeFalsy()
    })
  })
})
