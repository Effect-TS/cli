---
title: HelpDoc.ts
nav_order: 10
parent: Modules
---

## HelpDoc overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [orElse](#orelse)
  - [sequence](#sequence)
- [constructors](#constructors)
  - [blocks](#blocks)
  - [descriptionList](#descriptionlist)
  - [empty](#empty)
  - [enumeration](#enumeration)
  - [h1](#h1)
  - [h2](#h2)
  - [h3](#h3)
  - [p](#p)
- [getters](#getters)
  - [getSpan](#getspan)
- [mapping](#mapping)
  - [mapDescriptionList](#mapdescriptionlist)
- [models](#models)
  - [DescriptionList (interface)](#descriptionlist-interface)
  - [Empty (interface)](#empty-interface)
  - [Enumeration (interface)](#enumeration-interface)
  - [Header (interface)](#header-interface)
  - [HelpDoc (type alias)](#helpdoc-type-alias)
  - [Paragraph (interface)](#paragraph-interface)
  - [Sequence (interface)](#sequence-interface)
- [refinements](#refinements)
  - [isDescriptionList](#isdescriptionlist)
  - [isEmpty](#isempty)
  - [isEnumeration](#isenumeration)
  - [isHeader](#isheader)
  - [isParagraph](#isparagraph)
  - [isSequence](#issequence)
- [rendering](#rendering)
  - [toAnsiDoc](#toansidoc)
  - [toAnsiText](#toansitext)

---

# combinators

## orElse

**Signature**

```ts
export declare const orElse: { (that: HelpDoc): (self: HelpDoc) => HelpDoc; (self: HelpDoc, that: HelpDoc): HelpDoc }
```

Added in v1.0.0

## sequence

**Signature**

```ts
export declare const sequence: { (that: HelpDoc): (self: HelpDoc) => HelpDoc; (self: HelpDoc, that: HelpDoc): HelpDoc }
```

Added in v1.0.0

# constructors

## blocks

**Signature**

```ts
export declare const blocks: (helpDocs: Iterable<HelpDoc>) => HelpDoc
```

Added in v1.0.0

## descriptionList

**Signature**

```ts
export declare const descriptionList: (definitions: readonly [[Span, HelpDoc], ...[Span, HelpDoc][]]) => HelpDoc
```

Added in v1.0.0

## empty

**Signature**

```ts
export declare const empty: HelpDoc
```

Added in v1.0.0

## enumeration

**Signature**

```ts
export declare const enumeration: (elements: readonly [HelpDoc, ...HelpDoc[]]) => HelpDoc
```

Added in v1.0.0

## h1

**Signature**

```ts
export declare const h1: (value: string | Span) => HelpDoc
```

Added in v1.0.0

## h2

**Signature**

```ts
export declare const h2: (value: string | Span) => HelpDoc
```

Added in v1.0.0

## h3

**Signature**

```ts
export declare const h3: (value: string | Span) => HelpDoc
```

Added in v1.0.0

## p

**Signature**

```ts
export declare const p: (value: string | Span) => HelpDoc
```

Added in v1.0.0

# getters

## getSpan

**Signature**

```ts
export declare const getSpan: (self: HelpDoc) => Span
```

Added in v1.0.0

# mapping

## mapDescriptionList

**Signature**

```ts
export declare const mapDescriptionList: {
  (f: (span: Span, helpDoc: HelpDoc) => readonly [Span, HelpDoc]): (self: HelpDoc) => HelpDoc
  (self: HelpDoc, f: (span: Span, helpDoc: HelpDoc) => readonly [Span, HelpDoc]): HelpDoc
}
```

Added in v1.0.0

# models

## DescriptionList (interface)

**Signature**

```ts
export interface DescriptionList {
  readonly _tag: 'DescriptionList'
  readonly definitions: NonEmptyReadonlyArray<readonly [Span, HelpDoc]>
}
```

Added in v1.0.0

## Empty (interface)

**Signature**

```ts
export interface Empty {
  readonly _tag: 'Empty'
}
```

Added in v1.0.0

## Enumeration (interface)

**Signature**

```ts
export interface Enumeration {
  readonly _tag: 'Enumeration'
  readonly elements: NonEmptyReadonlyArray<HelpDoc>
}
```

Added in v1.0.0

## Header (interface)

**Signature**

```ts
export interface Header {
  readonly _tag: 'Header'
  readonly value: Span
  readonly level: number
}
```

Added in v1.0.0

## HelpDoc (type alias)

A `HelpDoc` models the full documentation for a command-line application.

`HelpDoc` is composed of optional header and footers, and in-between, a
list of HelpDoc-level content items.

HelpDoc-level content items, in turn, can be headers, paragraphs, description
lists, and enumerations.

A `HelpDoc` can be converted into plaintext, JSON, and HTML.

**Signature**

```ts
export type HelpDoc = Empty | Header | Paragraph | DescriptionList | Enumeration | Sequence
```

Added in v1.0.0

## Paragraph (interface)

**Signature**

```ts
export interface Paragraph {
  readonly _tag: 'Paragraph'
  readonly value: Span
}
```

Added in v1.0.0

## Sequence (interface)

**Signature**

```ts
export interface Sequence {
  readonly _tag: 'Sequence'
  readonly left: HelpDoc
  readonly right: HelpDoc
}
```

Added in v1.0.0

# refinements

## isDescriptionList

**Signature**

```ts
export declare const isDescriptionList: (helpDoc: HelpDoc) => helpDoc is DescriptionList
```

Added in v1.0.0

## isEmpty

**Signature**

```ts
export declare const isEmpty: (helpDoc: HelpDoc) => helpDoc is Empty
```

Added in v1.0.0

## isEnumeration

**Signature**

```ts
export declare const isEnumeration: (helpDoc: HelpDoc) => helpDoc is Enumeration
```

Added in v1.0.0

## isHeader

**Signature**

```ts
export declare const isHeader: (helpDoc: HelpDoc) => helpDoc is Header
```

Added in v1.0.0

## isParagraph

**Signature**

```ts
export declare const isParagraph: (helpDoc: HelpDoc) => helpDoc is Paragraph
```

Added in v1.0.0

## isSequence

**Signature**

```ts
export declare const isSequence: (helpDoc: HelpDoc) => helpDoc is Sequence
```

Added in v1.0.0

# rendering

## toAnsiDoc

**Signature**

```ts
export declare const toAnsiDoc: (self: HelpDoc) => AnsiDoc
```

Added in v1.0.0

## toAnsiText

**Signature**

```ts
export declare const toAnsiText: (self: HelpDoc) => string
```

Added in v1.0.0
