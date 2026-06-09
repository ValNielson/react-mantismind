import { describe, expect, test } from 'vitest'

/**
 * TDD spec for `app/constants.ts` (not yet written).
 *
 * Assumed API:
 *   export enum Colors { Red, Orange, Yellow, Green, Blue, Purple }  // values are color strings
 *   export enum Pip { Black, White }
 *   export const COLORS: Colors[]      // the 6 playable colors
 *   export const CODE_LENGTH: number   // 4
 *   export const MAX_GUESSES: number   // 10
 *
 * Rules referenced (SPEC.md):
 *   - there are 6 colors, not black or white
 *   - a code is a sequence of 4 colors
 *   - there are 10 guesses before game over
 */

import { Colors, Pip, COLORS, CODE_LENGTH, MAX_GUESSES } from 'app/constants.ts'

describe('constants', () => {
  test('a code is 4 colors long', () => {
    expect(CODE_LENGTH).toBe(4)
  })

  test('there are 10 guesses before game over', () => {
    expect(MAX_GUESSES).toBe(10)
  })

  test('there are exactly 6 playable colors', () => {
    expect(COLORS).toHaveLength(6)
  })

  test('the playable colors have no duplicates', () => {
    expect(new Set(COLORS).size).toBe(COLORS.length)
  })

  test('every playable color is a member of the Colors enum', () => {
    const allColors = Object.values(Colors)
    for (const color of COLORS) {
      expect(allColors).toContain(color)
    }
  })

  test('the colors are not black or white', () => {
    const values = Object.values(Colors).map((c) => String(c).toLowerCase())
    expect(values).not.toContain('black')
    expect(values).not.toContain('white')
  })

  test('pips are only black or white', () => {
    const pipValues = Object.values(Pip).map((p) => String(p).toLowerCase())
    expect(new Set(pipValues)).toEqual(new Set(['black', 'white']))
  })
})
