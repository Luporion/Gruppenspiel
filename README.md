# Gruppenspiel

A multiplayer group game application built with Vite + React + TypeScript.

## Prerequisites

- [Node.js](https://nodejs.org/) (Node 20.19+ or 22.12+ recommended)
- npm (comes with Node.js)

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Routes

- `/host` - Main host/beamer view
- `/team` - Team view (placeholder)
- `/player` - Player view (placeholder)

## Additional Commands

```bash
npm run lint    # Run ESLint
npm run preview # Preview production build locally
```

## Minigame Development

### How Minigames are Discovered

Minigames are automatically loaded from JSON files in the `src/data/minigames/` directory using Vite's `import.meta.glob()`. All `.json` files in this directory are discovered at build time.

### Minigame JSON Structure

Each minigame JSON file must contain the following required fields:

- `id` (string) - Unique identifier for the minigame (does not need to match filename)
- `name` (string) - Display name of the minigame
- `type` (string) - Either "quiz" or "physical"
- `scoring` (object) - Scoring rules for the minigame

#### Quiz Minigames

Quiz minigames require additional fields:
- `question` (string) - The quiz question
- `options` (array) - Array of answer choices
- `correctIndex` (number) - Index of the correct answer in the options array

Example:
```json
{
  "id": "quiz_001",
  "name": "Geography Quiz",
  "type": "quiz",
  "description": "Answer a geography question correctly to earn points",
  "timeLimitSec": 30,
  "scoring": { "correct": 5, "wrong": 0 },
  "question": "What is the capital of France?",
  "options": ["London", "Berlin", "Paris", "Madrid"],
  "correctIndex": 2
}
```

#### Physical Minigames

Physical minigames require:
- `rules` (array) - Array of rule strings describing how to play

Example:
```json
{
  "id": "physical_001",
  "name": "Balance Challenge",
  "type": "physical",
  "description": "Balance on one foot for 30 seconds",
  "timeLimitSec": 60,
  "scoring": { "win": 10, "lose": 0 },
  "rules": ["Stand on one foot", "Keep balance for 30 seconds", "Switch feet if needed"]
}
```

### Validation

Minigames are validated when loaded. If a minigame file is invalid, it will be skipped and a warning will be logged to the console. The application will continue to run with the remaining valid minigames.
