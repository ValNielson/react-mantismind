// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'

import { Colors } from '../app/gameLogic'
import { MastermindApp } from '../app/MastermindApp'

const ANSWER = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
const WRONG_GUESS = [Colors.Red, Colors.Red, Colors.Red, Colors.Red]

afterEach(() => {
  vi.restoreAllMocks()
})

async function chooseGuess(colors: Colors[]) {
  const user = userEvent.setup()

  for (const color of colors) {
    await user.click(screen.getByRole('button', { name: new RegExp(`choose ${color}`, 'i') }))
  }

  return user
}

describe('Mastermind app UI', () => {
  test('opens on a start game screen before any board is shown', () => {
    render(<MastermindApp codeGenerator={() => ANSWER} />)

    expect(screen.getByRole('button', { name: /start game/i })).toBeVisible()
    expect(screen.queryByRole('grid', { name: /mastermind board/i })).not.toBeInTheDocument()
  })

  test('start game shows an empty 10 by 4 board with a 2 by 2 feedback area per row', async () => {
    const user = userEvent.setup()
    render(<MastermindApp codeGenerator={() => ANSWER} />)

    await user.click(screen.getByRole('button', { name: /start game/i }))

    const board = screen.getByRole('grid', { name: /mastermind board/i })
    const rows = within(board).getAllByRole('row', { name: /guess row/i })

    expect(rows).toHaveLength(10)
    for (const row of rows) {
      expect(within(row).getAllByTestId('guess-slot')).toHaveLength(4)
      expect(within(row).getAllByTestId('feedback-pip-slot')).toHaveLength(4)
    }
  })

  test('color picker contains the six playable colors and not black or white', async () => {
    const user = userEvent.setup()
    render(<MastermindApp codeGenerator={() => ANSWER} />)

    await user.click(screen.getByRole('button', { name: /start game/i }))

    for (const color of [Colors.Red, Colors.Orange, Colors.Yellow, Colors.Green, Colors.Blue, Colors.Purple]) {
      expect(screen.getByRole('button', { name: new RegExp(`choose ${color}`, 'i') })).toBeVisible()
    }
    expect(screen.queryByRole('button', { name: /choose black/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /choose white/i })).not.toBeInTheDocument()
  })

  test('selected colors fill the current guess in order and undo removes the latest color', async () => {
    const user = userEvent.setup()
    render(<MastermindApp codeGenerator={() => ANSWER} />)

    await user.click(screen.getByRole('button', { name: /start game/i }))
    await chooseGuess([Colors.Green, Colors.Orange, Colors.Blue])

    expect(screen.getByLabelText(/current guess slot 1 green/i)).toBeVisible()
    expect(screen.getByLabelText(/current guess slot 2 orange/i)).toBeVisible()
    expect(screen.getByLabelText(/current guess slot 3 blue/i)).toBeVisible()

    await user.click(screen.getByRole('button', { name: /undo/i }))

    expect(screen.getByLabelText(/current guess slot 3 empty/i)).toBeVisible()
    expect(screen.getByLabelText(/current guess slot 2 orange/i)).toBeVisible()
  })

  test('submit is disabled until four colors are selected and feedback appears only after submit', async () => {
    const user = userEvent.setup()
    render(<MastermindApp codeGenerator={() => ANSWER} />)

    await user.click(screen.getByRole('button', { name: /start game/i }))
    expect(screen.getByRole('button', { name: /submit guess/i })).toBeDisabled()

    await chooseGuess([Colors.Green, Colors.Blue, Colors.Orange])
    expect(screen.getByRole('button', { name: /submit guess/i })).toBeDisabled()
    expect(screen.queryByLabelText(/feedback row 1/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: new RegExp(`choose ${Colors.Red}`, 'i') }))
    expect(screen.getByRole('button', { name: /submit guess/i })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: /submit guess/i }))
    expect(screen.getByLabelText(/feedback row 1: black white white/i)).toBeVisible()
  })

  test('a winning guess shows the win dialog and prevents additional guesses', async () => {
    const user = userEvent.setup()
    render(<MastermindApp codeGenerator={() => ANSWER} />)

    await user.click(screen.getByRole('button', { name: /start game/i }))
    await chooseGuess(ANSWER)
    await user.click(screen.getByRole('button', { name: /submit guess/i }))

    const dialog = screen.getByRole('dialog', { name: /you win!/i })
    expect(dialog).toBeVisible()
    expect(within(dialog).getByRole('button', { name: /play again/i })).toBeVisible()
    expect(within(dialog).getByRole('button', { name: /go home/i })).toBeVisible()
    expect(screen.getByRole('button', { name: new RegExp(`choose ${Colors.Red}`, 'i') })).toBeDisabled()
  })

  test('play again clears the previous board and starts another local game', async () => {
    const user = userEvent.setup()
    render(<MastermindApp codeGenerator={() => ANSWER} />)

    await user.click(screen.getByRole('button', { name: /start game/i }))
    await chooseGuess(ANSWER)
    await user.click(screen.getByRole('button', { name: /submit guess/i }))
    await user.click(screen.getByRole('button', { name: /play again/i }))

    expect(screen.queryByRole('dialog', { name: /you win!/i })).not.toBeInTheDocument()
    expect(screen.queryAllByTestId('guess-slot-filled')).toHaveLength(0)
    expect(screen.getByRole('grid', { name: /mastermind board/i })).toBeVisible()
  })

  test('go home returns to the opening screen after a win', async () => {
    const user = userEvent.setup()
    render(<MastermindApp codeGenerator={() => ANSWER} />)

    await user.click(screen.getByRole('button', { name: /start game/i }))
    await chooseGuess(ANSWER)
    await user.click(screen.getByRole('button', { name: /submit guess/i }))
    await user.click(screen.getByRole('button', { name: /go home/i }))

    expect(screen.getByRole('button', { name: /start game/i })).toBeVisible()
    expect(screen.queryByRole('grid', { name: /mastermind board/i })).not.toBeInTheDocument()
  })

  test('after ten non-winning guesses, the game is over and input is disabled', async () => {
    const user = userEvent.setup()
    render(<MastermindApp codeGenerator={() => [Colors.Blue, Colors.Blue, Colors.Blue, Colors.Blue]} />)

    await user.click(screen.getByRole('button', { name: /start game/i }))
    for (let turn = 0; turn < 10; turn += 1) {
      await chooseGuess(WRONG_GUESS)
      await user.click(screen.getByRole('button', { name: /submit guess/i }))
    }

    expect(screen.getByText(/game over/i)).toBeVisible()
    expect(screen.getByRole('button', { name: new RegExp(`choose ${Colors.Red}`, 'i') })).toBeDisabled()
    expect(screen.getByRole('button', { name: /submit guess/i })).toBeDisabled()
  })

  test('playing the app does not make network requests or persist to browser storage', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem')
    const user = userEvent.setup()
    render(<MastermindApp codeGenerator={() => ANSWER} />)

    await user.click(screen.getByRole('button', { name: /start game/i }))
    await chooseGuess(ANSWER)
    await user.click(screen.getByRole('button', { name: /submit guess/i }))

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(storageSpy).not.toHaveBeenCalled()
  })
})