import { describe, expect, test } from 'vitest'

import { Colors, Pip, CODE_LENGTH, MAX_GUESSES } from 'app/constants.ts'
import {
  createGame,
  addColor,
  removeLastColor,
  submitGuess,
  resetGame,
} from 'app/gameState.ts'

/**
 * TDD spec for the game-flow state machine in `app/gameState.ts` (not yet written).
 *
 * All functions are pure: they take a GameState and return a NEW GameState
 * without mutating the input (so React can hold state immutably).
 *
 * Assumed shapes / API:
 *   type GameStatus = 'playing' | 'won' | 'lost'
 *   interface GuessRow { guess: Colors[]; feedback: Pip[] }
 *   interface GameState {
 *     secret: Colors[]               // the code to break
 *     currentGuess: Colors[]         // colors picked but not yet submitted (0..CODE_LENGTH)
 *     guesses: GuessRow[]            // submitted guesses + their feedback
 *     status: GameStatus
 *   }
 *
 *   createGame(secret?: Colors[]): GameState   // secret optional for deterministic tests
 *   addColor(state, color): GameState          // append to currentGuess (lenient: no-op when full / not playing)
 *   removeLastColor(state): GameState          // undo most recent picked color (lenient no-op when empty)
 *   submitGuess(state): GameState              // commit currentGuess; throws if not exactly CODE_LENGTH or not playing
 *   resetGame(): GameState                     // "play again" — fresh playing game with a new secret
 *
 * Rules (SPEC.md):
 *   - 10 guesses before game over
 *   - you win if you guess the 4 colors in the correct order
 *   - if the game is won, no more guesses are needed
 *   - undo only removes the most recently added color
 */

const fullGuess = (g: Colors[], state: ReturnType<typeof createGame>) =>
  g.reduce((s, c) => addColor(s, c), state)

describe('createGame', () => {
  test('starts in the playing state', () => {
    expect(createGame().status).toBe('playing')
  })

  test('starts with no submitted guesses', () => {
    expect(createGame().guesses).toEqual([])
  })

  test('starts with an empty current guess', () => {
    expect(createGame().currentGuess).toEqual([])
  })

  test('has a secret code of the correct length', () => {
    expect(createGame().secret).toHaveLength(CODE_LENGTH)
  })

  test('uses a provided secret when given one (for deterministic play)', () => {
    const secret = [Colors.Red, Colors.Green, Colors.Blue, Colors.Yellow]
    expect(createGame(secret).secret).toEqual(secret)
  })
})

describe('addColor', () => {
  test('appends the chosen color to the current guess', () => {
    const state = addColor(createGame(), Colors.Red)
    expect(state.currentGuess).toEqual([Colors.Red])
  })

  test('appends colors in the order they are chosen', () => {
    const state = fullGuess([Colors.Red, Colors.Green, Colors.Blue], createGame())
    expect(state.currentGuess).toEqual([Colors.Red, Colors.Green, Colors.Blue])
  })

  test('does not mutate the previous state (immutability)', () => {
    const before = createGame()
    addColor(before, Colors.Red)
    expect(before.currentGuess).toEqual([])
  })

  test('does not allow more than CODE_LENGTH colors', () => {
    const secret = [Colors.Red, Colors.Red, Colors.Red, Colors.Red]
    const state = fullGuess(
      [Colors.Red, Colors.Green, Colors.Blue, Colors.Yellow, Colors.Orange],
      createGame(secret),
    )
    expect(state.currentGuess).toHaveLength(CODE_LENGTH)
    expect(state.currentGuess).toEqual([Colors.Red, Colors.Green, Colors.Blue, Colors.Yellow])
  })
})

describe('removeLastColor (undo)', () => {
  test('removes only the most recently added color', () => {
    const picked = fullGuess([Colors.Red, Colors.Green, Colors.Blue], createGame())
    const state = removeLastColor(picked)
    expect(state.currentGuess).toEqual([Colors.Red, Colors.Green])
  })

  test('is a no-op when the current guess is empty', () => {
    const state = removeLastColor(createGame())
    expect(state.currentGuess).toEqual([])
  })

  test('does not mutate the previous state (immutability)', () => {
    const picked = fullGuess([Colors.Red, Colors.Green], createGame())
    removeLastColor(picked)
    expect(picked.currentGuess).toEqual([Colors.Red, Colors.Green])
  })
})

