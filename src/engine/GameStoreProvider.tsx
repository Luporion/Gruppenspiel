/**
 * React context provider for game state management
 */
import {
  useReducer,
  useEffect,
  useCallback,
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
 * Creates the initial game state - moved outside component to avoid recreation
 */
function getInitialState(providedState?: GameState): GameState {
  if (providedState) {
    return providedState;
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
      maxRounds: 10,
      diceOptions: [6],
      minigameSelection: 'random',
      enabledMinigameIds: [],
    },
    []
  );
}

/**
 * Provider component that manages game state with localStorage persistence
 */
export function GameStoreProvider({
  children,
  initialState,
}: GameStoreProviderProps) {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialState,
    getInitialState
  );

  // Save to localStorage after each state change
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const resetSave = useCallback(() => {
    resetSavedGameState();
    // Reset the in-memory state as well to maintain consistency
    const freshState = createInitialGameState(
      {
        winCondition: 'finish',
        boardLength: 20,
        maxRounds: 10,
        diceOptions: [6],
        minigameSelection: 'random',
        enabledMinigameIds: [],
      },
      []
    );
    dispatch({ type: 'RESET_STATE', payload: freshState });
  }, []);

  return (
    <GameStoreContext.Provider value={{ state, dispatch, resetSave }}>
      {children}
    </GameStoreContext.Provider>
  );
}
