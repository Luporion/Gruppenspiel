/**
 * Initial game state factory
 */
import type { GameState, GameSettings, Team } from './types';

/**
 * Creates an initial game state with the provided settings and teams
 * @param settings - Game settings configuration
 * @param teams - Array of teams playing the game
 * @param mapId - Optional map identifier
 * @param enabledMinigameIds - Array of enabled minigame IDs
 * @returns Initial game state
 */
export function createInitialGameState(
  settings: GameSettings,
  teams: Team[],
  mapId?: string,
  enabledMinigameIds?: string[]
): GameState {
  // Merge enabledMinigameIds into settings if provided
  const finalSettings: GameSettings = {
    ...settings,
    enabledMinigameIds: enabledMinigameIds || settings.enabledMinigameIds || [],
    mapId: mapId || settings.mapId,
  };

  return {
    schemaVersion: 1,
    phase: 'setup',
    settings: finalSettings,
    teams: teams.map((team) => ({ ...team })), // Clone teams to avoid mutations
    currentTeamIndex: 0,
    round: 1,
    activeMinigameId: undefined,
    lastAction: undefined,
  };
}
