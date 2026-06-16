'use client'

import { useState } from 'react'

import {
  ALL_COLORS,
  CODE_LENGTH,
  Colors,
  MAX_GUESSES,
  Pip,
} from 'app/constants.ts'
import {
  checkWinCondition,
  generateCode,
  getFeedback,
  isValidGuess,
} from 'app/gameLogic.ts'

interface SubmittedGuess {
  guess: Colors[]
  feedback: Pip[]
}

export default function Game({ initialCode }: { initialCode?: Colors[] }) {
  const [phase, setPhase] = useState<'home' | 'playing'>('home')
  const [code, setCode] = useState<Colors[]>(() => initialCode ?? generateCode())
  const [guesses, setGuesses] = useState<SubmittedGuess[]>([])
  const [current, setCurrent] = useState<Colors[]>([])

  const won = guesses.some((g) => checkWinCondition(g.guess, code))
  const lost = !won && guesses.length >= MAX_GUESSES
  const gameOver = won || lost
  const activeRow = guesses.length

  const newGame = () => {
    setCode(initialCode ?? generateCode())
    setGuesses([])
    setCurrent([])
  }

  const startGame = () => {
    newGame()
    setPhase('playing')
  }

  const playAgain = () => {
    newGame()
  }

  const goHome = () => {
    newGame()
    setPhase('home')
  }

  const addColor = (color: Colors) => {
    if (gameOver) return
    setCurrent((prev) => (prev.length >= CODE_LENGTH ? prev : [...prev, color]))
  }

  const undo = () => setCurrent((prev) => prev.slice(0, -1))

  const submitGuess = () => {
    if (!isValidGuess(current) || gameOver) return
    setGuesses((prev) => [
      ...prev,
      { guess: current, feedback: getFeedback(current, code) },
    ])
    setCurrent([])
  }

  if (phase === 'home') {
    return (
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold tracking-tight">Mastermind</h1>
        <p className="text-zinc-500">
          Crack the secret code in {MAX_GUESSES} guesses.
        </p>
        <button
          onClick={startGame}
          className="rounded-full bg-zinc-900 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
        >
          Start Game
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Mastermind</h1>

      <div className="flex flex-col gap-2">
        {Array.from({ length: MAX_GUESSES }).map((_, row) => {
          const submitted = guesses[row]
          const isActive = row === activeRow && !gameOver
          const pegs = isActive ? current : submitted?.guess ?? []

          return (
            <div
              key={row}
              data-testid="guess-row"
              className={`flex items-center gap-3 rounded-lg p-2 ${
                isActive ? 'bg-zinc-100 dark:bg-zinc-800' : ''
              }`}
            >
              <div className="flex gap-2">
                {Array.from({ length: CODE_LENGTH }).map((__, slot) => {
                  const color = pegs[slot]
                  if (!color) {
                    return (
                      <span
                        key={slot}
                        data-testid="empty-peg"
                        className="h-9 w-9 rounded-full border-2 border-zinc-300 dark:border-zinc-600"
                      />
                    )
                  }
                  return (
                    <span
                      key={slot}
                      data-testid={submitted ? 'guess-peg' : 'filled-peg'}
                      data-color={color}
                      className="h-9 w-9 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: color }}
                    />
                  )
                })}
              </div>

              <Pips feedback={submitted?.feedback ?? []} />
            </div>
          )
        })}
      </div>

      {!gameOver && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3">
            {ALL_COLORS.map((color) => (
              <button
                key={color}
                aria-label={`Add ${color}`}
                onClick={() => addColor(color)}
                className="h-10 w-10 rounded-full border border-black/10 shadow transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={undo}
              disabled={current.length === 0}
              className="rounded-full border border-zinc-300 px-5 py-2 font-medium disabled:opacity-40 dark:border-zinc-600"
            >
              Undo
            </button>
            <button
              onClick={submitGuess}
              disabled={!isValidGuess(current)}
              className="rounded-full bg-zinc-900 px-6 py-2 font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <EndDialog won={won} code={code} onPlayAgain={playAgain} onGoHome={goHome} />
      )}
    </div>
  )
}

function Pips({ feedback }: { feedback: Pip[] }) {
  // Pips are laid out in a 2x2 grid next to each guess.
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-1">
      {Array.from({ length: CODE_LENGTH }).map((_, i) => {
        const pip = feedback[i]
        if (pip === Pip.Black) {
          return (
            <span
              key={i}
              data-testid="black-pip"
              className="h-3 w-3 rounded-full bg-black"
            />
          )
        }
        if (pip === Pip.White) {
          return (
            <span
              key={i}
              data-testid="white-pip"
              className="h-3 w-3 rounded-full border border-zinc-400 bg-white"
            />
          )
        }
        return (
          <span
            key={i}
            className="h-3 w-3 rounded-full border border-zinc-200 dark:border-zinc-700"
          />
        )
      })}
    </div>
  )
}

function EndDialog({
  won,
  code,
  onPlayAgain,
  onGoHome,
}: {
  won: boolean
  code: Colors[]
  onPlayAgain: () => void
  onGoHome: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={won ? 'You win!' : 'Game over'}
      className="fixed inset-0 flex items-center justify-center bg-black/40"
    >
      <div className="flex flex-col items-center gap-5 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
        <h2 className="text-3xl font-bold">{won ? 'You win!' : 'Game over'}</h2>
        {!won && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-zinc-500">The code was:</p>
            <div className="flex gap-2">
              {code.map((color, i) => (
                <span
                  key={i}
                  className="h-8 w-8 rounded-full border border-black/10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="rounded-full bg-zinc-900 px-6 py-2 font-medium text-white dark:bg-white dark:text-black"
          >
            Play Again
          </button>
          <button
            onClick={onGoHome}
            className="rounded-full border border-zinc-300 px-6 py-2 font-medium dark:border-zinc-600"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}
