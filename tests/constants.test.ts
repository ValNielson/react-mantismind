import { describe, expect, test } from 'vitest'

import { Colors, Pip, CODE_LENGTH, MAX_GUESSES } from "app/constants.ts"

describe('game constants', () => {
  test('there are exactly 6 guessable colors', () => {
    expect(Object.values(Colors)).toHaveLength(6)
  })

  test('black and white are not guessable colors', () => {
    const names = Object.values(Colors).map((c) => String(c).toLowerCase())
    expect(names).not.toContain('black')
    expect(names).not.toContain('white')
  })

  test('a code is a sequence of 4 colors', () => {
    expect(CODE_LENGTH).toBe(4)
  })

  test('the player gets 10 guesses before game over', () => {
    expect(MAX_GUESSES).toBe(10)
  })

  test('feedback pips come in black and white', () => {
    expect(Pip.Black).toBeDefined()
    expect(Pip.White).toBeDefined()
    expect(Pip.Black).not.toEqual(Pip.White)
  })
})
