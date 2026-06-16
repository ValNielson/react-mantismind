'use client'

import { useState } from 'react'

import { Colors, Pip, CODE_LENGTH, MAX_GUESSES } from './constants'
import { useGameState } from './gameLogic'
import type { Feedback, Guess } from './types'

// Display color for each guessable peg.
const COLOR_HEX: Record<Colors, string> = {
  [Colors.Red]: '#ef4444',
  [Colors.Orange]: '#f97316',
  [Colors.Yellow]: '#eab308',
  [Colors.Green]: '#22c55e',
  [Colors.Blue]: '#3b82f6',
  [Colors.Purple]: '#a855f7',
}

const PALETTE = Object.values(Colors)

function Peg({ color, size = 40 }: { color?: Colors; size?: number }) {
  return (
    <span
      className="inline-block rounded-full border border-black/20"
      style={{
        width: size,
        height: size,
        backgroundColor: color ? COLOR_HEX[color] : 'transparent',
        boxShadow: color ? 'inset 0 -3px 6px rgba(0,0,0,0.25)' : undefined,
        borderStyle: color ? 'solid' : 'dashed',
      }}
      aria-label={color ?? 'empty'}
    />
  )
}

// The 2x2 grid of black/white feedback pips beside a guess row.
function Pips({ feedback }: { feedback: Feedback }) {
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-1">
      {Array.from({ length: CODE_LENGTH }).map((_, i) => {
        const pip = feedback[i]
        return (
          <span
            key={i}
            className="h-3 w-3 rounded-full border border-zinc-400"
            style={{
              backgroundColor:
                pip === Pip.Black
                  ? '#000'
                  : pip === Pip.White
                    ? '#fff'
                    : 'transparent',
            }}
          />
        )
      })}
    </div>
  )
}

function GuessRow({ guess, feedback }: { guess: Guess; feedback: Feedback }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-2">
        {Array.from({ length: CODE_LENGTH }).map((_, i) => (
          <Peg key={i} color={guess[i]} />
        ))}
      </div>
      <Pips feedback={feedback} />
    </div>
  )
}

export default function Home() {
  const [started, setStarted] = useState(false)
  const { state, pickColor, undo, submit, playAgain } = useGameState()

  // Opening screen with a single "Start Game" button.
  if (!started) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 dark:bg-black">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Mastermind
        </h1>
        <p className="max-w-sm text-center text-zinc-600 dark:text-zinc-400">
          Crack the secret code of {CODE_LENGTH} colors in {MAX_GUESSES} guesses
          or fewer.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="rounded-full bg-zinc-900 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300"
        >
          Start Game
        </button>
      </main>
    )
  }

  const { guesses, currentGuess, status } = state
  const gameOver = status !== 'playing'
  const canSubmit = currentGuess.length === CODE_LENGTH && !gameOver

  // Rows still available after those already submitted (and the active row).
  const emptyRows = Math.max(
    0,
    MAX_GUESSES - guesses.length - (gameOver ? 0 : 1),
  )

  function goHome() {
    playAgain()
    setStarted(false)
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-8 bg-zinc-50 py-12 dark:bg-black">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Mastermind
      </h1>

      {/* Board: up to 10 rows of 4 pegs, newest guess at the bottom. */}
      <div className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
        {guesses.map((g, i) => (
          <GuessRow key={i} guess={g.guess} feedback={g.feedback} />
        ))}

        {/* The active guess being assembled. */}
        {!gameOver && <GuessRow guess={currentGuess} feedback={[]} />}

        {/* Remaining empty rows. */}
        {Array.from({ length: emptyRows }).map((_, i) => (
          <GuessRow key={`empty-${i}`} guess={[]} feedback={[]} />
        ))}
      </div>

      {/* Color palette and controls. */}
      {!gameOver && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3">
            {PALETTE.map((color) => (
              <button
                key={color}
                onClick={() => pickColor(color)}
                disabled={currentGuess.length >= CODE_LENGTH}
                className="transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`pick ${color}`}
              >
                <Peg color={color} size={44} />
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={undo}
              disabled={currentGuess.length === 0}
              className="rounded-full border border-zinc-400 px-6 py-2 font-medium text-zinc-800 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Undo
            </button>
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="rounded-full bg-zinc-900 px-6 py-2 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300"
            >
              Submit Guess
            </button>
          </div>
        </div>
      )}

      {/* End-of-game dialog. */}
      {gameOver && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/50"
        >
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-10 shadow-xl dark:bg-zinc-900">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {status === 'won' ? 'You win!' : 'Game over'}
            </h2>
            {status === 'lost' && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-zinc-600 dark:text-zinc-400">
                  The code was:
                </p>
                <div className="flex gap-2">
                  {state.secretCode.map((color, i) => (
                    <Peg key={i} color={color} size={32} />
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={playAgain}
                className="rounded-full bg-zinc-900 px-6 py-2 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300"
              >
                Play Again
              </button>
              <button
                onClick={goHome}
                className="rounded-full border border-zinc-400 px-6 py-2 font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
