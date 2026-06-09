import { describe, expect, test } from 'vitest'

import { Colors, Pip } from 'app/constants.ts'
import { calculateFeedback } from 'app/gameLogic.ts'

/**
 * TDD spec for `calculateFeedback` in `app/gameLogic.ts` (not yet written).
 *
 * Assumed API:
 *   calculateFeedback(guess: Colors[], answer: Colors[]): Pip[]
 *
 * Rules (SPEC.md):
 *   - feedback is a sequence of black and white pips, sorted black first then white
 *   - black = correct color in the correct spot
 *   - white = correct color in the wrong spot
 *   - each peg in the answer can only be credited once (standard Mastermind scoring)
 */

const { Black, White } = Pip

describe('calculateFeedback', () => {
  const answer: Colors[] = [Colors.Red, Colors.Green, Colors.Blue, Colors.Yellow]

  test('an exact match scores 4 black pips', () => {
    expect(calculateFeedback([...answer], answer)).toEqual([Black, Black, Black, Black])
  })

  test('no matching colors scores no pips', () => {
    const guess = [Colors.Orange, Colors.Orange, Colors.Orange, Colors.Orange]
    expect(calculateFeedback(guess, answer)).toEqual([])
  })

  test('all correct colors in the wrong positions scores 4 white pips', () => {
    const guess = [Colors.Green, Colors.Red, Colors.Yellow, Colors.Blue]
    expect(calculateFeedback(guess, answer)).toEqual([White, White, White, White])
  })

  test('a mix of right-spot and wrong-spot colors', () => {
    // Red & Green are in the correct spot (2 black);
    // Yellow & Blue are present but swapped (2 white).
    const guess = [Colors.Red, Colors.Green, Colors.Yellow, Colors.Blue]
    expect(calculateFeedback(guess, answer)).toEqual([Black, Black, White, White])
  })

  test('pips are sorted black first, then white', () => {
    const guess = [Colors.Red, Colors.Green, Colors.Yellow, Colors.Blue]
    const feedback = calculateFeedback(guess, answer)
    const firstWhite = feedback.indexOf(White)
    const lastBlack = feedback.lastIndexOf(Black)
    // every black appears before every white
    if (firstWhite !== -1 && lastBlack !== -1) {
      expect(lastBlack).toBeLessThan(firstWhite)
    }
  })

  test('feedback never exceeds the code length', () => {
    const guess = [Colors.Green, Colors.Red, Colors.Yellow, Colors.Blue]
    expect(calculateFeedback(guess, answer).length).toBeLessThanOrEqual(answer.length)
  })

  describe('duplicate-color scoring', () => {
    test('a guessed color is not over-credited beyond its count in the answer', () => {
      // Answer has a single Red; guessing four Reds should yield exactly one black.
      const guess = [Colors.Red, Colors.Red, Colors.Red, Colors.Red]
      expect(calculateFeedback(guess, answer)).toEqual([Black])
    })

    test('duplicates in the answer are matched correctly', () => {
      const dupAnswer = [Colors.Red, Colors.Red, Colors.Blue, Colors.Green]
      // pos0 Red == Red -> 1 black
      // remaining answer: Red, Blue, Green ; remaining guess: Blue, Red, Red
      //   Red: min(answer 1, guess 2) = 1 white
      //   Blue: min(1, 1) = 1 white
      // -> 1 black, 2 white
      const guess = [Colors.Red, Colors.Blue, Colors.Red, Colors.Red]
      expect(calculateFeedback(guess, dupAnswer)).toEqual([Black, White, White])
    })

    test('extra duplicate guesses do not create phantom white pips', () => {
      const dupAnswer = [Colors.Red, Colors.Red, Colors.Blue, Colors.Green]
      // Three Reds guessed but answer only has two Reds.
      // pos0 & pos1 Red == Red -> 2 black; the 3rd Red has no remaining Red to match -> 0 white
      const guess = [Colors.Red, Colors.Red, Colors.Red, Colors.Orange]
      expect(calculateFeedback(guess, dupAnswer)).toEqual([Black, Black])
    })
  })

  test('feedback only reflects the submitted guess (is symmetric in count)', () => {
    // black + white count is independent of pip ordering
    const guess = [Colors.Yellow, Colors.Green, Colors.Red, Colors.Blue]
    const feedback = calculateFeedback(guess, answer)
    const blacks = feedback.filter((p) => p === Black).length
    const whites = feedback.filter((p) => p === White).length
    expect(blacks).toBe(1) // Green in spot
    expect(whites).toBe(3) // Yellow, Red, Blue present but misplaced
  })
})
