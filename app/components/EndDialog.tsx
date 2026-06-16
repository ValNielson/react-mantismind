'use client'

import { Colors } from '../constants'
import { ColorDot } from './ColorDot'

interface EndDialogProps {
  status: 'won' | 'lost'
  secretCode: Colors[]
  onPlayAgain: () => void
  onGoHome: () => void
}

export function EndDialog({ status, secretCode, onPlayAgain, onGoHome }: EndDialogProps) {
  const won = status === 'won'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-10">
      <div className="bg-gray-800 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full mx-4">
        <h2 className={`text-4xl font-bold ${won ? 'text-green-400' : 'text-red-400'}`}>
          {won ? 'You Win!' : 'Game Over'}
        </h2>

        {!won && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-400 text-sm">The answer was:</p>
            <div className="flex gap-2">
              {secretCode.map((color, i) => (
                <ColorDot key={i} color={color} size="md" />
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 w-full">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onGoHome}
            className="flex-1 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 active:bg-gray-800 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}
