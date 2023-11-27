import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"

/**
 * An error that occurs when attempting to create a Naval Fate ship that already
 * exists.
 */
export class ShipExistsError extends Data.TaggedError("ShipExistsError")<{
  readonly name: string
}> {}

/**
 * An error that occurs when attempting to move a Naval Fate ship that does not
 * exist.
 */
export class ShipNotFoundError extends Data.TaggedError("ShipNotFoundError")<{
  readonly name: string
  readonly x: number
  readonly y: number
}> {}

/**
 * An error that occurs when attempting to move a Naval Fate ship to coordinates
 * already occupied by another ship.
 */
export class CoordinatesOccupiedError extends Data.TaggedError("CoordinatesOccupiedError")<{
  readonly name: string
  readonly x: number
  readonly y: number
}> {}

/**
 * Represents a Naval Fate ship.
 */
export class Ship extends Schema.Class<Ship>()({
  name: Schema.string,
  x: Schema.NumberFromString,
  y: Schema.NumberFromString,
  status: Schema.literal("sailing", "destroyed")
}) {
  static readonly create = (name: string) => new Ship({ name, x: 0, y: 0, status: "sailing" })

  hasCoordinates(x: number, y: number): boolean {
    return this.x === x && this.y === y
  }

  move(x: number, y: number): Ship {
    return new Ship({ name: this.name, x, y, status: this.status })
  }

  destroy(): Ship {
    return new Ship({ name: this.name, x: this.x, y: this.y, status: "destroyed" })
  }
}

/**
 * Represents a Naval Fate mine.
 */
export class Mine extends Schema.Class<Mine>()({
  x: Schema.NumberFromString,
  y: Schema.NumberFromString
}) {
  static readonly create = (x: number, y: number) => new Mine({ x, y })

  hasCoordinates(x: number, y: number): boolean {
    return this.x === x && this.y === y
  }
}
