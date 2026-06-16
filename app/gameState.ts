import { Colors, Pip, CODE_LENGTH, MAX_GUESSES, type GameStatus } from './constants'
import type { Guess, SubmittedGuess } from './types'
import { checkWinCondition, generateCode, getFeedback } from './gameLogic'

// Immutable snapshot of a single game. Every transition below returns a new
// state object and never mutates its input.
export interface GameState {
  secretCode: Guess
  guesses: SubmittedGuess[]
  currentGuess: Guess
  status: GameStatus
}

export type { GameStatus }

// Create a fresh game. A secret code may be supplied (handy for tests);
// otherwise one is generated.
export function createInitialState(secretCode: Guess = generateCode()): GameState {
  return {
    secretCode,
    guesses: [],
    currentGuess: [],
    status: 'playing',
  }
}

// Add a color to the current guess. No-op once the guess is full or the game
// is over.
export function addColor(state: GameState, color: Colors): GameState {
  if (state.status !== 'playing') return state
  if (state.currentGuess.length >= CODE_LENGTH) return state
  return { ...state, currentGuess: [...state.currentGuess, color] }
}

// Remove the most recently added color from the current guess.
export function undoColor(state: GameState): GameState {
  if (state.currentGuess.length === 0) return state
  return { ...state, currentGuess: state.currentGuess.slice(0, -1) }
}

// Submit the current guess: score it, append it to history, clear the working
// guess, and update the win/lose status. Rejects incomplete guesses and does
// nothing once the game is over.
export function submitGuess(state: GameState): GameState {
  if (state.status !== 'playing') return state
  if (state.currentGuess.length !== CODE_LENGTH) return state

  const feedback = getFeedback(state.currentGuess, state.secretCode)
  const guesses: SubmittedGuess[] = [
    ...state.guesses,
    { guess: state.currentGuess, feedback },
  ]

  let status: GameStatus = 'playing'
  if (checkWinCondition(state.currentGuess, state.secretCode)) {
    status = 'won'
  } else if (guesses.length >= MAX_GUESSES) {
    status = 'lost'
  }

  return { ...state, guesses, currentGuess: [], status }
}

// "Play again": discard the finished game and start a fresh one with a new
// secret code.
export function startNewGame(_state: GameState): GameState {
  return createInitialState()
}

// Re-exported so consumers can read feedback values without a second import.
export { Pip }
