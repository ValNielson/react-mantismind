import { Colors, Pip, CODE_LENGTH, MAX_GUESSES } from './constants'
import { generateCode, getFeedback, checkWinCondition } from './gameLogic'

export interface GameState {
  secretCode: Colors[]
  guesses: Array<{ guess: Colors[]; feedback: Pip[] }>
  currentGuess: Colors[]
  status: 'playing' | 'won' | 'lost'
}

export function createInitialState(secretCode?: Colors[]): GameState {
  return {
    secretCode: secretCode ?? generateCode(),
    guesses: [],
    currentGuess: [],
    status: 'playing',
  }
}

export function addColor(state: GameState, color: Colors): GameState {
  if (state.status !== 'playing' || state.currentGuess.length >= CODE_LENGTH) {
    return state
  }
  return { ...state, currentGuess: [...state.currentGuess, color] }
}

export function undoColor(state: GameState): GameState {
  return { ...state, currentGuess: state.currentGuess.slice(0, -1) }
}

export function submitGuess(state: GameState): GameState {
  if (state.status !== 'playing' || state.currentGuess.length < CODE_LENGTH) {
    return state
  }
  const feedback = getFeedback(state.currentGuess, state.secretCode)
  const newGuesses = [...state.guesses, { guess: state.currentGuess, feedback }]
  const won = checkWinCondition(state.currentGuess, state.secretCode)
  const lost = !won && newGuesses.length >= MAX_GUESSES
  return {
    ...state,
    guesses: newGuesses,
    currentGuess: [],
    status: won ? 'won' : lost ? 'lost' : 'playing',
  }
}

export function startNewGame(_state: GameState): GameState {
  return createInitialState()
}
