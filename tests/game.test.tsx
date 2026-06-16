import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Colors, MAX_GUESSES } from 'app/constants.ts'
import Game from 'app/Game.tsx'

const CODE: Colors[] = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]

// helpers
const start = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /start game/i }))

const addColor = async (
  user: ReturnType<typeof userEvent.setup>,
  color: Colors,
) => user.click(screen.getByRole('button', { name: new RegExp(`add ${color}`, 'i') }))

const submit = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /submit/i }))

const undo = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /undo/i }))

const filledColors = () =>
  screen.getAllByTestId('filled-peg').map((el) => el.getAttribute('data-color'))

const enterGuess = async (
  user: ReturnType<typeof userEvent.setup>,
  guess: Colors[],
) => {
  for (const c of guess) await addColor(user, c)
  await submit(user)
}

const LOSING_GUESS: Colors[] = [Colors.Red, Colors.Red, Colors.Red, Colors.Red]

test('shows a Start Game button before the game begins', () => {
  render(<Game initialCode={CODE} />)
  expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument()
})

test('the board is not shown until the game starts', () => {
  render(<Game initialCode={CODE} />)
  expect(screen.queryAllByTestId('guess-row')).toHaveLength(0)
})

test('starting the game reveals a board with one row per allowed guess', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  expect(screen.getAllByTestId('guess-row')).toHaveLength(MAX_GUESSES)
})

test('clicking a color adds it as a filled peg in the current guess', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  await addColor(user, Colors.Red)
  expect(filledColors()).toEqual([Colors.Red])
})

test('colors fill the current guess in the order they are clicked', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  await addColor(user, Colors.Red)
  await addColor(user, Colors.Blue)
  expect(filledColors()).toEqual([Colors.Red, Colors.Blue])
})

test('undo removes only the most recently added color', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  await addColor(user, Colors.Red)
  await addColor(user, Colors.Blue)
  await undo(user)
  expect(filledColors()).toEqual([Colors.Red])
})

test('undo on an empty guess does nothing', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  await undo(user)
  expect(screen.queryAllByTestId('filled-peg')).toHaveLength(0)
})

test('a guess cannot hold more than four colors', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  for (const c of [Colors.Red, Colors.Blue, Colors.Green, Colors.Yellow, Colors.Purple]) {
    await addColor(user, c)
  }
  expect(filledColors()).toHaveLength(4)
})

test('submit is disabled until the guess has four colors', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  await addColor(user, Colors.Red)
  await addColor(user, Colors.Blue)
  expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
})

test('submitting a full guess clears the in-progress guess', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  await enterGuess(user, LOSING_GUESS)
  expect(screen.queryAllByTestId('filled-peg')).toHaveLength(0)
})

test('a submitted guess is locked into its row', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  await enterGuess(user, LOSING_GUESS)
  const firstRow = screen.getAllByTestId('guess-row')[0]
  const pegs = firstRow.querySelectorAll('[data-testid="guess-peg"]')
  expect([...pegs].map((p) => p.getAttribute('data-color'))).toEqual(LOSING_GUESS)
})

test('submitting a guess reveals feedback pips for that row', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  // One exact match (Green in spot 0); nothing else matches => one black pip.
  await enterGuess(user, [Colors.Green, Colors.Red, Colors.Red, Colors.Red])
  expect(screen.getAllByTestId('black-pip')).toHaveLength(1)
  expect(screen.queryAllByTestId('white-pip')).toHaveLength(0)
})

test('guessing the secret code shows the "You win!" dialog', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  await enterGuess(user, CODE)
  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveTextContent(/you win/i)
})

test('no further guessing is possible after winning', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  await enterGuess(user, CODE)
  expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
})

test('using all guesses without winning ends the game', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  for (let i = 0; i < MAX_GUESSES; i++) {
    await enterGuess(user, LOSING_GUESS)
  }
  expect(screen.getByRole('dialog')).toHaveTextContent(/game over/i)
})

test('Play Again resets to a fresh, empty board', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  await enterGuess(user, CODE)
  await user.click(screen.getByRole('button', { name: /play again/i }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getAllByTestId('guess-row')).toHaveLength(MAX_GUESSES)
  expect(screen.queryAllByTestId('guess-peg')).toHaveLength(0)
})

test('Go Home returns to the start screen', async () => {
  const user = userEvent.setup()
  render(<Game initialCode={CODE} />)
  await start(user)
  await enterGuess(user, CODE)
  await user.click(screen.getByRole('button', { name: /go home/i }))
  expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument()
  expect(screen.queryAllByTestId('guess-row')).toHaveLength(0)
})
