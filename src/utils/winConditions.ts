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
    // Prefer real tile array length; fallback to boardLength
    const finishIndex =
      map?.tiles?.length && map.tiles.length > 0
        ? map.tiles.length - 1
        : settings.boardLength

    return teams.some(team => team.position >= finishIndex)
  } else if (settings.winCondition === 'pointsAfterRounds') {
    // End game after completing maxRounds
    // currentRound is 1-based and increments at the START of each new round
    // (when cycling back to first team). So round 11 means we've started round 11,
    // which means we've completed round 10. Hence: currentRound > maxRounds.
    return currentRound > settings.maxRounds
  }

  return false
}
