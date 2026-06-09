import { beforeEach, describe, expect, test } from 'vitest'

import { Colors, InProgress } from  "app/constants.ts"
import { Guess } from "app/types.ts"
import { checkWinCondition, isValidGuess, updateGuessHistory, deleteSelection, selectColor, getFeedback, startGame, submitGuess, usedAllGuesses, useGameState } from "app/gameLogic.ts"

describe('Win/Lose Condition Tests', () => {
  let guess: Guess, answer: Guess, guessHistory: Guess[];

  beforeEach(() => {
    answer = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    guess = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    guessHistory = [answer, guess, guess]
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

describe('Guess Construction', () => {
  let guess: Guess, answer: Guess, guessHistory: Guess[];

  beforeEach(() => {
    answer = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    guess = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
    guessHistory = [answer, guess, guess]
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

  //MAYA when they click a color button, the guess correctly inputs to currentGuess/is modified accordingly
  test('', () => {
    let newGuess: Guess = [Colors.Red]
    selectColor(newGuess)
    expect(newGuess[0]).toEqual(Colors.Green)
    expect(newGuess[1]).toEqual(Colors.Red)
    expect(newGuess.length).toEqual(2)
    selectColor(newGuess)
    expect(newGuess[0]).toEqual(Colors.Green)
    expect(newGuess[1]).toEqual(Colors.Red)
    expect(newGuess[2]).toEqual(Colors.Red)
    expect(newGuess.length).toEqual(3)
  })

  //MAYA delete function removes last selected color in guess
  test('When a user chooses delete the last selected color in the current guess is removed', () => {
      deleteSelection(guess)
      expect(guess[0]).toEqual(Colors.Green)
      expect(guess[1]).toEqual(Colors.Orange)
      expect(guess[2]).toEqual(Colors.Blue)
      expect(guess.length).toEqual(3)
      deleteSelection(guess)
      expect(guess[0]).toEqual(Colors.Green)
      expect(guess[1]).toEqual(Colors.Orange)
      expect(guess.length).toEqual(2)
      deleteSelection(guess)
      expect(guess[0]).toEqual(Colors.Green)
      expect(guess.length).toEqual(1)
      selectColor(guess, Colors.Red)
      expect(guess[0]).toEqual(Colors.Green)
      expect(guess[1]).toEqual(Colors.Red)
      expect(guess.length).toEqual(2)
      deleteSelection(guess)
      expect(guess[0]).toEqual(Colors.Green)
      expect(guess.length).toEqual(1)
      deleteSelection(guess)
      expect(guess.length).toEqual(0)
  })

  //DYLAN If delete when guess length is 0, no-op
  test('When a user tries to delete a selected color but there are no selected colors, nothing breaks', () => {
    const emptyGuess: Guess = []
    expect(deleteSelection(emptyGuess)).not.toThrow()
    expect(emptyGuess.length).toEqual(0)
  })

})

describe('Feedback', () => {
  // Uses GetFeedback which is assumed to be an object setup like { black: number, white: number },
  // could also be an array but i thought this shape would be easier for keeping things out of order
  // and general testing and implementation :)
  let answer: Guess 
  beforeEach(() => {
    answer = [Colors.Red, Colors.Blue, Colors.Green, Colors.Orange]
  })
  //VAL make sure feedback for each pip is correct --> black & white accordingly
  test('A color in the correct position earns a black pip', () => {
    const guess: Guess = [Colors.Red, Colors.Yellow, Colors.Yellow, Colors.Yellow]
    expect(getFeedback(guess, answer)).toEqual({ black: 1, white: 0 })
  })
  //VAL make sure feedback for each pip is correct --> black & white accordingly
  test('A color present in the answer but in the wrong position earns a white pip', () => {
    const guess: Guess = [Colors.Yellow, Colors.Red, Colors.Yellow, Colors.Yellow]
    expect(getFeedback(guess, answer)).toEqual({ black: 0, white: 1 })
  })
  // VAL no feedback for wrong color/place
  test('A color not present in the answer earns no pip', () => {
    const guess: Guess = [Colors.Yellow, Colors.Yellow, Colors.Yellow, Colors.Yellow]
    expect(getFeedback(guess, answer)).toEqual({ black: 0, white: 0 })
  })
  // VAL make sure feedback doesn't duplicate pips (i.e. black then white pip for 1 color)
  test('A peg that earns a black pip does not also earn a white pip', () => {
    const guess: Guess = [Colors.Red, Colors.Yellow, Colors.Yellow, Colors.Yellow]
    const feedback = getFeedback(guess, answer)
    expect(feedback.black).toEqual(1)
    expect(feedback.white).toEqual(0)
    expect(feedback.black + feedback.white).toEqual(1)
  })
  // VAL make sure that feedback gives one pip for mutiple of a color
  test('A repeated color in the guess does not earn more pips', () => {
    const guess: Guess = [Colors.Red, Colors.Red, Colors.Yellow, Colors.Yellow]
    const feedback = getFeedback(guess, answer)
    expect(feedback.black + feedback.white).toEqual(1)
  })
    // VAL make sure feedback is out of order
  test('Feedback pips are not ordered to reveal which position was correct', () => {
    const guessA: Guess = [Colors.Red,    Colors.Yellow, Colors.Yellow, Colors.Yellow]
    const guessB: Guess = [Colors.Yellow, Colors.Yellow, Colors.Green,  Colors.Yellow]
    expect(getFeedback(guessA, answer)).toEqual(getFeedback(guessB, answer))
    expect(getFeedback(guessA, answer)).toEqual({ black: 1, white: 0 })
  })
})


//BO make sure the user cannot edit past guesses
describe('Unable to edit game state', () => {
  const guessA: Guess = [Colors.Blue, Colors.Yellow, Colors.Blue, Colors.Green]
  const guessB: Guess = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange]
  const guessHistory: Guess[] = [guessA, guessB]

  test('cannot re-set a guess', () => {
    // setGuess(guessHistory[1], guessA); assuming there will be a setter method with a global iterator?? so that we cannot pass in the index we want to 
    updateGuessHistory(1, guessA); //global index management, not ideal but how would we set that we are trying to update a past guess otherwise?
    guessHistory[1] = guessA; //try to hard code changing guess history -- this should be not allowed
    expect(guessHistory[1].toEqual(guessB));
  });
});

//BO user cannot guess during an active process, pips are locked while feedback is generated
//boolean state management ?? otherwise it'd be a cypress test
describe('Unable to edit game state during an active process', () => {
  const guessA: Guess = [Colors.Blue, Colors.Yellow, Colors.Blue, Colors.Green];
  const guessB: Guess = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange];
  const guessHistory: Guess[] = [guessA, guessB];
  const inProgress: InProgress = false; //bool - table for meeting, not scalable, but for our proj, does it need to be??

  // OPEN Q: IF WE KNOW OUR APP WONT SCALE, DOES IT NEED TO BE SCALABLE?

  test('cannot update a guess while InProgress is true', () => {
    useGameState().inProgress = true;
    let guessAttempt = updateGuessHistory(guessA); //this would prob throw if inprogress is true
    expect(guessAttempt).toThrow(); 
  });
});

//AUTUMN game state reset on start
describe("Game state is initialized correctly", () => {
  const gameState = useGameState();

  test("Guess history initiliazes as empty", () => {
    expect(gameState.gameHistory).toHaveLength(0);
  });

  // NOTE: this could be an implementation detail. Is a guess object a fixed-sized array that is pre-filled with undefined/null
  // or is a guess object an empty array. Are we allowed to work on a guess out of order?
  test("Current guess is initialized as empty", () => {
    expect(gameState.currentGuess).toHaveLength(0);
  });

  test("Number of guesses the player makes is initialized to 0", () => {
    expect(gameState.guessCount).toEqual(0);
  });
});

//SYDNEY Submit function kicks off feedback generation
describe('Submit function kicks off feedback generation', () => {
  let guess: Guess;

  beforeEach(() => {
    const guess = [Colors.Green, Colors.Orange, Colors.Blue, Colors.Orange];
    useGameState().inProgress = false;
  });

  test('When a user submits a guess, inProgress is set to true while feedback is generated', () => {
    submitGuess(guess);
    expect(useGameState().inProgress).toEqual(true);
  });
});

//SYDNEY Game state resets on (re)start
describe('Game state resets on (re)start', () => {
  beforeEach(() => {
    useGameState().guessCount = 5;
    useGameState().currentGuess = [Colors.Red, Colors.Blue, Colors.Green, Colors.Orange];
    useGameState().gameHistory = [[Colors.Red, Colors.Red, Colors.Red, Colors.Red]];
  });

  // correct answer is randomized
  test('Correct answer is randomized on game start', () => {
    const firstAnswer = startGame();
    const secondAnswer = startGame();
    expect(firstAnswer).not.toEqual(secondAnswer);
  });

  // Ensure that the answer is created on game start
  test('Answer is created on game start', () => {
    startGame();
    expect(useGameState().answer).toHaveLength(4);
  });
});

//AUTUMN A submission cannot contain invalid colors
describe("A submission cannot contain invalid colors", () => {
  test("A submission cannot have white pegs", () => {
    expect(isValidGuess([Colors.Red, Colors.Blue, Colors.Green, Colors.White])).toEqual(false);
  });

  test("A submission with valid color options should be correct", () => {
    expect(isValidGuess([Colors.Orange, Colors.Orange, Colors.Orange, Colors.Orange])).toEqual(true);
  });

  test("A submission cannot have black pegs", () => {
    expect(isValidGuess([Colors.Orange, Colors.Orange, Colors.Black, Colors.Red])).toEqual(false);
  });

  test("A submission cannot contain null or undefined elements", () => {
    expect(isValidGuess([Colors.Orange, Colors.Orange, null, Colors.Red])).toEqual(false);
    expect(isValidGuess([Colors.Orange, Colors.Orange, undefined, Colors.Red])).toEqual(false);
  });

  test("A submission cannot contain non-Color elements", () => {
    expect(isValidGuess([Colors.Orange, Colors.Red, Colors.Blue, 6])).toEqual(false);
    expect(isValidGuess([Colors.Orange, Colors.Red, Colors.Blue, "orange"])).toEqual(false);
  });
})


/* Not game logic (UI) */
// start game modal, end game model, help modal are initialized in the DOM
// Can navigate to page routes
// no info is given away in the URL slug or in the code inspector
// Enable submit only when guess length is 4
// Disable submit button when feedback is being processed
// Delete button --> when user clicks, last guess is removed
// Delete button disabled when guess length is 0
// can't continue guessing in win/loss/end game state