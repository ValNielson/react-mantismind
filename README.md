# Mastermind in React

A project building the classic code-breaking game [Mastermind](https://en.wikipedia.org/wiki/Mastermind_(board_game)) using React and Next.js. The focus is on **test-driven development (TDD)**: we write tests first, then write the code to make them pass.

---

## Project Structure

```
react-mantismind/
├── app/                  # Next.js app directory
│   ├── page.tsx          # Root page / entry point
│   ├── layout.tsx        # App shell
│   ├── globals.css       # Global styles (Tailwind)
│   ├── constants.ts      # Shared constants (Colors enum, etc.)
│   └── gameLogic.ts      # Pure game logic (win conditions, feedback, etc.)
├── tests/                # Vitest test files
│   ├── gamelogic.test.ts # Tests for game logic
│   └── test.test.ts      # Scaffolding / example tests
├── SPEC.md               # Full game specification
└── README.md             # This file
```

---

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
npm test
```

Tests are run with [Vitest](https://vitest.dev). Test files live in `tests/`.

---

## Recap

### 5/26/2026 all together

- Set up the Next.js app
- Added Vitest and created the initial test file structure
- Wrote the first test: win-condition validation in `tests/gamelogic.test.ts`

---

## Todos for Next Meeting

- [ ] Review the [Vitest docs](https://vitest.dev) so you're comfortable with the test runner
- [ ] (Optional) Add comments to `tests/gamelogic.test.ts` describing what tests still need to be written
- [ ] (Optional) Take a stab at a UI mockup in Figma or Claude Design


## Work done outside of meetings

- list them here with a date