import { expect, test } from 'vitest'

import { Colors } from  "app/constants.ts"
import { checkWinCondition } from "app/gameLogic.ts"

const answer: Colors[] = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]

// win conditions tests
test('When a user submits a guess the game validates correctly if it is a winning guess', () => {
  const guess: Colors[] = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
  expect(checkWinCondition(guess, answer)).toEqual(true)
})

// add test for making sure that guess is 4 colors can't guess more or less than 4