'use client'

import { useGameState } from './useGameState'
import { GameBoard } from './components/GameBoard'
import { ColorPicker } from './components/ColorPicker'
import { EndDialog } from './components/EndDialog'

export default function Home() {
  const {
    gameState,
    handleStartGame,
    handleSelectColor,
    handleDeleteSelection,
    handleSubmitGuess,
    handlePlayAgain,
    handleGoHome,
  } = useGameState()

  if (!gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">Mastermind</h1>
        <p className="text-gray-400 mb-10 text-lg">Crack the 4-color code in 10 tries</p>
        <button
          onClick={handleStartGame}
          className="px-8 py-4 bg-indigo-600 text-white text-xl font-semibold rounded-xl hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-lg"
        >
          Start Game
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-6 tracking-wide">Mastermind</h1>

      <GameBoard
        guesses={gameState.guesses}
        currentGuess={gameState.currentGuess}
        gameStatus={gameState.status}
      />

      {gameState.status === 'playing' && (
        <ColorPicker
          currentGuess={gameState.currentGuess}
          onSelectColor={handleSelectColor}
          onDelete={handleDeleteSelection}
          onSubmit={handleSubmitGuess}
        />
      )}

      {(gameState.status === 'won' || gameState.status === 'lost') && (
        <EndDialog
          status={gameState.status}
          secretCode={gameState.secretCode}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  )
}
