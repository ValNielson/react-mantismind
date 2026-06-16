import { Colors, Pip, CODE_LENGTH, MAX_GUESSES } from './constants'
import type { Guess } from './types'

export { useGameState } from './useGameState'

export function generateCode(): Colors[] {
  const colorValues = Object.values(Colors)
  return Array.from({ length: CODE_LENGTH }, () =>
    colorValues[Math.floor(Math.random() * colorValues.length)]
  )
}

export function checkWinCondition(guess: Colors[], answer: Colors[]): boolean {
  return guess.length === answer.length && guess.every((c, i) => c === answer[i])
}

export function isValidGuess(guess: Colors[]): guess is Guess {
  return guess.length === CODE_LENGTH
}

export function updateGuessHistory(history: Colors[][], guess: Colors[]): Colors[][] {
  return [...history, guess]
}

export function deleteSelection(guess: Colors[]): Colors[] {
  return guess.slice(0, -1)
}

export function selectColor(guess: Colors[], color: Colors): Colors[] {
  if (guess.length >= CODE_LENGTH) return guess
  return [...guess, color]
}

export function getFeedback(guess: Colors[], answer: Colors[]): Pip[] {
  const blacks: Pip[] = []
  const guessCounts: Partial<Record<Colors, number>> = {}
  const answerCounts: Partial<Record<Colors, number>> = {}

  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) {
      blacks.push(Pip.Black)
    } else {
      guessCounts[guess[i]] = (guessCounts[guess[i]] ?? 0) + 1
      answerCounts[answer[i]] = (answerCounts[answer[i]] ?? 0) + 1
    }
  }

  const whites: Pip[] = []
  for (const color of Object.values(Colors)) {
    const count = Math.min(guessCounts[color] ?? 0, answerCounts[color] ?? 0)
    for (let i = 0; i < count; i++) {
      whites.push(Pip.White)
    }
  }

  return [...blacks, ...whites]
}

// Module-level guess counter for the no-arg usedAllGuesses() API
let _guessCount = 0

export function usedAllGuesses(): boolean {
  return _guessCount >= MAX_GUESSES
}

export function startGame(): void {
  _guessCount = 0
}

export function submitGuess(guess: Colors[], answer: Colors[]): Pip[] {
  _guessCount++
  return getFeedback(guess, answer)
}
