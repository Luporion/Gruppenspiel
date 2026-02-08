# Minigames

This document lists all available minigames in the Gruppenspiel game.

## Overview
- **Total minigames**: 17 (2 samples + 15 new)
- **Physical challenges**: 9
- **Quiz challenges**: 8 (includes 2 estimation-type quizzes)

## Physical Minigames

### 1. Balance Challenge (sample_physical.json)
- **ID**: physical_001
- **Duration**: 60 seconds
- **Points**: Win: 10, Lose: 0
- **Description**: Teams must complete a physical balance challenge
- Stand on one leg for 30 seconds without falling

### 2. Balloon Pop Relay (balloon_pop_relay.json)
- **ID**: physical_002
- **Duration**: 90 seconds
- **Points**: Win: 10, Lose: 0
- **Description**: Teams race to pop balloons in a relay format
- Pop balloons by sitting on them, first team to pop all wins

### 3. Cup Stack Speed (cup_stack_speed.json)
- **ID**: physical_003
- **Duration**: 60 seconds
- **Points**: Win: 10, Lose: 0
- **Description**: Stack and unstack plastic cups as quickly as possible
- Build a 4-3-2-1 pyramid and unstack it

### 4. Paper Airplane Target (paper_airplane_target.json)
- **ID**: physical_004
- **Duration**: 120 seconds
- **Points**: Win: 10, Lose: 0
- **Description**: Fold and throw paper airplanes to hit targets
- Score points based on target zones hit

### 5. Blindfold Guided Walk (blindfold_guided_walk.json)
- **ID**: physical_005
- **Duration**: 90 seconds
- **Points**: Win: 10, Lose: 0
- **Description**: Guide a blindfolded teammate through an obstacle course
- Verbal guidance only, no physical touching

### 6. Human Knot (human_knot.json)
- **ID**: physical_006
- **Duration**: 180 seconds
- **Points**: Win: 10, Lose: 0
- **Description**: Untangle yourselves from a human knot without letting go
- Form a circle, hold hands across, then untangle

### 7. Spoon Race (spoon_race.json)
- **ID**: physical_007
- **Duration**: 60 seconds
- **Points**: Win: 10, Lose: 0
- **Description**: Balance an egg on a spoon while racing
- Hold spoon in mouth, first team finished wins

### 8. Object Hunt (object_hunt.json)
- **ID**: physical_008
- **Duration**: 120 seconds
- **Points**: Win: 10, Lose: 0
- **Description**: Race to find and bring back specific items
- Find 5 common objects from the list

### 9. Balance Challenge v2 (balance_challenge_v2.json)
- **ID**: physical_009
- **Duration**: 90 seconds
- **Points**: Win: 10, Lose: 0
- **Description**: Advanced balance challenge with multiple difficult tasks
- Complete 3 sequential balance tasks

## Quiz Minigames

### 1. Geography Quiz (sample_quiz.json)
- **ID**: quiz_001
- **Duration**: 30 seconds
- **Points**: Correct: 5, Wrong: 0
- **Question**: What is the capital of France?
- **Answer**: Paris

### 2. Bible Basics Quiz (bible_basics_quiz.json)
- **ID**: quiz_002
- **Duration**: 30 seconds
- **Points**: Correct: 5, Wrong: 0
- **Question**: In which city was Jesus born?
- **Answer**: Bethlehem

### 3. Geography Quickfire (geography_quickfire.json)
- **ID**: quiz_003
- **Duration**: 20 seconds
- **Points**: Correct: 5, Wrong: 0
- **Question**: Which is the largest continent by area?
- **Answer**: Asia

### 4. Music Guess (music_guess.json)
- **ID**: quiz_004
- **Duration**: 45 seconds
- **Points**: Correct: 5, Wrong: 0
- **Question**: Which famous worship song starts with 'Amazing grace, how sweet the sound'?
- **Answer**: Amazing Grace

### 5. Logic Riddle (logic_riddle.json)
- **ID**: quiz_005
- **Duration**: 60 seconds
- **Points**: Correct: 5, Wrong: 0
- **Question**: What has keys but no locks, space but no room, and you can enter but not go inside?
- **Answer**: A keyboard

### 6. Church History Mini (church_history_mini.json)
- **ID**: quiz_006
- **Duration**: 30 seconds
- **Points**: Correct: 5, Wrong: 0
- **Question**: Who is known as the father of the Protestant Reformation?
- **Answer**: Martin Luther

### 7. Guess the Candies (guess_candies.json) - Estimation Type
- **ID**: quiz_007
- **Duration**: 60 seconds
- **Points**: Correct: 5, Wrong: 0
- **Question**: How many candies are in this jar?
- **Answer**: 46-55 (actual: 47)

### 8. Guess the Year (guess_year.json) - Estimation Type
- **ID**: quiz_008
- **Duration**: 45 seconds
- **Points**: Correct: 5, Wrong: 0
- **Question**: In which year did the Berlin Wall fall?
- **Answer**: 1989

## Usage

All minigames are automatically loaded via Vite's `import.meta.glob` from the `src/data/minigames/` directory.

To use minigames in the game:
1. **Manual Mode**: Select specific minigames by their IDs in the game setup
2. **Random Mode**: The game will randomly select from all available minigames
3. **Setup**: Configure which minigames are enabled via `GameSettings.enabledMinigameIds`

## Adding New Minigames

To add a new minigame:
1. Create a JSON file in `src/data/minigames/`
2. Follow the schema for either `physical` or `quiz` type
3. Ensure the `id` is unique
4. The game will automatically detect and load it on next build
