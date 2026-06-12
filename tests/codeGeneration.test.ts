import { afterEach, describe, expect, test, vi } from 'vitest'

import { Colors, CODE_LENGTH } from "app/constants.ts"
import { generateCode } from "app/gameLogic.ts"

afterEach(() => {
  vi.restoreAllMocks()
})

describe('generateCode', () => {
  test('generates a code of exactly 4 colors', () => {
    const code = generateCode()
    expect(code).toHaveLength(CODE_LENGTH)
  })

  test('only uses valid colors', () => {
    const validColors = Object.values(Colors)
    const code = generateCode()
    for (const color of code) {
      expect(validColors).toContain(color)
    }
  })

  test('allows the same color to repeat within a code', () => {
    // Pin the RNG so every pick lands on the same color
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const code = generateCode()
    expect(code).toHaveLength(CODE_LENGTH)
    expect(new Set(code).size).toBe(1)
  })

  test('produces randomized codes', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 50; i++) {
      codes.add(generateCode().join(','))
    }
    // 50 draws from 1296 possible codes virtually never collide every time
    expect(codes.size).toBeGreaterThan(1)
  })
})
