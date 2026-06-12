import { describe, expect, test } from 'vitest'

import {
  CODE_LENGTH,
  Colors,
  FeedbackPip,
  MAX_GUESSES,
  addColorToCurrentGuess,
  calculateFeedback,
  checkWinCondition,
  createSecretCode,
  goHome,
  isValidGuess,
  playAgain,
  startGame,
  submitGuess,
  undoCurrentGuess,
} from '../app/gameLogic'

const ALL_COLORS = [
  Colors.Red,
  Colors.Orange,
  Colors.Yellow,
  Colors.Green,
  Colors.Blue,
  Colors.Purple,
]

const ANSWER = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
const WRONG_GUESS = [Colors.Red, Colors.Red, Colors.Red, Colors.Red]

describe('Mastermind constants', () => {
  test('uses exactly six playable colors and excludes feedback pip colors', () => {
    expect(CODE_LENGTH).toBe(4)
    expect(MAX_GUESSES).toBe(10)
    expect(new Set(ALL_COLORS)).toHaveLength(6)
    expect(ALL_COLORS).not.toContain('black')
    expect(ALL_COLORS).not.toContain('white')
  })
})

describe('secret code generation', () => {
  test('creates a four-color secret code from the playable colors', () => {
    const code = createSecretCode(() => 0.01)

    expect(code).toHaveLength(CODE_LENGTH)
    expect(code.every((color) => ALL_COLORS.includes(color))).toBe(true)
  })

  test('allows repeated colors in the generated code', () => {
    expect(createSecretCode(() => 0)).toEqual([
      Colors.Red,
      Colors.Red,
      Colors.Red,
      Colors.Red,
    ])
  })

  test('supports deterministic code generation when an rng is injected', () => {
    const rolls = [0, 0.2, 0.5, 0.99]
    const rng = () => rolls.shift() ?? 0

    expect(createSecretCode(rng)).toEqual([
      Colors.Red,
      Colors.Orange,
      Colors.Green,
      Colors.Purple,
    ])
  })
})

describe('guess validation and win condition', () => {
  test('accepts only complete four-color guesses', () => {
    expect(isValidGuess(ANSWER)).toBe(true)
    expect(isValidGuess(ANSWER.slice(0, 3))).toBe(false)
    expect(isValidGuess([...ANSWER, Colors.Red])).toBe(false)
  })

  test('rejects guesses containing colors outside the six playable colors', () => {
    expect(isValidGuess([Colors.Red, Colors.Blue, 'black', Colors.Green])).toBe(false)
    expect(isValidGuess([Colors.Red, Colors.Blue, 'white', Colors.Green])).toBe(false)
  })

  test('detects a winning guess only when all colors match in order', () => {
    expect(checkWinCondition(ANSWER, ANSWER)).toBe(true)
    expect(checkWinCondition([Colors.Orange, Colors.Green, Colors.Blue, Colors.Orange], ANSWER)).toBe(false)
    expect(checkWinCondition([Colors.Green, Colors.Orange, Colors.Blue, Colors.Red], ANSWER)).toBe(false)
  })
})

describe('feedback calculation', () => {
  test('returns four black pips for an exact match', () => {
    expect(calculateFeedback(ANSWER, ANSWER)).toEqual([
      FeedbackPip.Black,
      FeedbackPip.Black,
      FeedbackPip.Black,
      FeedbackPip.Black,
    ])
  })

  test('returns white pips for correct colors in incorrect spots', () => {
    expect(
      calculateFeedback(
        [Colors.Orange, Colors.Blue, Colors.Orange, Colors.Green],
        ANSWER,
      ),
    ).toEqual([
      FeedbackPip.White,
      FeedbackPip.White,
      FeedbackPip.White,
      FeedbackPip.White,
    ])
  })

  test('sorts feedback with all black pips before white pips', () => {
    expect(
      calculateFeedback(
        [Colors.Green, Colors.Blue, Colors.Orange, Colors.Red],
        ANSWER,
      ),
    ).toEqual([FeedbackPip.Black, FeedbackPip.White, FeedbackPip.White])
  })

  test('returns no feedback pips when no colors match', () => {
    expect(calculateFeedback(WRONG_GUESS, [Colors.Blue, Colors.Blue, Colors.Blue, Colors.Blue])).toEqual([])
  })

  test('does not over-count duplicate colors from the answer', () => {
    expect(
      calculateFeedback(
        [Colors.Red, Colors.Blue, Colors.Red, Colors.Red],
        [Colors.Red, Colors.Red, Colors.Blue, Colors.Green],
      ),
    ).toEqual([FeedbackPip.Black, FeedbackPip.White, FeedbackPip.White])
  })

  test('does not award white pips for duplicate guesses already consumed by black pips', () => {
    expect(
      calculateFeedback(
        [Colors.Blue, Colors.Blue, Colors.Blue, Colors.Blue],
        [Colors.Red, Colors.Blue, Colors.Blue, Colors.Green],
      ),
    ).toEqual([FeedbackPip.Black, FeedbackPip.Black])
  })
})

