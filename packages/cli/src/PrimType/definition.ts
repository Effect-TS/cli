// ets_tracing: off

import { PrimType } from "./_internal/Base.js"
import { Bool } from "./_internal/Bool.js"
import { Date } from "./_internal/Date.js"
import { Enumeration } from "./_internal/Enumeration.js"
import { Float } from "./_internal/Float.js"
import { Integer } from "./_internal/Integer.js"
import { Path } from "./_internal/Path.js"
import { Text } from "./_internal/Text.js"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type Instruction = Bool | Date | Enumeration<any> | Float | Integer | Path | Text

export { Bool, Date, Enumeration, Float, Integer, Path, PrimType, Text }
