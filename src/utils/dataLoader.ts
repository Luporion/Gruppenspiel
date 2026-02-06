/**
 * Loader utilities for game data (maps and minigames)
 * These utilities help import and validate JSON data files
 */

import type { MapDefinition, MinigameDefinition } from '../types';

/**
 * Load a map definition from a JSON file
 * @param mapId - The ID of the map to load
 * @returns Promise resolving to the map definition
 */
export async function loadMap(mapId: string): Promise<MapDefinition> {
  try {
    const module = await import(`../data/maps/${mapId}.json`);
    const map = module.default as MapDefinition;
    
    // Basic validation
    if (!map.id || !map.name || !map.length || !Array.isArray(map.tiles)) {
      throw new Error(`Invalid map format for ${mapId}`);
    }
    
    return map;
  } catch (error) {
    throw new Error(`Failed to load map ${mapId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load a minigame definition from a JSON file
 * @param minigameId - The ID of the minigame to load
 * @returns Promise resolving to the minigame definition
 */
export async function loadMinigame(minigameId: string): Promise<MinigameDefinition> {
  try {
    const module = await import(`../data/minigames/${minigameId}.json`);
    const minigame = module.default as MinigameDefinition;
    
    // Basic validation
    if (!minigame.id || !minigame.name || !minigame.type || !minigame.scoring) {
      throw new Error(`Invalid minigame format for ${minigameId}`);
    }
    
    // Type-specific validation
    if (minigame.type === 'physical') {
      if (!Array.isArray(minigame.rules)) {
        throw new Error(`Physical minigame ${minigameId} missing rules array`);
      }
    } else if (minigame.type === 'quiz') {
      if (!minigame.question || !Array.isArray(minigame.options) || minigame.correctIndex === undefined) {
        throw new Error(`Quiz minigame ${minigameId} missing required quiz fields`);
      }
    }
    
    return minigame;
  } catch (error) {
    throw new Error(`Failed to load minigame ${minigameId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load all minigames from a list of IDs
 * @param minigameIds - Array of minigame IDs to load
 * @returns Promise resolving to array of minigame definitions
 */
export async function loadMinigames(minigameIds: string[]): Promise<MinigameDefinition[]> {
  const promises = minigameIds.map(id => loadMinigame(id));
  return Promise.all(promises);
}

/**
 * Get available sample data
 * This is a convenience function to load the built-in sample data
 * @returns Promise resolving to object containing the sample map and array of sample minigames
 */
export async function loadSampleData(): Promise<{ map: MapDefinition; minigames: MinigameDefinition[] }> {
  const [map, physicalMinigame, quizMinigame] = await Promise.all([
    loadMap('sample_map'),
    loadMinigame('sample_physical'),
    loadMinigame('sample_quiz')
  ]);
  
  return {
    map,
    minigames: [physicalMinigame, quizMinigame]
  };
}
