/**
 * Utility functions for win condition checking
 */
import type { GameSettings, Team, MapDefinition } from '../types'

/**
 * Checks if win conditions are met based on game settings
 * @param settings - Game settings containing win condition type and maxRounds
 * @param teams - Array of teams with their current state
 * @param currentRound - Current round number
 * @param map - Map definition (required for 'finish' win condition)
 * @returns true if game should end, false otherwise
 */
export function checkWinConditions(
  settings: GameSettings,
  teams: Team[],
  currentRound: number,
  map: MapDefinition | null
): boolean {
  if (settings.winCondition === 'finish') {
    // Check if any team has reached the end (position >= map.length - 1)
    if (!map) return false
    return teams.some(team => team.position >= map.length - 1)
  } else if (settings.winCondition === 'pointsAfterRounds') {
    // Check if maxRounds exceeded
    return currentRound > settings.maxRounds
  }

  return false
}