describe('in-memory game state', () => {
  test('starts a new local game with an empty board and generated secret code', () => {
    const state = startGame({ secretCode: ANSWER })

    expect(state.status).toBe('playing')
    expect(state.secretCode).toEqual(ANSWER)
    expect(state.guesses).toEqual([])
    expect(state.currentGuess).toEqual([])
    expect(state.remainingGuesses).toBe(MAX_GUESSES)
  })

  test('adds selected colors in sequence without mutating the previous state', () => {
    const state = startGame({ secretCode: ANSWER })
    const next = addColorToCurrentGuess(state, Colors.Green)

    expect(next.currentGuess).toEqual([Colors.Green])
    expect(state.currentGuess).toEqual([])
  })

  test('prevents adding more than four colors to the current guess', () => {
    const state = startGame({ secretCode: ANSWER })
    const fullGuess = ANSWER.reduce(addColorToCurrentGuess, state)
    const afterExtraColor = addColorToCurrentGuess(fullGuess, Colors.Red)

    expect(afterExtraColor.currentGuess).toEqual(ANSWER)
  })

  test('undo removes only the most recently selected color', () => {
    const state = ANSWER.slice(0, 3).reduce(
      addColorToCurrentGuess,
      startGame({ secretCode: ANSWER }),
    )

    expect(undoCurrentGuess(state).currentGuess).toEqual([Colors.Green, Colors.Orange])
  })

  test('submitting is blocked until the current guess contains exactly four colors', () => {
    const incomplete = ANSWER.slice(0, 3).reduce(
      addColorToCurrentGuess,
      startGame({ secretCode: ANSWER }),
    )

    expect(() => submitGuess(incomplete)).toThrow(/complete/i)
  })

  test('records guesses and feedback only after a full guess is submitted', () => {
    const readyToSubmit = [Colors.Green, Colors.Blue, Colors.Orange, Colors.Red].reduce(
      addColorToCurrentGuess,
      startGame({ secretCode: ANSWER }),
    )
    const afterSubmit = submitGuess(readyToSubmit)

    expect(readyToSubmit.guesses).toEqual([])
    expect(afterSubmit.guesses).toEqual([
      {
        code: [Colors.Green, Colors.Blue, Colors.Orange, Colors.Red],
        feedback: [FeedbackPip.Black, FeedbackPip.White, FeedbackPip.White],
      },
    ])
    expect(afterSubmit.currentGuess).toEqual([])
    expect(afterSubmit.remainingGuesses).toBe(MAX_GUESSES - 1)
  })

  test('marks the game as won immediately after a correct guess', () => {
    const won = submitGuess(ANSWER.reduce(addColorToCurrentGuess, startGame({ secretCode: ANSWER })))

    expect(won.status).toBe('won')
    expect(won.remainingGuesses).toBe(MAX_GUESSES - 1)
  })

  test('does not accept more guesses after the player wins', () => {
    const won = submitGuess(ANSWER.reduce(addColorToCurrentGuess, startGame({ secretCode: ANSWER })))

    expect(addColorToCurrentGuess(won, Colors.Red)).toEqual(won)
    expect(() => submitGuess(won)).toThrow(/game is over/i)
  })

  test('marks the game as lost after ten submitted non-winning guesses', () => {
    let state = startGame({ secretCode: [Colors.Blue, Colors.Blue, Colors.Blue, Colors.Blue] })

    for (let turn = 0; turn < MAX_GUESSES; turn += 1) {
      state = submitGuess(WRONG_GUESS.reduce(addColorToCurrentGuess, state))
    }

    expect(state.status).toBe('lost')
    expect(state.guesses).toHaveLength(MAX_GUESSES)
    expect(state.remainingGuesses).toBe(0)
  })

  test('play again resets all guesses and starts with a new secret code', () => {
    const won = submitGuess(ANSWER.reduce(addColorToCurrentGuess, startGame({ secretCode: ANSWER })))
    const replay = playAgain(won, {
      secretCode: [Colors.Red, Colors.Yellow, Colors.Green, Colors.Blue],
    })

    expect(replay.status).toBe('playing')
    expect(replay.secretCode).toEqual([Colors.Red, Colors.Yellow, Colors.Green, Colors.Blue])
    expect(replay.guesses).toEqual([])
    expect(replay.currentGuess).toEqual([])
    expect(replay.remainingGuesses).toBe(MAX_GUESSES)
  })

  test('go home returns to the opening screen state without persisting game progress', () => {
    const playing = ANSWER.slice(0, 2).reduce(addColorToCurrentGuess, startGame({ secretCode: ANSWER }))

    expect(goHome(playing)).toEqual({ status: 'home' })
  })
})
