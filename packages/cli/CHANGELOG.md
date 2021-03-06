# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.8.0](https://github.com/Effect-TS/cli/compare/@effect-ts/cli@0.7.3...@effect-ts/cli@0.8.0) (2022-02-26)

**Note:** Version bump only for package @effect-ts/cli





## [0.7.3](https://github.com/Effect-TS/cli/compare/@effect-ts/cli@0.7.2...@effect-ts/cli@0.7.3) (2022-02-15)

**Note:** Version bump only for package @effect-ts/cli





## [0.7.2](https://github.com/Effect-TS/cli/compare/@effect-ts/cli@0.7.1...@effect-ts/cli@0.7.2) (2022-02-05)


### Bug Fixes

* **cli:** properly validate paths with Exists ([d6170aa](https://github.com/Effect-TS/cli/commit/d6170aadf4dc09e4888f48b420be7d2dedefee23))





## [0.7.1](https://github.com/Effect-TS/cli/compare/@effect-ts/cli@0.7.0...@effect-ts/cli@0.7.1) (2022-01-31)


### Features

* **cli:** add support for hiding the FigFont banner ([3d3190e](https://github.com/Effect-TS/cli/commit/3d3190eec8bf313d3ec6e949c224e0f6d93ca8a5))





# [0.7.0](https://github.com/Effect-TS/cli/compare/@effect-ts/cli@0.6.0...@effect-ts/cli@0.7.0) (2022-01-30)

**Note:** Version bump only for package @effect-ts/cli





# [0.6.0](https://github.com/Effect-TS/cli/compare/@effect-ts/cli@0.5.0...@effect-ts/cli@0.6.0) (2021-12-16)


### Features

* **cli:** enable completion script generation for bash and zshell ([0f06b4a](https://github.com/Effect-TS/cli/commit/0f06b4aa53bffba4d6d08ce779ab961e40c12b79))
* **completions:** add support for custom command and option completions ([d188114](https://github.com/Effect-TS/cli/commit/d188114c5b0c3f99abaaaaaf6e1d90d7c8977cdd))





# [0.5.0](https://github.com/Effect-TS/cli/compare/@effect-ts/cli@0.4.1...@effect-ts/cli@0.5.0) (2021-12-14)


### Features

* **cli:** remove figlet module in favor of @effect-ts/figlet ([8c6d3c7](https://github.com/Effect-TS/cli/commit/8c6d3c771637542d0996ca87009827700cdf42ee))





## [0.4.1](https://github.com/Effect-TS/cli/compare/@effect-ts/cli@0.4.0...@effect-ts/cli@0.4.1) (2021-12-09)

**Note:** Version bump only for package @effect-ts/cli





## [0.4.1](https://github.com/Effect-TS/cli/compare/@effect-ts/cli@0.4.0...@effect-ts/cli@0.4.1) (2021-12-09)

**Note:** Version bump only for package @effect-ts/cli





# [0.4.0](https://github.com/Effect-TS/cli/compare/@effect-ts/cli@0.3.1...@effect-ts/cli@0.4.0) (2021-11-30)


### Features

* **cli:** convert Console to new type-safe service pattern ([ba6dc7d](https://github.com/Effect-TS/cli/commit/ba6dc7de8ff9920fb44b0e73b34c4d906ee42bcb))
* **cli:** convert FigletClient to new type-safe service pattern ([cf55b64](https://github.com/Effect-TS/cli/commit/cf55b645ec560e30b08e7e32182ff98c734834ae))
* **cli:** convert FontFileReader to new type-safe service pattern ([ec77b53](https://github.com/Effect-TS/cli/commit/ec77b533f1448c56958254575d37608e7f308ae0))
* **cli:** upgrade repo to yarn 3 and latest effect ([87f9433](https://github.com/Effect-TS/cli/commit/87f94334d02fccaef53651269d314e88e68fb03b))





## [0.3.1](https://github.com/Effect-TS/cli/compare/@effect-ts/cli@0.3.0...@effect-ts/cli@0.3.1) (2021-11-17)


### Features

* **cli:** improve the quality of autogenerated help docs ([dddf712](https://github.com/Effect-TS/cli/commit/dddf7120c8bbc0b7ae5c694667013c98925a56c1))





# [0.3.0](https://github.com/Effect-TS/cli/compare/@effect-ts/cli@0.2.0...@effect-ts/cli@0.3.0) (2021-11-09)


### Bug Fixes

* **examples:** fix the word count in the wc example ([aa2e315](https://github.com/Effect-TS/cli/commit/aa2e315ffcfcb8afe3d4af40931240ddd6aec55f))


### Features

* **cli:** add rough implementation to support display of help for subcommands ([6c9b757](https://github.com/Effect-TS/cli/commit/6c9b75782e9c34b1603742f1381b6cff7e7495b7))
* **cli:** add support for boolean option grouping ([6a78219](https://github.com/Effect-TS/cli/commit/6a7821990b49296ad74481f33a2f231bebbe662a))
* **cli:** add support for generating bash shell completions ([b77dc94](https://github.com/Effect-TS/cli/commit/b77dc94929ead617f2fa11667d3737d3dff5e613))
* **cli:** add support for option mappings ([906a919](https://github.com/Effect-TS/cli/commit/906a91900e30e7eb033fbde988b88acad4321f55))
* **cli:** flatten undefined values in commands and subcommands ([3d75d8a](https://github.com/Effect-TS/cli/commit/3d75d8a0a500e66f8623bf0acdcfedd7bf6a74ce))
* **cli:** refactor the ValidationError model ([53f2d1d](https://github.com/Effect-TS/cli/commit/53f2d1d1c9bad6e08bf522abc8dd9ffba8dad182))
* **cli:** remove need for explicitly specifying options and args for a command ([7b0168e](https://github.com/Effect-TS/cli/commit/7b0168ea35bced9f0c6cba2bc8f050a60a5f794d))





# 0.2.0 (2021-10-08)


### Bug Fixes

* **cli:** add all figlet modules to package.json and fix font file copying during build ([bd6063e](https://github.com/Effect-TS/cli/commit/bd6063e67721e3b4b3476e1cd06746f9573dc338))
* **cli:** repair broken build scripts ([386947b](https://github.com/Effect-TS/cli/commit/386947bb1934a03175b61be920caec3b51595594))


### Features

* **cli:** add port of figlet4s to render command name ([becc9ee](https://github.com/Effect-TS/cli/commit/becc9ee9c3ed2c622425d32678988ba3cea55912))
* **cli:** fix failing tests and finish client tests ([58926ed](https://github.com/Effect-TS/cli/commit/58926edcc7bb082926c38cf1b467ae998885bfe4))
* **cli:** initial release ([81b52f2](https://github.com/Effect-TS/cli/commit/81b52f2529c6b9bdddec0e0e8bd811aa41da0151))
* **cli:** make Args more tree shakeable ([5d782b6](https://github.com/Effect-TS/cli/commit/5d782b644b2643e6b5b8e9f782b051103c75780b))
* **cli:** make Command more tree-shakeable ([cf28fb8](https://github.com/Effect-TS/cli/commit/cf28fb862cd2b1804d763c7b6140382bced22a28))
* **cli:** make Options more tree-shakeable ([e3c501d](https://github.com/Effect-TS/cli/commit/e3c501d520f37d22dbde69c370abdc2c71908eb7))
* **cli:** make PrimType more tree-shakeable ([7f0dc8d](https://github.com/Effect-TS/cli/commit/7f0dc8da961966269ef049e970e7ac6b18afc7c4))
