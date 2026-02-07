/**
 * React context provider for game state management
 */
import {
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type { GameState } from './types';
import { gameReducer } from './reducer';
import { saveGameState, loadGameState, resetSavedGameState } from './storage';
import { createInitialGameState } from './state';
import { GameStoreContext } from './context';

interface GameStoreProviderProps {
  children: ReactNode;
  initialState?: GameState;
}

/**
 * Provider component that manages game state with localStorage persistence
 */
export function GameStoreProvider({
  children,
  initialState,
}: GameStoreProviderProps) {
  // Try to load saved state, or use provided initial state, or create a default
  const getInitialState = (): GameState => {
    if (initialState) {
      return initialState;
    }

    const savedState = loadGameState();
    if (savedState) {
      return savedState;
    }

    // Create a minimal default initial state for the app
    return createInitialGameState(
      {
        winCondition: 'finish',
        boardLength: 20,
        diceOptions: [6],
        minigameSelection: 'random',
        enabledMinigameIds: [],
      },
      []
    );
  };

  const [state, dispatch] = useReducer(gameReducer, undefined, getInitialState);

  // Save to localStorage after each state change
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const resetSave = () => {
    resetSavedGameState();
    // Optionally, you could also dispatch a reset action here
    // For now, just clearing localStorage - app reload will get fresh state
  };

  return (
    <GameStoreContext.Provider value={{ state, dispatch, resetSave }}>
      {children}
    </GameStoreContext.Provider>
  );
}
