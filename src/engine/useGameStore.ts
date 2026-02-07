/**
 * Hook to access the game store context
 */
import { useContext } from 'react';
import { GameStoreContext } from './context';

/**
 * Hook to access the game store context
 * @throws Error if used outside of GameStoreProvider
 */
export function useGameStore() {
  const context = useContext(GameStoreContext);
  if (!context) {
    throw new Error('useGameStore must be used within a GameStoreProvider');
  }
  return context;
}
