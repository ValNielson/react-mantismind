'use client'

import { Colors } from '../constants'
import type { Guess, Feedback } from '../types'
import { useGame } from '../useGame'

const COLOR_STYLES: Record<number, string> = {
  [Colors.Red]: 'bg-red-500',
  [Colors.Blue]: 'bg-blue-500',
  [Colors.Green]: 'bg-green-500',
  [Colors.Orange]: 'bg-orange-500',
  [Colors.Yellow]: 'bg-yellow-400',
  [Colors.Purple]: 'bg-purple-500',
}

const COLOR_NAMES: Record<number, string> = {
  [Colors.Red]: 'Red',
  [Colors.Blue]: 'Blue',
  [Colors.Green]: 'Green',
  [Colors.Orange]: 'Orange',
  [Colors.Yellow]: 'Yellow',
  [Colors.Purple]: 'Purple',
}

function Peg({ color }: { color?: Colors }) {
  if (color === undefined) {
    return <div className="w-10 h-10 rounded-full bg-zinc-700 border-2 border-zinc-600" />
  }
  return <div className={`w-10 h-10 rounded-full ${COLOR_STYLES[color]} border-2 border-white/20`} />
}

function FeedbackPips({ feedback }: { feedback?: Feedback }) {
  const pips = []
  if (feedback) {
    for (let i = 0; i < feedback.black; i++) pips.push('black')
    for (let i = 0; i < feedback.white; i++) pips.push('white')
  }
  while (pips.length < 4) pips.push('empty')

  return (
    <div className="grid grid-cols-2 gap-1 ml-4">
      {pips.map((pip, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full ${
            pip === 'black'
              ? 'bg-zinc-900 border border-zinc-400'
              : pip === 'white'
                ? 'bg-white border border-zinc-400'
                : 'bg-zinc-700 border border-zinc-600'
          }`}
        />
      ))}
    </div>
  )
}

function GuessRow({
  guess,
  feedback,
  isActive,
}: {
  guess?: Guess
  feedback?: Feedback
  isActive?: boolean
}) {
  const slots = []
  for (let i = 0; i < 4; i++) {
    slots.push(guess?.[i])
  }

  return (
    <div
      className={`flex items-center py-2 px-3 rounded-lg ${
        isActive ? 'bg-zinc-700/50 ring-2 ring-amber-400/50' : ''
      }`}
    >
      <div className="flex gap-2">
        {slots.map((color, i) => (
          <Peg key={i} color={color} />
        ))}
      </div>
      <FeedbackPips feedback={feedback} />
    </div>
  )
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-5xl font-bold tracking-tight">Mastermind</h1>
      <p className="text-zinc-400 text-lg max-w-md text-center">
        Crack the secret code. You have 10 guesses to figure out the 4-color
        sequence.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg text-lg transition-colors"
      >
        Start Game
      </button>
    </div>
  )
}

function GameDialog({
  title,
  answer,
  onPlayAgain,
  onGoHome,
}: {
  title: string
  answer: Guess
  onPlayAgain: () => void
  onGoHome: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl border border-zinc-700 max-w-sm mx-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <div>
          <p className="text-zinc-400 text-sm mb-2 text-center">The code was:</p>
          <div className="flex gap-2 justify-center">
            {answer.map((color, i) => (
              <Peg key={i} color={color} />
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onGoHome}
            className="px-6 py-2 bg-zinc-600 hover:bg-zinc-500 text-white font-semibold rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Game() {
  const {
    screen,
    gameHistory,
    feedbackHistory,
    currentGuess,
    answer,
    validColors,
    startGame,
    goHome,
    addColor,
    removeColor,
    submitGuess,
  } = useGame()

  if (screen === 'start') {
    return <StartScreen onStart={startGame} />
  }

  const activeRow = gameHistory.length
  const isGameOver = screen === 'won' || screen === 'lost'

  return (
    <div className="flex flex-col items-center min-h-screen py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 tracking-tight">Mastermind</h1>

      <div className="flex flex-col gap-1 mb-8">
        {Array.from({ length: 10 }, (_, rowIndex) => {
          const guess = gameHistory[rowIndex]
          const feedback = feedbackHistory[rowIndex]
          const isActive = rowIndex === activeRow && !isGameOver

          return (
            <GuessRow
              key={rowIndex}
              guess={isActive ? currentGuess : guess}
              feedback={feedback}
              isActive={isActive}
            />
          )
        })}
      </div>

      {!isGameOver && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3">
            {validColors.map((color) => (
              <button
                key={color}
                onClick={() => addColor(color)}
                className={`w-12 h-12 rounded-full ${COLOR_STYLES[color]} border-2 border-white/30 hover:scale-110 hover:border-white/60 transition-all active:scale-95`}
                aria-label={`Select ${COLOR_NAMES[color]}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={removeColor}
              disabled={currentGuess.length === 0}
              className="px-5 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              Undo
            </button>
            <button
              onClick={submitGuess}
              disabled={currentGuess.length !== 4}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-900 font-semibold rounded-lg transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {screen === 'won' && (
        <GameDialog
          title="You Win!"
          answer={answer}
          onPlayAgain={startGame}
          onGoHome={goHome}
        />
      )}
      {screen === 'lost' && (
        <GameDialog
          title="Game Over"
          answer={answer}
          onPlayAgain={startGame}
          onGoHome={goHome}
        />
      )}
    </div>
  )
}
