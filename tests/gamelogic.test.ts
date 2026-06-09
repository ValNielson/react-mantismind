import { describe, expect, test } from 'vitest'

import { Colors, COLORS, CODE_LENGTH } from 'app/constants.ts'
import {
  checkWinCondition,
  isValidGuess,
  generateSecretCode,
} from 'app/gameLogic.ts'

/**
 * TDD spec for the pure game logic in `app/gameLogic.ts` (not yet written).
 *
 * Assumed API:
 *   checkWinCondition(guess: Colors[], answer: Colors[]): boolean
 *   isValidGuess(guess: Colors[]): boolean        // exactly CODE_LENGTH valid colors
 *   generateSecretCode(): Colors[]                // 4 random colors, repeats allowed
 *
 * (calculateFeedback is specced separately in feedback.test.ts.)
 */

const answer: Colors[] = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]

describe('checkWinCondition', () => {
  // win conditions tests
  test('When a user submits a guess the game validates correctly if it is a winning guess', () => {
    const guess: Colors[] = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    expect(checkWinCondition(guess, answer)).toEqual(true)
  })

  test('a guess with the right colors in the wrong order is not a win', () => {
    const guess: Colors[] = [Colors.Orange, Colors.Green, Colors.Orange, Colors.Blue]
    expect(checkWinCondition(guess, answer)).toEqual(false)
  })

  test('a completely wrong guess is not a win', () => {
    const guess: Colors[] = [Colors.Red, Colors.Red, Colors.Red, Colors.Red]
    expect(checkWinCondition(guess, answer)).toEqual(false)
  })

  test('a guess that matches all but one position is not a win', () => {
    const guess: Colors[] = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Green]
    expect(checkWinCondition(guess, answer)).toEqual(false)
  })

  test('win detection respects duplicate colors in the answer', () => {
    const dupAnswer: Colors[] = [Colors.Red, Colors.Red, Colors.Blue, Colors.Blue]
    expect(checkWinCondition([...dupAnswer], dupAnswer)).toEqual(true)
    expect(
      checkWinCondition([Colors.Red, Colors.Blue, Colors.Red, Colors.Blue], dupAnswer),
    ).toEqual(false)
  })
})

describe('isValidGuess', () => {
  // a guess must be exactly 4 colors — can't guess more or fewer than 4
  test('a guess of exactly 4 colors is valid', () => {
    const guess: Colors[] = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    expect(isValidGuess(guess)).toBe(true)
  })

  test('a guess with fewer than 4 colors is invalid', () => {
    expect(isValidGuess([Colors.Green, Colors.Orange, Colors.Blue])).toBe(false)
  })

  test('a guess with more than 4 colors is invalid', () => {
    expect(
      isValidGuess([Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange, Colors.Red]),
    ).toBe(false)
  })

  test('an empty guess is invalid', () => {
    expect(isValidGuess([])).toBe(false)
  })

  test('a guess with repeated colors is still valid', () => {
    expect(isValidGuess([Colors.Red, Colors.Red, Colors.Red, Colors.Red])).toBe(true)
  })
})

describe('generateSecretCode', () => {
  test('generates a code of the correct length', () => {
    expect(generateSecretCode()).toHaveLength(CODE_LENGTH)
  })

  test('only uses playable colors', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateSecretCode()
      for (const color of code) {
        expect(COLORS).toContain(color)
      }
    }
  })

  test('is randomized (does not return the same code every time)', () => {
    const codes = new Set(
      Array.from({ length: 50 }, () => generateSecretCode().join('|')),
    )
    expect(codes.size).toBeGreaterThan(1)
  })

  test('can use the full range of colors across many generations', () => {
    const seen = new Set<Colors>()
    for (let i = 0; i < 200; i++) {
      for (const color of generateSecretCode()) seen.add(color)
    }
    expect(seen.size).toBe(COLORS.length)
  })

  test('allows a color to repeat within a code', () => {
    // Over many codes, at least one should contain a repeated color
    // (probability of no repeat across 200 codes is effectively zero).
    const hasRepeat = Array.from({ length: 200 }, () => generateSecretCode()).some(
      (code) => new Set(code).size < code.length,
    )
    expect(hasRepeat).toBe(true)
  })
})
