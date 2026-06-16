import { Colors, ALL_COLORS, CODE_LENGTH, Pip } from 'app/constants.ts'

// Scores a guess against the answer using the standard Mastermind algorithm:
// first count exact matches (black pips), then count remaining color-only
// matches (white pips) from the leftover, unmatched colors. A color can only
// be credited as many times as it appears in the answer. Pips are returned
// sorted black-first, then white.
export function getFeedback(guess: Colors[], answer: Colors[]): Pip[] {
  let black = 0
  // Tally the answer's unmatched colors so each can be credited at most once.
  const remaining = new Map<Colors, number>()

  guess.forEach((color, i) => {
    if (color === answer[i]) {
      black++
    } else {
      remaining.set(answer[i], (remaining.get(answer[i]) ?? 0) + 1)
    }
  })

  let white = 0
  guess.forEach((color, i) => {
    if (color === answer[i]) return
    const left = remaining.get(color) ?? 0
    if (left > 0) {
      white++
      remaining.set(color, left - 1)
    }
  })

  return [
    ...Array<Pip>(black).fill(Pip.Black),
    ...Array<Pip>(white).fill(Pip.White),
  ]
}

// Generates a random secret code of CODE_LENGTH colors. Colors may repeat.
export function generateCode(): Colors[] {
  return Array.from(
    { length: CODE_LENGTH },
    () => ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)],
  )
}

// A guess is valid only when it is exactly CODE_LENGTH (4) colors long.
export function isValidGuess(guess: Colors[]): boolean {
  return guess.length === CODE_LENGTH
}

// Returns true when the guess exactly matches the answer (same colors in the
// same order).
export function checkWinCondition(guess: Colors[], answer: Colors[]): boolean {
  if (guess.length !== answer.length) return false
  return guess.every((color, i) => color === answer[i])
}
