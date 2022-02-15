// ets_tracing: off

import { Base } from "./Base.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export class Text extends Base<string> {
  readonly _tag = "Text"

  constructor() {
    super()
  }
}
