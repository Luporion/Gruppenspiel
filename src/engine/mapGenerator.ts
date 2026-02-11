/**
 * Map generator for creating procedural board layouts
 */
import type { MapDefinition, Tile } from '../types';

/**
 * Simple deterministic PRNG based on mulberry32
 * @param seed - Seed value for the PRNG
 * @returns Function that generates random numbers between 0 and 1
 */
function createRng(seed: number) {
  let state = seed;
  return function() {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert a string or number to a numeric seed
 */
function hashSeed(seed: string | number): number {
  if (typeof seed === 'number') {
    return seed;
  }
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export interface GenerateMapParams {
  boardLength: number;
  seed?: string | number;
  minigameFrequency?: number; // Place minigame every N tiles (default: 5)
  bonusFrequency?: number; // ~1 in N chance for bonus (default: 8)
  penaltyFrequency?: number; // ~1 in N chance for penalty (default: 10)
}

/**
 * Generate a classic linear board map
 * @param params - Configuration for map generation
 * @returns MapDefinition with tiles for indices 0..boardLength (inclusive)
 */
export function generateClassicMap(params: GenerateMapParams): MapDefinition {
  const {
    boardLength,
    seed = Date.now(),
    minigameFrequency = 5,
    bonusFrequency = 8,
    penaltyFrequency = 10,
  } = params;

  if (boardLength < 1) {
    throw new Error('Board length must be at least 1');
  }

  const numericSeed = hashSeed(seed);
  const rng = createRng(numericSeed);

  // Initialize all tiles as normal
  const tiles: Tile[] = Array.from({ length: boardLength + 1 }, (_, i) => ({
    index: i,
    type: 'normal' as const,
  }));

  // Track counts for validation
  let minigameCount = 0;
  let bonusPenaltyCount = 0;

  // Place minigame tiles regularly (every minigameFrequency tiles)
  // Start from minigameFrequency and skip 0 and boardLength
  for (let i = minigameFrequency; i < boardLength; i += minigameFrequency) {
    // Add some variance: +/- 1 tile
    const variance = Math.floor(rng() * 3) - 1; // -1, 0, or 1
    const targetIndex = i + variance;
    
    // Ensure we don't place on start (0) or finish (boardLength)
    if (targetIndex > 0 && targetIndex < boardLength && tiles[targetIndex].type === 'normal') {
      tiles[targetIndex].type = 'minigame';
      minigameCount++;
    }
  }

  // Sprinkle bonus and penalty tiles
  for (let i = 1; i < boardLength; i++) {
    // Skip tiles that already have a type
    if (tiles[i].type !== 'normal') {
      continue;
    }

    const roll = rng();
    
    if (roll < 1 / bonusFrequency) {
      tiles[i].type = 'bonus';
      // Bonus values: 3, 4, or 5 points
      tiles[i].value = 3 + Math.floor(rng() * 3);
      bonusPenaltyCount++;
    } else if (roll < (1 / bonusFrequency + 1 / penaltyFrequency)) {
      tiles[i].type = 'penalty';
      // Penalty values: -2 or -3 points
      tiles[i].value = -2 - Math.floor(rng() * 2);
      bonusPenaltyCount++;
    }
  }

  // Ensure minimum requirements
  if (boardLength >= 6 && minigameCount === 0) {
    // Place at least one minigame near the middle
    const midPoint = Math.floor(boardLength / 2);
    if (tiles[midPoint].type === 'normal') {
      tiles[midPoint].type = 'minigame';
      minigameCount++;
    }
  }

  if (boardLength >= 10 && bonusPenaltyCount === 0) {
    // Place at least one bonus or penalty near 1/3 of the board
    const targetIndex = Math.floor(boardLength / 3);
    if (tiles[targetIndex].type === 'normal') {
      // Randomly choose bonus or penalty
      if (rng() < 0.5) {
        tiles[targetIndex].type = 'bonus';
        tiles[targetIndex].value = 3;
      } else {
        tiles[targetIndex].type = 'penalty';
        tiles[targetIndex].value = -2;
      }
      bonusPenaltyCount++;
    }
  }

  return {
    id: `generated_${numericSeed}`,
    name: `Classic Board (${boardLength} tiles)`,
    length: boardLength + 1, // length represents number of tiles (0 to boardLength)
    tiles,
  };
}
