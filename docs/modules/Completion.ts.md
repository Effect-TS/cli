---
title: Completion.ts
nav_order: 9
parent: Modules
---

## Completion overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [completions](#completions)
  - [getCompletionScript](#getcompletionscript)
  - [getCompletions](#getcompletions)

---

# completions

## getCompletionScript

**Signature**

```ts
export declare const getCompletionScript: (
  pathToExecutable: string,
  programNames: readonly [string, ...string[]],
  shellType: ShellType,
  path: Path
) => string
```

Added in v1.0.0

## getCompletions

**Signature**

```ts
export declare const getCompletions: <A>(
  words: ReadonlyArray<string>,
  index: number,
  command: Command<A>,
  config: CliConfig,
  compgen: Compgen
) => Effect<FileSystem, never, ReadonlyArray<string>>
```

Added in v1.0.0
