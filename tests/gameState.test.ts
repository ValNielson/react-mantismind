import { describe, expect, test, vi } from 'vitest'

import { MASTERMIND_COLORS, MAX_GUESSES } from '@/lib/gameLogic'
import {
  addColorToCurrentGuess,
  createInitialGameState,
  goHome,
  selectPublicGameState,
  startNewGame,
  submitGuess,
  undoLastColor,
} from '@/lib/gameState'

const [red, orange, yellow, green, blue, purple] = MASTERMIND_COLORS
const winningCode = [red, orange, yellow, green] as const
const losingGuess = [blue, blue, purple, purple] as const

describe('Game state initialization', () => {
  test('starts on the home screen with no active game', () => {
    expect(createInitialGameState()).toMatchObject({
      status: 'home',
      guesses: [],
      currentGuess: [],
      feedbackByRow: [],
      remainingGuesses: MAX_GUESSES,
      winner: false,
    })
  })

  test('starts a new in-memory game with an empty 10-row board and a generated secret code', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })

    expect(state.status).toBe('playing')
    expect(state.secretCode).toEqual(winningCode)
    expect(state.guesses).toEqual([])
    expect(state.currentGuess).toEqual([])
    expect(state.feedbackByRow).toEqual([])
    expect(state.remainingGuesses).toBe(10)
  })

  test('does not expose the secret code through public game state selectors', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })

    expect(selectPublicGameState(state)).not.toHaveProperty('secretCode')
  })
})

describe('Guess construction', () => {
  test('adds selected colors to the current guess in sequence order', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })
    const withColors = [red, orange, yellow].reduce(addColorToCurrentGuess, state)

    expect(withColors.currentGuess).toEqual([red, orange, yellow])
  })

  test('undo removes only the most recently selected color', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })
    const withColors = [red, orange, yellow].reduce(addColorToCurrentGuess, state)

    expect(undoLastColor(withColors).currentGuess).toEqual([red, orange])
  })

  test('does nothing when undo is used on an empty current guess', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })

    expect(undoLastColor(state)).toEqual(state)
  })

  test('does not allow more than 4 colors in the current guess', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })
    const fullGuess = [red, orange, yellow, green].reduce(addColorToCurrentGuess, state)

    expect(() => addColorToCurrentGuess(fullGuess, blue)).toThrow(/full/i)
  })

  test('rejects invalid colors while building a guess', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })

    expect(() => addColorToCurrentGuess(state, 'black')).toThrow(/invalid color/i)
    expect(() => addColorToCurrentGuess(state, 'not-a-game-color')).toThrow(/invalid color/i)
  })
})

describe('Submitting guesses and feedback', () => {
  test('does not allow submitting before 4 colors have been selected', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })
    const partialGuess = [red, orange, yellow].reduce(addColorToCurrentGuess, state)

    expect(() => submitGuess(partialGuess)).toThrow(/4 colors/i)
  })

  test('records a full submitted guess, clears the input, and generates feedback only after submit', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })
    const fullGuess = [red, green, orange, purple].reduce(addColorToCurrentGuess, state)

    expect(fullGuess.feedbackByRow).toEqual([])

    const submitted = submitGuess(fullGuess)
    expect(submitted.guesses).toEqual([[red, green, orange, purple]])
    expect(submitted.currentGuess).toEqual([])
    expect(submitted.feedbackByRow).toEqual([['black', 'white', 'white']])
    expect(submitted.remainingGuesses).toBe(9)
  })

  test('keeps previous rows immutable when later guesses are submitted', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })
    const first = submitGuess([blue, blue, purple, purple].reduce(addColorToCurrentGuess, state))
    const second = submitGuess([red, green, orange, purple].reduce(addColorToCurrentGuess, first))

    expect(first.guesses).toEqual([losingGuess])
    expect(first.feedbackByRow).toEqual([[]])
    expect(second.guesses).toEqual([losingGuess, [red, green, orange, purple]])
    expect(second.feedbackByRow).toEqual([[], ['black', 'white', 'white']])
  })
})

describe('Win and lose conditions', () => {
  test('marks the game as won after an exact guess and requires no further guesses', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })
    const won = submitGuess([...winningCode].reduce(addColorToCurrentGuess, state))

    expect(won.status).toBe('won')
    expect(won.winner).toBe(true)
    expect(won.feedbackByRow).toEqual([['black', 'black', 'black', 'black']])
    expect(won.remainingGuesses).toBe(9)
  })

  test('prevents additional edits after the game has been won', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })
    const won = submitGuess([...winningCode].reduce(addColorToCurrentGuess, state))

    expect(() => addColorToCurrentGuess(won, red)).toThrow(/not active/i)
    expect(() => undoLastColor(won)).toThrow(/not active/i)
    expect(() => submitGuess(won)).toThrow(/not active/i)
  })

  test('allows exactly 10 guesses before losing', () => {
    let state = startNewGame(createInitialGameState(), { secretCode: winningCode })

    for (let i = 0; i < MAX_GUESSES; i += 1) {
      state = submitGuess([...losingGuess].reduce(addColorToCurrentGuess, state))
    }

    expect(state.status).toBe('lost')
    expect(state.winner).toBe(false)
    expect(state.guesses).toHaveLength(10)
    expect(state.remainingGuesses).toBe(0)
  })

  test('prevents an eleventh guess after the game is lost', () => {
    let state = startNewGame(createInitialGameState(), { secretCode: winningCode })
    for (let i = 0; i < MAX_GUESSES; i += 1) {
      state = submitGuess([...losingGuess].reduce(addColorToCurrentGuess, state))
    }

    expect(() => addColorToCurrentGuess(state, red)).toThrow(/not active/i)
  })
})

describe('Game reset and local-only behavior', () => {
  test('play again resets all guesses and starts with the provided new code', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })
    const won = submitGuess([...winningCode].reduce(addColorToCurrentGuess, state))
    const restarted = startNewGame(won, { secretCode: [purple, blue, green, yellow] })

    expect(restarted.status).toBe('playing')
    expect(restarted.secretCode).toEqual([purple, blue, green, yellow])
    expect(restarted.guesses).toEqual([])
    expect(restarted.feedbackByRow).toEqual([])
    expect(restarted.currentGuess).toEqual([])
    expect(restarted.remainingGuesses).toBe(10)
  })

  test('go home exits the game without preserving board state', () => {
    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })
    const submitted = submitGuess([...losingGuess].reduce(addColorToCurrentGuess, state))

    expect(goHome(submitted)).toEqual(createInitialGameState())
  })

  test('state transitions are local and do not call network APIs', () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const state = startNewGame(createInitialGameState(), { secretCode: winningCode })
    submitGuess([...losingGuess].reduce(addColorToCurrentGuess, state))

    expect(fetchSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})