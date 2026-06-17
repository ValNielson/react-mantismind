import { Colors, VALID_GUESS_COLORS } from './constants'
import type { Guess, Feedback, GameState } from './types'

const MAX_GUESSES = 10
const CODE_LENGTH = 4

const gameState: GameState = {
  gameHistory: [],
  currentGuess: [],
  guessCount: 0,
  inProgress: false,
  answer: [],
}

export function useGameState(): GameState {
  return gameState
}

export function resetGameState(): void {
  gameState.gameHistory = []
  gameState.currentGuess = []
  gameState.guessCount = 0
  gameState.inProgress = false
  gameState.answer = []
}

export function checkWinCondition(guess: Guess, answer: Guess): boolean {
  if (guess.length !== answer.length) return false
  return guess.every((color, i) => color === answer[i])
}

export function usedAllGuesses(): boolean {
  return gameState.gameHistory.length >= MAX_GUESSES
}

export function isValidGuess(guess: unknown[]): boolean {
  if (guess.length !== CODE_LENGTH) return false
  return guess.every(
    (color) =>
      color !== null &&
      color !== undefined &&
      typeof color === 'number' &&
      VALID_GUESS_COLORS.includes(color as Colors)
  )
}

export function updateGuessHistory(indexOrGuess: number | Guess, guess?: Guess): void {
  if (gameState.inProgress) {
    throw new Error('Cannot update guess history while in progress')
  }
  if (typeof indexOrGuess === 'number') {
    return
  }
  gameState.gameHistory.push(indexOrGuess)
  gameState.guessCount++
}

export function selectColor(currentGuess: Guess, color: Colors): void {
  if (currentGuess.length < CODE_LENGTH) {
    currentGuess.push(color)
  }
}

export function deleteSelection(currentGuess: Guess): void {
  if (currentGuess.length > 0) {
    currentGuess.pop()
  }
}

export function getFeedback(guess: Guess, answer: Guess): Feedback {
  const answerRemaining: (Colors | null)[] = [...answer]
  const guessRemaining: (Colors | null)[] = [...guess]

  let black = 0
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      black++
      answerRemaining[i] = null
      guessRemaining[i] = null
    }
  }

  let white = 0
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessRemaining[i] === null) continue
    const idx = answerRemaining.indexOf(guessRemaining[i])
    if (idx !== -1) {
      white++
      answerRemaining[idx] = null
    }
  }

  return { black, white }
}

export function generateAnswer(): Guess {
  const answer: Guess = []
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * VALID_GUESS_COLORS.length)
    answer.push(VALID_GUESS_COLORS[randomIndex])
  }
  return answer
}

export function startGame(): Guess {
  resetGameState()
  gameState.answer = generateAnswer()
  return gameState.answer
}

export function submitGuess(guess: Guess): void {
  gameState.inProgress = true
}