describe('submitGuess', () => {
  const secret = [Colors.Red, Colors.Green, Colors.Blue, Colors.Yellow]

  test('records the submitted guess and its feedback', () => {
    const ready = fullGuess(secret, createGame(secret))
    const state = submitGuess(ready)
    expect(state.guesses).toHaveLength(1)
    expect(state.guesses[0].guess).toEqual(secret)
    expect(state.guesses[0].feedback).toEqual([Pip.Black, Pip.Black, Pip.Black, Pip.Black])
  })

  test('clears the current guess after submitting', () => {
    const wrong = [Colors.Orange, Colors.Orange, Colors.Orange, Colors.Orange]
    const state = submitGuess(fullGuess(wrong, createGame(secret)))
    expect(state.currentGuess).toEqual([])
  })

  test('sets status to "won" when the guess matches the secret', () => {
    const state = submitGuess(fullGuess(secret, createGame(secret)))
    expect(state.status).toBe('won')
  })

  test('stays "playing" after a wrong guess when guesses remain', () => {
    const wrong = [Colors.Orange, Colors.Orange, Colors.Orange, Colors.Orange]
    const state = submitGuess(fullGuess(wrong, createGame(secret)))
    expect(state.status).toBe('playing')
  })

  test('does not mutate the previous state (immutability)', () => {
    const ready = fullGuess(secret, createGame(secret))
    submitGuess(ready)
    expect(ready.guesses).toEqual([])
    expect(ready.status).toBe('playing')
  })

  test('throws when the current guess is not exactly CODE_LENGTH colors', () => {
    const incomplete = fullGuess([Colors.Red, Colors.Green], createGame(secret))
    expect(() => submitGuess(incomplete)).toThrow()
  })

  describe('game over after MAX_GUESSES', () => {
    const wrong = [Colors.Orange, Colors.Orange, Colors.Orange, Colors.Orange]

    const playWrongTimes = (n: number) => {
      let state = createGame(secret)
      for (let i = 0; i < n; i++) {
        state = submitGuess(fullGuess(wrong, state))
      }
      return state
    }

    test('is still playing after 9 wrong guesses', () => {
      const state = playWrongTimes(MAX_GUESSES - 1)
      expect(state.status).toBe('playing')
      expect(state.guesses).toHaveLength(MAX_GUESSES - 1)
    })

    test('is "lost" after 10 wrong guesses', () => {
      const state = playWrongTimes(MAX_GUESSES)
      expect(state.status).toBe('lost')
      expect(state.guesses).toHaveLength(MAX_GUESSES)
    })

    test('a winning guess on the final turn wins rather than loses', () => {
      let state = playWrongTimes(MAX_GUESSES - 1)
      state = submitGuess(fullGuess(secret, state))
      expect(state.status).toBe('won')
      expect(state.guesses).toHaveLength(MAX_GUESSES)
    })

    test('cannot submit more guesses once the game is lost', () => {
      const state = playWrongTimes(MAX_GUESSES)
      const ready = fullGuess(wrong, state)
      expect(() => submitGuess(ready)).toThrow()
    })
  })

  test('cannot submit another guess once the game is won — no more guesses needed', () => {
    const won = submitGuess(fullGuess(secret, createGame(secret)))
    const ready = fullGuess([Colors.Red, Colors.Red, Colors.Red, Colors.Red], won)
    expect(() => submitGuess(ready)).toThrow()
  })
})

describe('resetGame (play again)', () => {
  test('returns a fresh game in the playing state', () => {
    const state = resetGame()
    expect(state.status).toBe('playing')
    expect(state.guesses).toEqual([])
    expect(state.currentGuess).toEqual([])
  })

  test('produces a secret of the correct length', () => {
    expect(resetGame().secret).toHaveLength(CODE_LENGTH)
  })
})
