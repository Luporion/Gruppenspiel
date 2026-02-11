/**
 * Action types for game state reducer
 */
import type { GameState, Team, GameSettings, MapDefinition } from './types';

// Action types
export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'SET_PHASE'; payload: GameState['phase'] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'SET_MAP'; payload: { map: MapDefinition; seed?: string | number } }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'REMOVE_TEAM'; payload: string } // team id
  | { type: 'UPDATE_TEAM'; payload: { id: string; updates: Partial<Team> } }
  | { type: 'NEXT_TEAM' }
  | { type: 'ROLL_DICE'; payload: number } // dice result
  | { type: 'MOVE_TEAM'; payload: { teamId: string; position: number } }
  | { type: 'UPDATE_SCORE'; payload: { teamId: string; score: number } }
  | { type: 'START_MINIGAME'; payload: string | undefined } // minigame id (undefined for manual selection)
  | { type: 'SET_ACTIVE_MINIGAME'; payload: string } // minigame id (used in manual selection flow)
  | { type: 'END_MINIGAME' }
  | { type: 'NEXT_ROUND' }
  | { type: 'UNDO_LAST_ACTION' }
  | { type: 'END_GAME' }
  | { type: 'RESET_STATE'; payload: GameState };
