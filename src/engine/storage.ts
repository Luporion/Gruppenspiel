/**
 * localStorage save/load helpers for game state persistence
 */
import type { GameState } from './types';

const STORAGE_KEY = 'gruppenspiel_game_state';

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
    const state = JSON.parse(serialized) as GameState;
    return state;
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
