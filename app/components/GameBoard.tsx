'use client'

import { Colors, Pip, MAX_GUESSES } from '../constants'
import { GuessRow } from './GuessRow'

interface GameBoardProps {
  guesses: Array<{ guess: Colors[]; feedback: Pip[] }>
  currentGuess: Colors[]
  gameStatus: 'playing' | 'won' | 'lost'
}

export function GameBoard({ guesses, currentGuess, gameStatus }: GameBoardProps) {
  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    const isSubmitted = i < guesses.length
    const isActive = i === guesses.length && gameStatus === 'playing'

    return {
      guess: isSubmitted ? guesses[i].guess : isActive ? currentGuess : [],
      feedback: isSubmitted ? guesses[i].feedback : undefined,
      isActive,
    }
  })

  return (
    <div className="flex flex-col gap-1 bg-gray-800 rounded-2xl p-4 shadow-xl">
      {rows.map((row, i) => (
        <GuessRow
          key={i}
          guess={row.guess}
          feedback={row.feedback}
          isActive={row.isActive}
        />
      ))}
    </div>
  )
}
