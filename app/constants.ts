// Core game constants for Mastermind.

// The six guessable colors. Per the rules, black and white are reserved for
// feedback pips and are therefore deliberately absent here.
export enum Colors {
  Red = 'red',
  Orange = 'orange',
  Yellow = 'yellow',
  Green = 'green',
  Blue = 'blue',
  Purple = 'purple',
}

// Feedback pegs: black for a correct color in the correct spot, white for a
// correct color in the wrong spot.
export enum Pip {
  Black = 'black',
  White = 'white',
}

// A code (and every guess) is a sequence of exactly 4 colors.
export const CODE_LENGTH = 4

// The player gets 10 guesses before the game is over.
export const MAX_GUESSES = 10

// The set of statuses a game can be in.
export type GameStatus = 'playing' | 'won' | 'lost'

// Convenience constant for the in-progress status.
export const InProgress: GameStatus = 'playing'
