/**
 * Loader utilities for game data (maps and minigames)
 * These utilities help import and validate JSON data files
 */

import type { MapDefinition, MinigameDefinition } from '../types';

// Vite-safe module maps using import.meta.glob
const mapModules = import.meta.glob('../data/maps/*.json');
const minigameModules = import.meta.glob('../data/minigames/*.json');

// Cache for minigame ID to file path mapping
const minigameIdCache: Map<string, string> = new Map();

/**
 * Load a map definition from a JSON file
 * @param mapId - The ID of the map to load
 * @returns Promise resolving to the map definition
 */
export async function loadMap(mapId: string): Promise<MapDefinition> {
  const key = `../data/maps/${mapId}.json`;
  const loader = mapModules[key];
  
  if (!loader) {
    throw new Error(`Map not found: ${mapId}`);
  }
  
  const module = await loader() as { default: MapDefinition };
  const map = module.default;
  
  // Basic validation
  if (!map.id || !map.name || !map.length || !Array.isArray(map.tiles)) {
    throw new Error(`Invalid map format for ${mapId}`);
  }
  
  return map;
}

/**
 * Load a minigame definition from a JSON file
 * @param minigameId - The ID of the minigame to load (can be filename or the id field in JSON)
 * @returns Promise resolving to the minigame definition
 */
export async function loadMinigame(minigameId: string): Promise<MinigameDefinition> {
  // First try direct filename match
  let key = `../data/minigames/${minigameId}.json`;
  let loader = minigameModules[key];
  
  // If not found, check cache or search all minigames
  if (!loader) {
    // Check cache first
    if (minigameIdCache.has(minigameId)) {
      key = minigameIdCache.get(minigameId)!;
      loader = minigameModules[key];
    } else {
      // Load all minigames and find the one with matching ID
      const allKeys = Object.keys(minigameModules);
      for (const k of allKeys) {
        const mod = await minigameModules[k]() as { default: MinigameDefinition };
        // Cache this ID for future lookups
        minigameIdCache.set(mod.default.id, k);
        
        if (mod.default.id === minigameId) {
          return mod.default;
        }
      }
      throw new Error(`Minigame not found: ${minigameId}`);
    }
  }
  
  const module = await loader() as { default: MinigameDefinition };
  const minigame = module.default;
  
  // Cache the ID if not already cached
  if (!minigameIdCache.has(minigame.id)) {
    minigameIdCache.set(minigame.id, key);
  }
  
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
 * Load all minigames from the minigames directory
 * Validates each minigame and skips invalid ones with console warnings
 * @returns Promise resolving to array of all valid minigame definitions
 */
export async function loadAllMinigames(): Promise<MinigameDefinition[]> {
  const allKeys = Object.keys(minigameModules);
  const minigames: MinigameDefinition[] = [];
  const seenIds = new Set<string>();
  
  for (const key of allKeys) {
    try {
      const module = await minigameModules[key]() as { default: MinigameDefinition };
      const minigame = module.default;
      
      // Validate required fields
      if (!minigame.id || !minigame.name || !minigame.type || !minigame.scoring) {
        console.warn(`Skipping invalid minigame ${key}: missing required fields (id, name, type, or scoring)`);
        continue;
      }
      
      // Check for duplicate IDs
      if (seenIds.has(minigame.id)) {
        console.warn(`Skipping minigame ${key}: duplicate ID "${minigame.id}" already exists`);
        continue;
      }
      
      // Type-specific validation
      if (minigame.type === 'physical') {
        if (!Array.isArray(minigame.rules)) {
          console.warn(`Skipping invalid physical minigame ${key}: missing rules array`);
          continue;
        }
      } else if (minigame.type === 'quiz') {
        if (!minigame.question || !Array.isArray(minigame.options) || minigame.correctIndex === undefined) {
          console.warn(`Skipping invalid quiz minigame ${key}: missing required quiz fields (question, options, or correctIndex)`);
          continue;
        }
        // Validate correctIndex is within bounds
        if (minigame.correctIndex < 0 || minigame.correctIndex >= minigame.options.length) {
          console.warn(`Skipping invalid quiz minigame ${key}: correctIndex ${minigame.correctIndex} is out of bounds for options array of length ${minigame.options.length}`);
          continue;
        }
      }
      
      // Cache the ID for future lookups
      minigameIdCache.set(minigame.id, key);
      seenIds.add(minigame.id);
      
      minigames.push(minigame);
    } catch (error) {
      console.warn(`Skipping minigame ${key} due to error:`, error);
    }
  }
  
  return minigames;
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
