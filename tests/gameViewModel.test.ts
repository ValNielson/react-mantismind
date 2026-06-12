import { describe, expect, test } from 'vitest'

import { MASTERMIND_COLORS, MAX_GUESSES } from '@/lib/gameLogic'
import { createInitialGameState, startNewGame, submitGuess, addColorToCurrentGuess } from '@/lib/gameState'
import {
  createEndGameDialogModel,
  createGameBoardModel,
  createHomeScreenModel,
  createPaletteModel,
} from '@/lib/gameViewModel'

const [red, orange, yellow, green, blue, purple] = MASTERMIND_COLORS
const secretCode = [red, orange, yellow, green] as const

describe('Home screen model', () => {
  test('shows an opening start game button before the game begins', () => {
    expect(createHomeScreenModel(createInitialGameState())).toMatchObject({
      visible: true,
      startButton: { visible: true, label: 'Start game' },
    })
  })

  test('hides the home screen once a game starts', () => {
    const state = startNewGame(createInitialGameState(), { secretCode })

    expect(createHomeScreenModel(state).visible).toBe(false)
  })
})

describe('Game board model', () => {
  test('renders a 10 by 4 empty board for a new game', () => {
    const state = startNewGame(createInitialGameState(), { secretCode })
    const board = createGameBoardModel(state)

    expect(board.rows).toHaveLength(MAX_GUESSES)
    for (const row of board.rows) {
      expect(row.slots).toHaveLength(4)
      expect(row.slots.every((slot) => slot.color === null)).toBe(true)
      expect(row.feedbackPips).toEqual([])
    }
  })

  test('shows current unsubmitted color selections without feedback pips', () => {
    const state = startNewGame(createInitialGameState(), { secretCode })
    const selecting = [red, orange].reduce(addColorToCurrentGuess, state)
    const firstRow = createGameBoardModel(selecting).rows[0]

    expect(firstRow.slots.map((slot) => slot.color)).toEqual([red, orange, null, null])
    expect(firstRow.feedbackPips).toEqual([])
    expect(firstRow.submitted).toBe(false)
  })

  test('shows feedback next to a row only after that row has been submitted', () => {
    const state = startNewGame(createInitialGameState(), { secretCode })
    const submitted = submitGuess([red, green, orange, purple].reduce(addColorToCurrentGuess, state))
    const [firstRow, secondRow] = createGameBoardModel(submitted).rows

    expect(firstRow.submitted).toBe(true)
    expect(firstRow.feedbackPips).toEqual(['black', 'white', 'white'])
    expect(secondRow.feedbackPips).toEqual([])
  })

  test('models each feedback area as a 2 by 2 pip grid', () => {
    const state = startNewGame(createInitialGameState(), { secretCode })
    const board = createGameBoardModel(state)

    for (const row of board.rows) {
      expect(row.feedbackGrid).toMatchObject({ rows: 2, columns: 2 })
    }
  })
})

describe('Palette and controls model', () => {
  test('exposes the 6 playable colors as clickable dots and excludes feedback colors', () => {
    const palette = createPaletteModel(startNewGame(createInitialGameState(), { secretCode }))

    expect(palette.colors.map((color) => color.value)).toEqual(MASTERMIND_COLORS)
    expect(palette.colors.every((color) => color.kind === 'button')).toBe(true)
    expect(palette.colors.map((color) => color.value)).not.toContain('black')
    expect(palette.colors.map((color) => color.value)).not.toContain('white')
  })

  test('enables submit only when exactly 4 colors are selected', () => {
    const state = startNewGame(createInitialGameState(), { secretCode })
    const partial = [red, orange, yellow].reduce(addColorToCurrentGuess, state)
    const full = addColorToCurrentGuess(partial, green)

    expect(createPaletteModel(partial).submitButton.disabled).toBe(true)
    expect(createPaletteModel(full).submitButton.disabled).toBe(false)
  })

  test('enables undo only when at least one color has been selected', () => {
    const state = startNewGame(createInitialGameState(), { secretCode })

    expect(createPaletteModel(state).undoButton.disabled).toBe(true)
    expect(createPaletteModel(addColorToCurrentGuess(state, red)).undoButton.disabled).toBe(false)
  })
})

describe('End-game dialog model', () => {
  test('does not show an end-game dialog during active play', () => {
    const state = startNewGame(createInitialGameState(), { secretCode })

    expect(createEndGameDialogModel(state).visible).toBe(false)
  })

  test('shows a win dialog with play again and go home actions after a win', () => {
    const state = startNewGame(createInitialGameState(), { secretCode })
    const won = submitGuess([...secretCode].reduce(addColorToCurrentGuess, state))

    expect(createEndGameDialogModel(won)).toMatchObject({
      visible: true,
      message: 'you win!',
      actions: [
        { label: 'Play again', action: 'play-again' },
        { label: 'Go home', action: 'go-home' },
      ],
    })
  })

  test('shows a loss dialog with play again and go home actions after 10 misses', () => {
    let state = startNewGame(createInitialGameState(), { secretCode })
    for (let i = 0; i < MAX_GUESSES; i += 1) {
      state = submitGuess([blue, blue, purple, purple].reduce(addColorToCurrentGuess, state))
    }

    expect(createEndGameDialogModel(state)).toMatchObject({
      visible: true,
      message: 'game over',
      actions: [
        { label: 'Play again', action: 'play-again' },
        { label: 'Go home', action: 'go-home' },
      ],
    })
  })
})