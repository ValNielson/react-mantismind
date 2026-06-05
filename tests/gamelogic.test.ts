import { describe, expect, test } from 'vitest'

import { Colors } from  "app/constants.ts"
import { Guess } from "app/types.ts"
import { checkWinCondition, isValidGuess } from "app/gameLogic.ts"


describe('Win/Lose Condition Tests', () => {
  beforeEach(() => {
    const answer: Guess = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    const guess: Guess = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    const guessHistory: Guess[] = [answer, guess, guess]
  })

  // win conditions tests
  test('When a user submits a guess the game validates correctly if it is a winning guess', () => {
    expect(checkWinCondition(guess, answer)).toEqual(true)
  })

  // add test to check game loses after 10 guesses --> if total guess history is 10 + all incorrect
  test('When the user has submitted 10 incorrect guesses, game loses', () => {
    //todo might have to mock guessHistory
    expect(usedAllGuesses()).toEqual(false)
    guessHistory.push(guess, guess, guess, guess, guess, guess, guess)
    expect(usedAllGuesses()).toEqual(true)
  })
})

describe('Guess/Submission Validation', () => {
  beforeEach(() => {
    const answer: Guess = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    const guess: Guess = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    const guessHistory: Guess[] = [answer, guess, guess]
  })

  // add test for making sure that guess is 4 colors can't guess more or less than 4
  // test it throws error if guess is more or less than 5 colors
  test('When a user submits a guess it must be exactly 4 colors', () => {
    let wrongGuess: Guess = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange, Colors.Orange]
    expect(isValidGuess(wrongGuess)).toEqual(false)
    wrongGuess = [Colors.Green, Colors.Orange, Colors.Blue]
    expect(isValidGuess(wrongGuess)).toEqual(false)
    expect(isValidGuess(guess)).toEqual(true)
  })

  // make sure current guesses don't overwrite past guesses (guessHistory)
  // dataset grows with each guess
  test('When a user submits a guess, it does not overwrite guessHistory', () => {
    //todo might have to mock guessHistory
    let newGuess: Guess = [Colors.Red, Colors.Red, Colors.Red, Colors.Red]
    updateGuessHistory(newGuess)
    expect(useGameState().gameHistory[0]).toEqual(answer)
    expect(useGameState().gameHistory[1]).toEqual(guess)
    expect(useGameState().gameHistory[2]).toEqual(guess)
    expect(useGameState().gameHistory[3]).toEqual(newGuess)
  })
})


//MAYA when they click a color button, the guess correctly inputs to currentGuess/is modified accordingly
test('', () => {})

//MAYA delete function removes last guess in guess list
test('When the ', () => {})

//DYLAN If delete when guess length is 0, throw error


describe('Feedback', () => {
  beforeEach(() => {
  })
  //VAL make sure feedback for each pip is correct --> black & white accordingly
    // likely more than 1 test
    // no feedback for wrong color/place
    // make sure feedback doesn't duplicate pips (i.e. black then white pip for 1 color)
    // make sure feedback is out of order
  test('', () => {})

})


//BO make sure the user cannot edit past guesses

//BO user cannot guess during an active process, pips are locked while feedback is generated

//AUTUMN game state reset on start

//SYDNEY Submit function kicks off feedback generation

//SYDNEY Game state resets on (re)start
  // correct answer is randomized
  // Ensure that the answer is created on game start

//AUTUMN A submission cannot contain invalid colors


/* Not game logic (UI) */
// start game modal, end game model, help modal are initialized in the DOM
// Can navigate to page routes
// no info is given away in the URL slug or in the code inspector
// Enable submit only when guess length is 4
// Delete button --> when user clicks, last guess is removed
// Delete button disabled when guess length is 0
// can't continue guessing in win/loss/end game state