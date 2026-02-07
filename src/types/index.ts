/**
 * Game models and types for Gruppenspiel
 * Based on MVP_SPEC.md section 2
 */

// Team model
export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
  position: number;
}

// Game settings
export interface GameSettings {
  winCondition: "finish" | "pointsAfterRounds";
  boardLength: number;
  maxRounds: number; // Required, default 10
  /** Array of dice face counts available for selection (e.g., [6] for d6, [6, 8, 10] for multiple options) */
  diceOptions: number[]; // MVP: [6] or [6, 8, 10]
  minigameSelection: "random" | "manual";
  enabledMinigameIds: string[];
  mapId?: string; // optional, for fixed maps
}

// Tile definition
export interface Tile {
  index: number;
  type: "normal" | "minigame" | "bonus" | "penalty";
  value?: number; // for bonus/penalty points
}

// Map definition
export interface MapDefinition {
  id: string;
  name: string;
  length: number;
  tiles: Tile[];
}

// Minigame scoring configuration
export interface MinigameScoring {
  win?: number;
  lose?: number;
  correct?: number;
  wrong?: number;
}

// Base minigame definition
export interface MinigameDefinitionBase {
  id: string;
  name: string;
  type: string;
  description?: string;
  timeLimitSec: number;
  scoring: MinigameScoring;
}

// Physical minigame
export interface PhysicalMinigameDefinition extends MinigameDefinitionBase {
  type: "physical";
  rules: string[];
}

// Quiz minigame
export interface QuizMinigameDefinition extends MinigameDefinitionBase {
  type: "quiz";
  question: string;
  options: string[];
  correctIndex: number;
}

// Union type for all minigame types
export type MinigameDefinition = PhysicalMinigameDefinition | QuizMinigameDefinition;

// Last action for undo functionality
export interface LastAction {
  teamIndex: number;
  previousPosition: number;
  previousScore: number;
  diceRoll: number;
}

// Game state
export interface GameState {
  phase: "setup" | "board" | "minigame" | "end";
  settings: GameSettings;
  teams: Team[];
  currentTeamIndex: number;
  round: number;
  activeMinigameId?: string;
  lastAction?: LastAction;
}
