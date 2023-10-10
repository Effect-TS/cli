import * as Options from '../../src/Options'
import * as Data from "effect/Data"

export type Animal = Dog | Cat

export interface Dog extends Data.Case {
  readonly _tag: "Dog"
}

export const Dog = Data.tagged<Dog>("Dog")

export interface Cat extends Data.Case {
  readonly _tag: "Cat"
}

export const Cat = Data.tagged<Cat>("Cat")

export const animal: Options.Options<Animal> = Options.choiceWithValue("animal", [
  ["dog", Dog()],
  ["cat", Cat()],
])
