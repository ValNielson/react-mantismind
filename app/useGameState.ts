'use client'

import { useState } from 'react'
import { Colors } from './constants'
import {
  GameState,
  createInitialState,
  addColor,
  undoColor,
  submitGuess,
  startNewGame,
} from './gameState'

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null)

  function handleStartGame() {
    setGameState(createInitialState())
  }

  function handleSelectColor(color: Colors) {
    setGameState(prev => (prev ? addColor(prev, color) : prev))
  }

  function handleDeleteSelection() {
    setGameState(prev => (prev ? undoColor(prev) : prev))
  }

  function handleSubmitGuess() {
    setGameState(prev => (prev ? submitGuess(prev) : prev))
  }

  function handlePlayAgain() {
    setGameState(prev => (prev ? startNewGame(prev) : prev))
  }

  function handleGoHome() {
    setGameState(null)
  }

  return {
    gameState,
    handleStartGame,
    handleSelectColor,
    handleDeleteSelection,
    handleSubmitGuess,
    handlePlayAgain,
    handleGoHome,
  }
}
