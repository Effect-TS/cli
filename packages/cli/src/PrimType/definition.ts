// ets_tracing: off

import { PrimType } from "./_internal/Base"
import { Bool } from "./_internal/Bool"
import { Date } from "./_internal/Date"
import { Enumeration } from "./_internal/Enumeration"
import { Float } from "./_internal/Float"
import { Integer } from "./_internal/Integer"
import { Path } from "./_internal/Path"
import { Text } from "./_internal/Text"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type Instruction = Bool | Date | Enumeration<any> | Float | Integer | Path | Text

export { Bool, Date, Enumeration, Float, Integer, Path, PrimType, Text }
