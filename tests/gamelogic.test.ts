import { describe, expect, test } from 'vitest'

import {
  CODE_LENGTH,
  MASTERMIND_COLORS,
  MAX_GUESSES,
  assertValidCode,
  calculateFeedback,
  createSecretCode,
  isValidCode,
  isValidColor,
} from '@/lib/gameLogic'

const [red, orange, yellow, green, blue, purple] = MASTERMIND_COLORS

describe('Mastermind constants and colors', () => {
  test('uses a 4-color code and allows 10 guesses', () => {
    expect(CODE_LENGTH).toBe(4)
    expect(MAX_GUESSES).toBe(10)
  })

  test('offers exactly 6 playable colors and never uses black or white as colors', () => {
    expect(MASTERMIND_COLORS).toHaveLength(6)
    expect(new Set(MASTERMIND_COLORS).size).toBe(6)
    expect(MASTERMIND_COLORS).not.toContain('black')
    expect(MASTERMIND_COLORS).not.toContain('white')
  })

  test('recognizes only configured colors as valid playable colors', () => {
    for (const color of MASTERMIND_COLORS) {
      expect(isValidColor(color)).toBe(true)
    }

    expect(isValidColor('black')).toBe(false)
    expect(isValidColor('white')).toBe(false)
    expect(isValidColor('not-a-game-color')).toBe(false)
  })
})

describe('Secret code generation', () => {
  test('generates a 4-color code from playable colors', () => {
    const code = createSecretCode({ random: () => 0 })

    expect(code).toHaveLength(CODE_LENGTH)
    expect(isValidCode(code)).toBe(true)
  })

  test('allows repeated colors in generated codes', () => {
    const code = createSecretCode({ random: () => 0 })

    expect(code).toEqual([red, red, red, red])
  })

  test('maps random values across the whole color palette deterministically', () => {
    const randomValues = [0, 0.2, 0.5, 0.99]
    const code = createSecretCode({ random: () => randomValues.shift() ?? 0 })

    expect(code).toEqual([red, orange, green, purple])
  })
})

describe('Code validation', () => {
  test('accepts full 4-color codes with repeated colors', () => {
    expect(isValidCode([red, red, blue, blue])).toBe(true)
  })

  test('rejects guesses that are shorter or longer than 4 colors', () => {
    expect(isValidCode([red, orange, yellow])).toBe(false)
    expect(isValidCode([red, orange, yellow, green, blue])).toBe(false)
  })

  test('rejects invalid colors, including black and white feedback pip colors', () => {
    expect(isValidCode([red, orange, 'black', green])).toBe(false)
    expect(isValidCode([red, orange, 'white', green])).toBe(false)
  })

  test('throws a useful error when an invalid code is submitted', () => {
    expect(() => assertValidCode([red, orange, 'black', green])).toThrow(/invalid color/i)
    expect(() => assertValidCode([red, orange, yellow])).toThrow(/4 colors/i)
  })
})

describe('Feedback generation', () => {
  test('returns four black pips for an exact winning guess', () => {
    expect(calculateFeedback([red, orange, yellow, green], [red, orange, yellow, green])).toEqual([
      'black',
      'black',
      'black',
      'black',
    ])
  })

  test('returns no pips when a guess has no matching colors', () => {
    expect(calculateFeedback([red, orange, yellow, green], [blue, blue, purple, purple])).toEqual([])
  })

  test('returns white pips for correct colors in incorrect spots', () => {
    expect(calculateFeedback([red, orange, yellow, green], [green, yellow, orange, red])).toEqual([
      'white',
      'white',
      'white',
      'white',
    ])
  })

  test('sorts feedback with all black pips before white pips', () => {
    expect(calculateFeedback([red, orange, yellow, green], [red, green, orange, purple])).toEqual([
      'black',
      'white',
      'white',
    ])
  })

  test('does not double-count duplicate colors in the secret code', () => {
    expect(calculateFeedback([red, red, blue, blue], [red, orange, red, purple])).toEqual([
      'black',
      'white',
    ])
  })

  test('does not double-count duplicate colors in the guess', () => {
    expect(calculateFeedback([red, orange, yellow, green], [red, red, red, red])).toEqual(['black'])
  })

  test('scores black matches before considering white matches for repeats', () => {
    expect(calculateFeedback([red, red, orange, blue], [red, orange, red, red])).toEqual([
      'black',
      'white',
      'white',
    ])
  })

  test('rejects invalid secret codes or guesses instead of producing feedback', () => {
    expect(() => calculateFeedback([red, orange, yellow], [red, orange, yellow, green])).toThrow(/4 colors/i)
    expect(() => calculateFeedback([red, orange, yellow, green], [red, orange, yellow, 'black'])).toThrow(
      /invalid color/i,
    )
  })
})
