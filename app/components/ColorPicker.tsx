'use client'

import { Colors, CODE_LENGTH } from '../constants'
import { ColorDot } from './ColorDot'

const ALL_COLORS = Object.values(Colors)

interface ColorPickerProps {
  currentGuess: Colors[]
  onSelectColor: (color: Colors) => void
  onDelete: () => void
  onSubmit: () => void
}

export function ColorPicker({ currentGuess, onSelectColor, onDelete, onSubmit }: ColorPickerProps) {
  const isFull = currentGuess.length === CODE_LENGTH
  const canDelete = currentGuess.length > 0

  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      <div className="flex gap-3">
        {ALL_COLORS.map(color => (
          <ColorDot
            key={color}
            color={color}
            size="lg"
            onClick={isFull ? undefined : () => onSelectColor(color)}
          />
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onDelete}
          disabled={!canDelete}
          className="px-5 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-40 hover:bg-gray-600 active:bg-gray-800 transition-colors"
        >
          Undo
        </button>
        <button
          onClick={onSubmit}
          disabled={!isFull}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-40 hover:bg-indigo-500 active:bg-indigo-700 transition-colors font-semibold"
        >
          Submit
        </button>
      </div>
    </div>
  )
}
