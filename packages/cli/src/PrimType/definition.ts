// ets_tracing: off

import {
  Bool,
  Date,
  Enumeration,
  Float,
  Integer,
  Path,
  PrimType,
  Text
} from "./_internal"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type Instruction = Bool | Date | Enumeration<any> | Float | Integer | Path | Text

export { Bool, Date, Enumeration, Float, Integer, Path, PrimType, Text }
