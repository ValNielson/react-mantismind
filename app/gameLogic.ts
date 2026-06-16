import { useCallback, useState } from 'react'

import { Colors, Pip, CODE_LENGTH, MAX_GUESSES } from './constants'
import type { Feedback, Guess } from './types'

// ---------------------------------------------------------------------------
// Pure game rules
// ---------------------------------------------------------------------------

// Generate a random secret code of CODE_LENGTH colors. Colors may repeat.
export function generateCode(): Guess {
  const colors = Object.values(Colors)
  const code: Guess = []
  for (let i = 0; i < CODE_LENGTH; i++) {
    code.push(colors[Math.floor(Math.random() * colors.length)])
  }
  return code
}

// Score a guess against the answer, returning black/white pips sorted with all
// black pips first. Each answer peg can be consumed by at most one pip, and a
// peg used for a black pip is never reused for a white pip.
export function getFeedback(guess: Guess, answer: Guess): Feedback {
  const pips: Feedback = []

  // Colors left over after removing exact (black) matches, tracked on both
  // sides so repeated colors are matched at most once.
  const answerLeftovers: Colors[] = []
  const guessLeftovers: Colors[] = []

  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) {
      pips.push(Pip.Black)
    } else {
      answerLeftovers.push(answer[i])
      guessLeftovers.push(guess[i])
    }
  }

  for (const color of guessLeftovers) {
    const idx = answerLeftovers.indexOf(color)
    if (idx !== -1) {
      pips.push(Pip.White)
      answerLeftovers.splice(idx, 1) // consume the matched peg
    }
  }

  return pips
}

// A guess wins when it matches the answer color-for-color, in order.
export function checkWinCondition(guess: Guess, answer: Guess): boolean {
  return (
    guess.length === answer.length &&
    guess.every((color, i) => color === answer[i])
  )
}

// A guess is only submittable once it holds a full sequence of colors.
export function isValidGuess(guess: Guess): boolean {
  return guess.length === CODE_LENGTH
}

// Append a color to an in-progress guess, ignoring extra picks once full.
export function selectColor(guess: Guess, color: Colors): Guess {
  if (guess.length >= CODE_LENGTH) return guess
  return [...guess, color]
}

// Undo the most recently picked color (sequence-order undo).
export function deleteSelection(guess: Guess): Guess {
  return guess.slice(0, -1)
}

// Record a completed guess in the history.
export function updateGuessHistory(history: Guess[], guess: Guess): Guess[] {
  return [...history, guess]
}

// ---------------------------------------------------------------------------
// Module-level session state used by the procedural helpers below.
// ---------------------------------------------------------------------------

let guessHistory: Guess[] = []
let secretCode: Guess = generateCode()

// Begin a new game: fresh code and empty history.
export function startGame(): Guess {
  guessHistory = []
  secretCode = generateCode()
  return secretCode
}

// Submit a guess against the active secret code, recording it and returning the
// feedback. Ignores submissions once all guesses are used.
export function submitGuess(guess: Guess): Feedback {
  if (usedAllGuesses()) return []
  guessHistory = updateGuessHistory(guessHistory, guess)
  return getFeedback(guess, secretCode)
}

// True once the player has used all MAX_GUESSES attempts.
export function usedAllGuesses(): boolean {
  return guessHistory.length >= MAX_GUESSES
}

// ---------------------------------------------------------------------------
// React hook powering the UI
// ---------------------------------------------------------------------------
//
// Imported lazily from `./gameState` to keep the pure rules above free of any
// React/state dependency. The cycle is safe because these bindings are only
// touched inside hook callbacks, never at module-evaluation time.
import {
  addColor,
  createInitialState,
  startNewGame,
  submitGuess as submitGuessState,
  undoColor,
  type GameState,
} from './gameState'

export interface UseGameState {
  state: GameState
  pickColor: (color: Colors) => void
  undo: () => void
  submit: () => void
  playAgain: () => void
}

// Stateful wrapper around the immutable gameState transitions, for use inside
// client components.
export function useGameState(): UseGameState {
  const [state, setState] = useState<GameState>(() => createInitialState())

  const pickColor = useCallback(
    (color: Colors) => setState((s) => addColor(s, color)),
    [],
  )
  const undo = useCallback(() => setState((s) => undoColor(s)), [])
  const submit = useCallback(() => setState((s) => submitGuessState(s)), [])
  const playAgain = useCallback(() => setState((s) => startNewGame(s)), [])

  return { state, pickColor, undo, submit, playAgain }
}
