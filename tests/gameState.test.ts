import { describe, expect, test } from 'vitest'

import { Colors, Pip, CODE_LENGTH, MAX_GUESSES } from "app/constants.ts"
import { addColor, createInitialState, startNewGame, submitGuess, undoColor } from "app/gameState.ts"
import type { GameState } from "app/gameState.ts"

const { Red, Orange, Yellow, Green, Blue, Purple } = Colors

const CODE: Colors[] = [Red, Green, Blue, Yellow]
// Shares no colors with CODE, so it earns zero pips and never wins
const WRONG_GUESS: Colors[] = [Orange, Purple, Orange, Purple]

function withCurrentGuess(state: GameState, guess: Colors[]): GameState {
  return guess.reduce((s, color) => addColor(s, color), state)
}

describe('createInitialState', () => {
  test('starts with an empty board and a game in progress', () => {
    const state = createInitialState(CODE)
    expect(state.guesses).toEqual([])
    expect(state.currentGuess).toEqual([])
    expect(state.status).toEqual('playing')
  })

  test('uses the provided secret code', () => {
    const state = createInitialState(CODE)
    expect(state.secretCode).toEqual(CODE)
  })

  test('generates a valid secret code when none is provided', () => {
    const state = createInitialState()
    expect(state.secretCode).toHaveLength(CODE_LENGTH)
    const validColors = Object.values(Colors)
    for (const color of state.secretCode) {
      expect(validColors).toContain(color)
    }
  })
})

describe('addColor', () => {
  test('adds a color to the current guess', () => {
    const state = addColor(createInitialState(CODE), Red)
    expect(state.currentGuess).toEqual([Red])
  })

  test('keeps colors in the order they were picked', () => {
    const state = withCurrentGuess(createInitialState(CODE), [Blue, Red, Blue])
    expect(state.currentGuess).toEqual([Blue, Red, Blue])
  })

  test('ignores a fifth color once the guess is full', () => {
    const full = withCurrentGuess(createInitialState(CODE), [Red, Red, Red, Red])
    const after = addColor(full, Blue)
    expect(after.currentGuess).toEqual([Red, Red, Red, Red])
  })

  test('does not mutate the previous state', () => {
    const before = createInitialState(CODE)
    addColor(before, Red)
    expect(before.currentGuess).toEqual([])
  })
})

describe('undoColor', () => {
  test('removes only the most recently added color', () => {
    const state = withCurrentGuess(createInitialState(CODE), [Red, Green, Blue])
    expect(undoColor(state).currentGuess).toEqual([Red, Green])
  })

  test('does nothing when the current guess is empty', () => {
    const state = createInitialState(CODE)
    expect(undoColor(state).currentGuess).toEqual([])
  })

  test('does not mutate the previous state', () => {
    const before = withCurrentGuess(createInitialState(CODE), [Red, Green])
    undoColor(before)
    expect(before.currentGuess).toEqual([Red, Green])
  })
})

describe('submitGuess', () => {
  test('records a full guess with its feedback and clears the current guess', () => {
    const ready = withCurrentGuess(createInitialState(CODE), [Red, Green, Yellow, Blue])
    const after = submitGuess(ready)
    expect(after.guesses).toHaveLength(1)
    expect(after.guesses[0].guess).toEqual([Red, Green, Yellow, Blue])
    // Red and Green are exact; Blue and Yellow are swapped
    expect(after.guesses[0].feedback).toEqual([Pip.Black, Pip.Black, Pip.White, Pip.White])
    expect(after.currentGuess).toEqual([])
  })

  test('no feedback appears until the guess is submitted', () => {
    const ready = withCurrentGuess(createInitialState(CODE), [Red, Green, Blue, Yellow])
    expect(ready.guesses).toEqual([])
  })

  test('rejects a guess of fewer than 4 colors', () => {
    const partial = withCurrentGuess(createInitialState(CODE), [Red, Green, Blue])
    const after = submitGuess(partial)
    expect(after.guesses).toEqual([])
    expect(after.currentGuess).toEqual([Red, Green, Blue])
  })

  test('an incorrect guess leaves the game in progress', () => {
    const after = submitGuess(withCurrentGuess(createInitialState(CODE), WRONG_GUESS))
    expect(after.status).toEqual('playing')
  })

  test('guessing the code wins the game', () => {
    const after = submitGuess(withCurrentGuess(createInitialState(CODE), CODE))
    expect(after.status).toEqual('won')
  })

  test('the player can win before using all 10 guesses', () => {
    let state = createInitialState(CODE)
    state = submitGuess(withCurrentGuess(state, WRONG_GUESS))
    state = submitGuess(withCurrentGuess(state, CODE))
    expect(state.status).toEqual('won')
    expect(state.guesses).toHaveLength(2)
  })

  test('10 incorrect guesses loses the game', () => {
    let state = createInitialState(CODE)
    for (let i = 0; i < MAX_GUESSES; i++) {
      state = submitGuess(withCurrentGuess(state, WRONG_GUESS))
    }
    expect(state.status).toEqual('lost')
    expect(state.guesses).toHaveLength(MAX_GUESSES)
  })

  test('the game stays in progress through the 9th incorrect guess', () => {
    let state = createInitialState(CODE)
    for (let i = 0; i < MAX_GUESSES - 1; i++) {
      state = submitGuess(withCurrentGuess(state, WRONG_GUESS))
    }
    expect(state.status).toEqual('playing')
  })

  test('no more guesses are accepted after a win', () => {
    const won = submitGuess(withCurrentGuess(createInitialState(CODE), CODE))
    const after = submitGuess(withCurrentGuess(won, WRONG_GUESS))
    expect(after.guesses).toHaveLength(1)
    expect(after.status).toEqual('won')
  })

  test('no more colors can be picked after the game is over', () => {
    const won = submitGuess(withCurrentGuess(createInitialState(CODE), CODE))
    expect(addColor(won, Red).currentGuess).toEqual([])
  })

  test('no more guesses are accepted after a loss', () => {
    let state = createInitialState(CODE)
    for (let i = 0; i < MAX_GUESSES; i++) {
      state = submitGuess(withCurrentGuess(state, WRONG_GUESS))
    }
    const after = submitGuess(withCurrentGuess(state, CODE))
    expect(after.guesses).toHaveLength(MAX_GUESSES)
    expect(after.status).toEqual('lost')
  })

  test('does not mutate the previous state', () => {
    const ready = withCurrentGuess(createInitialState(CODE), WRONG_GUESS)
    submitGuess(ready)
    expect(ready.guesses).toEqual([])
    expect(ready.currentGuess).toEqual(WRONG_GUESS)
  })
})

describe('startNewGame', () => {
  test('play again resets the board to a fresh game', () => {
    const won = submitGuess(withCurrentGuess(createInitialState(CODE), CODE))
    const fresh = startNewGame(won)
    expect(fresh.guesses).toEqual([])
    expect(fresh.currentGuess).toEqual([])
    expect(fresh.status).toEqual('playing')
  })

  test('a new game gets a newly generated valid code', () => {
    const won = submitGuess(withCurrentGuess(createInitialState(CODE), CODE))
    const fresh = startNewGame(won)
    expect(fresh.secretCode).toHaveLength(CODE_LENGTH)
    const validColors = Object.values(Colors)
    for (const color of fresh.secretCode) {
      expect(validColors).toContain(color)
    }
  })
})
