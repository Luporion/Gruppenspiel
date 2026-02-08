/**
 * Pure reducer function for game state management
 */
import type { GameState } from './types';
import type { GameAction } from './actions';

/**
 * Game state reducer - pure function that returns a new state based on the action
 * @param state - Current game state
 * @param action - Action to apply to the state
 * @returns New game state
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        phase: 'board',
        currentTeamIndex: 0,
        round: 1,
      };

    case 'SET_PHASE':
      return {
        ...state,
        phase: action.payload,
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case 'ADD_TEAM':
      return {
        ...state,
        teams: [...state.teams, action.payload],
      };

    case 'REMOVE_TEAM':
      return {
        ...state,
        teams: state.teams.filter((team) => team.id !== action.payload),
      };

    case 'UPDATE_TEAM': {
      const { id, updates } = action.payload;
      return {
        ...state,
        teams: state.teams.map((team) =>
          team.id === id ? { ...team, ...updates } : team
        ),
      };
    }

    case 'NEXT_TEAM': {
      const nextIndex = (state.currentTeamIndex + 1) % state.teams.length;
      const shouldIncrementRound = nextIndex === 0;
      return {
        ...state,
        currentTeamIndex: nextIndex,
        round: shouldIncrementRound ? state.round + 1 : state.round,
      };
    }

    case 'ROLL_DICE': {
      const currentTeam = state.teams[state.currentTeamIndex];
      if (!currentTeam) return state;

      const diceRoll = action.payload;
      const previousPosition = currentTeam.position;
      const newPosition = previousPosition + diceRoll;

      return {
        ...state,
        teams: state.teams.map((team, idx) =>
          idx === state.currentTeamIndex
            ? { ...team, position: newPosition }
            : team
        ),
        lastAction: {
          teamIndex: state.currentTeamIndex,
          previousPosition,
          previousScore: currentTeam.score,
          diceRoll,
        },
      };
    }

    case 'MOVE_TEAM': {
      const { teamId, position } = action.payload;
      return {
        ...state,
        teams: state.teams.map((team) =>
          team.id === teamId ? { ...team, position } : team
        ),
      };
    }

    case 'UPDATE_SCORE': {
      const { teamId, score } = action.payload;
      return {
        ...state,
        teams: state.teams.map((team) =>
          team.id === teamId ? { ...team, score } : team
        ),
      };
    }

    case 'START_MINIGAME':
      return {
        ...state,
        phase: 'minigame',
        activeMinigameId: action.payload, // Can be undefined for manual selection
      };

    case 'SET_ACTIVE_MINIGAME':
      return {
        ...state,
        activeMinigameId: action.payload,
      };

    case 'END_MINIGAME':
      return {
        ...state,
        phase: 'board',
        activeMinigameId: undefined,
      };

    case 'NEXT_ROUND':
      return {
        ...state,
        round: state.round + 1,
      };

    case 'UNDO_LAST_ACTION': {
      if (!state.lastAction) return state;

      const { teamIndex, previousPosition, previousScore } = state.lastAction;
      return {
        ...state,
        teams: state.teams.map((team, idx) =>
          idx === teamIndex
            ? { ...team, position: previousPosition, score: previousScore }
            : team
        ),
        lastAction: undefined,
      };
    }

    case 'END_GAME':
      return {
        ...state,
        phase: 'end',
      };

    case 'RESET_STATE':
      return action.payload;

    default:
      return state;
  }
}
