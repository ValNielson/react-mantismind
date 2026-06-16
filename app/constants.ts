// The six code colors used in the game. Per the spec, none of these is
// black or white — those are reserved for the feedback pips.
export enum Colors {
  Red = 'red',
  Orange = 'orange',
  Yellow = 'yellow',
  Green = 'green',
  Blue = 'blue',
  Purple = 'purple',
}

// All selectable colors, in display order.
export const ALL_COLORS: Colors[] = [
  Colors.Red,
  Colors.Orange,
  Colors.Yellow,
  Colors.Green,
  Colors.Blue,
  Colors.Purple,
]

// A code (and each guess) is a sequence of 4 colors.
export const CODE_LENGTH = 4

// The player gets 10 guesses before the game is over.
export const MAX_GUESSES = 10

// Feedback pip colors.
export enum Pip {
  Black = 'black', // correct color in the correct spot
  White = 'white', // correct color in the wrong spot
}
