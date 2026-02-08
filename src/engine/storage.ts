/**
 * localStorage save/load helpers for game state persistence
 */
import type { GameState } from './types';

const STORAGE_KEY = 'gruppenspiel_game_state';
const CURRENT_SCHEMA_VERSION = 1;

/**
 * Migrates a saved state object to the current schema version
 * @param saved - Raw saved data (unknown type)
 * @returns Migrated game state or null if invalid/unrecoverable
 */
export function migrateGameState(saved: unknown): GameState | null {
  if (!saved || typeof saved !== 'object') {
    return null;
  }

  const state = saved as Partial<GameState>;

  // Determine the version
  const version = typeof state.schemaVersion === 'number' ? state.schemaVersion : 0;

  // Build the migrated state
  let result: Partial<GameState> = { ...state };

  // Migrate from version 0 to 1
  if (version < 1) {
    // Add schemaVersion field
    result = {
      ...result,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };

    // Default phase - determine based on existing state
    if (!result.phase) {
      // If teams exist and have positions/scores, assume 'board', otherwise 'setup'
      interface TeamLike {
        position?: number;
        score?: number;
      }
      const hasActiveGame = 
        Array.isArray(result.teams) && 
        result.teams.length > 0 &&
        result.teams.some((t: TeamLike) => (t.position || 0) > 0 || (t.score || 0) > 0);
      result = {
        ...result,
        phase: hasActiveGame ? 'board' : 'setup',
      };
    }

    // Ensure settings object exists with defaults
    if (!result.settings || typeof result.settings !== 'object') {
      result = {
        ...result,
        settings: {
          winCondition: 'finish',
          boardLength: 20,
          maxRounds: 10,
          diceOptions: [6],
          minigameSelection: 'random',
          enabledMinigameIds: [],
        },
      };
    } else {
      // Apply default maxRounds
      const maxRounds = typeof result.settings.maxRounds === 'number' 
        ? result.settings.maxRounds 
        : 10;

      // Apply default diceOptions
      const diceOptions = Array.isArray(result.settings.diceOptions) && result.settings.diceOptions.length > 0
        ? result.settings.diceOptions
        : [6];

      result = {
        ...result,
        settings: {
          ...result.settings,
          maxRounds,
          diceOptions,
        },
      };
    }

    // Ensure teams array exists and has required fields
    if (!Array.isArray(result.teams)) {
      result = { ...result, teams: [] };
    } else {
      interface TeamInput {
        id?: string;
        name?: string;
        color?: string;
        score?: number;
        position?: number;
      }
      const teams = result.teams.map((team: TeamInput) => ({
        id: team.id || `team-${Math.random()}`,
        name: team.name || 'Unknown Team',
        color: team.color || '#000000',
        score: typeof team.score === 'number' ? team.score : 0,
        position: typeof team.position === 'number' ? team.position : 0,
      }));
      result = { ...result, teams };
    }

    // Ensure other required fields have defaults
    const currentTeamIndex = typeof result.currentTeamIndex === 'number' 
      ? result.currentTeamIndex 
      : 0;
    const round = typeof result.round === 'number' 
      ? result.round 
      : 1;

    result = {
      ...result,
      currentTeamIndex,
      round,
    };
  }

  // Validate the migrated state has all required fields
  if (
    typeof result.schemaVersion !== 'number' ||
    !result.phase ||
    !result.settings ||
    !Array.isArray(result.teams) ||
    typeof result.currentTeamIndex !== 'number' ||
    typeof result.round !== 'number'
  ) {
    console.error('Failed to migrate game state: missing required fields');
    return null;
  }

  return result as GameState;
}

/**
 * Saves the game state to localStorage
 * @param state - Game state to save
 */
export function saveGameState(state: GameState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save game state to localStorage:', error);
  }
}

/**
 * Loads the game state from localStorage
 * @returns Saved game state or null if not found or invalid
 */
export function loadGameState(): GameState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return null;
    }
    const saved = JSON.parse(serialized);
    return migrateGameState(saved);
  } catch (error) {
    console.error('Failed to load game state from localStorage:', error);
    return null;
  }
}

/**
 * Resets/removes the saved game state from localStorage
 */
export function resetSavedGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset saved game state:', error);
  }
}
