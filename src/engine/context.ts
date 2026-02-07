/**
 * Game store context definition
 */
import { createContext, type Dispatch } from 'react';
import type { GameState } from './types';
import type { GameAction } from './actions';

export interface GameStoreContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  resetSave: () => void;
}

export const GameStoreContext = createContext<GameStoreContextValue | undefined>(
  undefined
);
