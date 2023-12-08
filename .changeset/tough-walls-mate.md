---
"@effect/cli": patch
---

Make help documentation print built-in options by default

The printing of built-in options in the help documentation can be disabled by providing a custom
`CliConfig` to your CLI application with `showBuiltIns` set to `false`.
