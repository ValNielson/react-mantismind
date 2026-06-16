import { expect, test } from 'vitest'

import { Colors, ALL_COLORS, CODE_LENGTH, Pip } from  "app/constants.ts"
import { checkWinCondition, isValidGuess, generateCode, getFeedback } from "app/gameLogic.ts"

const answer: Colors[] = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]

// win conditions tests
test('When a user submits a guess the game validates correctly if it is a winning guess', () => {
  const guess: Colors[] = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
  expect(checkWinCondition(guess, answer)).toEqual(true)
})

test('A losing guess is not a winning guess', () => {
  const guess: Colors[] = [Colors.Red, Colors.Orange, Colors.Blue, Colors.Orange]
  expect(checkWinCondition(guess, answer)).toEqual(false)
})

// guess validation tests — a guess must be exactly 4 colors, no more, no less
test('A guess of exactly 4 colors is valid', () => {
  const guess: Colors[] = [Colors.Red, Colors.Red, Colors.Red, Colors.Red]
  expect(isValidGuess(guess)).toEqual(true)
})

test('A guess of fewer than 4 colors is invalid', () => {
  const guess: Colors[] = [Colors.Red, Colors.Blue, Colors.Green]
  expect(isValidGuess(guess)).toEqual(false)
})

test('A guess of more than 4 colors is invalid', () => {
  const guess: Colors[] = [Colors.Red, Colors.Blue, Colors.Green, Colors.Orange, Colors.Yellow]
  expect(isValidGuess(guess)).toEqual(false)
})

// code generation tests
test('generateCode produces a code of exactly 4 colors', () => {
  expect(generateCode()).toHaveLength(CODE_LENGTH)
})

test('generateCode only uses the six valid game colors', () => {
  // Run many times since generation is random.
  for (let i = 0; i < 100; i++) {
    for (const color of generateCode()) {
      expect(ALL_COLORS).toContain(color)
    }
  }
})

test('generateCode can produce repeated colors over many draws', () => {
  // The spec allows colors to repeat in a code. Across many generations we
  // should eventually see at least one code with a duplicate.
  const sawDuplicate = Array.from({ length: 200 }, () => generateCode()).some(
    (code) => new Set(code).size < code.length,
  )
  expect(sawDuplicate).toBe(true)
})

// feedback (pip) tests
test('a fully correct guess scores four black pips', () => {
  const guess: Colors[] = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
  expect(getFeedback(guess, answer)).toEqual([Pip.Black, Pip.Black, Pip.Black, Pip.Black])
})

test('a guess with no matching colors scores no pips', () => {
  const guess: Colors[] = [Colors.Red, Colors.Red, Colors.Red, Colors.Red]
  expect(getFeedback(guess, answer)).toEqual([])
})

test('one correct color in the correct spot scores a single black pip', () => {
  const guess: Colors[] = [Colors.Green, Colors.Red, Colors.Red, Colors.Red]
  expect(getFeedback(guess, answer)).toEqual([Pip.Black])
})

test('correct colors in wrong spots score white pips', () => {
  // pos0 Orange/Green, pos1 Green/Orange, pos2 Red/Blue, pos3 Red/Orange
  // Green and one Orange match by color but not position => two white pips.
  const guess: Colors[] = [Colors.Orange, Colors.Green, Colors.Red, Colors.Red]
  expect(getFeedback(guess, answer)).toEqual([Pip.White, Pip.White])
})

test('pips are sorted black first, then white', () => {
  // Green is an exact match (black); Blue and one Orange match by color only.
  const guess: Colors[] = [Colors.Green, Colors.Blue, Colors.Orange, Colors.Red]
  expect(getFeedback(guess, answer)).toEqual([Pip.Black, Pip.White, Pip.White])
})

test('a duplicated guess color is only credited up to its count in the answer', () => {
  // The answer contains Green exactly once. Guessing Green twice should not
  // earn two pips for it.
  const guess: Colors[] = [Colors.Green, Colors.Green, Colors.Red, Colors.Red]
  expect(getFeedback(guess, answer)).toEqual([Pip.Black])
})