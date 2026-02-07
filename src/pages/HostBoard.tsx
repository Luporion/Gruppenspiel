import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../engine/useGameStore'
import { useState, useEffect } from 'react'
import { loadMap } from '../utils/dataLoader'
import type { MapDefinition } from '../types'
import './HostBoard.css'

function HostBoard() {
  const navigate = useNavigate()
  const { state, dispatch, resetSave } = useGameStore()
  const [map, setMap] = useState<MapDefinition | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [lastRoll, setLastRoll] = useState<number | null>(null)

  // Load map when component mounts or mapId changes
  useEffect(() => {
    if (state.settings.mapId) {
      loadMap(state.settings.mapId)
        .then(loadedMap => {
          setMap(loadedMap)
          setMapError(null)
        })
        .catch(error => {
          console.error('Error loading map:', error)
          setMapError(error.message)
        })
    }
  }, [state.settings.mapId])

  const handleBackToSetup = () => {
    if (confirm('Are you sure you want to go back to setup? This will reset the game.')) {
      resetSave()
      navigate('/host')
    }
  }

  const handleResetSave = () => {
    if (confirm('Are you sure you want to reset the saved game? This will clear all progress.')) {
      resetSave()
    }
  }

  // Get team initials (first 2 letters)
  const getTeamInitials = (teamName: string) => {
    return teamName.slice(0, 2).toUpperCase() || '??'
  }

  // Get tile type emoji/symbol
  const getTileSymbol = (type: string) => {
    switch (type) {
      case 'minigame': return '🎮'
      case 'bonus': return '⭐'
      case 'penalty': return '⚠️'
      default: return '•'
    }
  }

  // Get current team
  const currentTeam = state.teams[state.currentTeamIndex]

  // Roll dice and process turn
  const handleRollDice = () => {
    if (!map) return

    // Step 1: Roll dice
    // Pick a random dice option from settings (MVP: should be just one option)
    const diceOptions = state.settings.diceOptions || [6]
    const selectedDiceSides = diceOptions[Math.floor(Math.random() * diceOptions.length)]
    const roll = Math.floor(Math.random() * selectedDiceSides) + 1
    
    setLastRoll(roll)

    // Step 2: Calculate new position (capped at map length - 1)
    const currentPosition = currentTeam.position
    const newPosition = Math.min(currentPosition + roll, map.length - 1)

    // Step 3: Move the team
    dispatch({
      type: 'ROLL_DICE',
      payload: roll
    })

    // Update position to capped value
    if (newPosition !== currentPosition + roll) {
      dispatch({
        type: 'MOVE_TEAM',
        payload: { teamId: currentTeam.id, position: newPosition }
      })
    }

    // Step 4: Apply tile effects
    const landedTile = map.tiles.find(tile => tile.index === newPosition)
    if (landedTile) {
      applyTileEffect(landedTile)
    }
  }

  // Apply tile effects based on tile type
  const applyTileEffect = (tile: MapDefinition['tiles'][0]) => {
    switch (tile.type) {
      case 'bonus': {
        const points = tile.value ?? 3
        const newScore = currentTeam.score + points
        dispatch({
          type: 'UPDATE_SCORE',
          payload: { teamId: currentTeam.id, score: newScore }
        })
        // Advance to next team after bonus
        setTimeout(() => {
          dispatch({ type: 'NEXT_TEAM' })
        }, 500)
        break
      }
      case 'penalty': {
        const points = tile.value ?? -3
        const newScore = currentTeam.score + points
        dispatch({
          type: 'UPDATE_SCORE',
          payload: { teamId: currentTeam.id, score: newScore }
        })
        // Advance to next team after penalty
        setTimeout(() => {
          dispatch({ type: 'NEXT_TEAM' })
        }, 500)
        break
      }
      case 'minigame': {
        // Pick minigame based on selection mode
        const enabledMinigames = state.settings.enabledMinigameIds || []
        if (enabledMinigames.length > 0) {
          let minigameId: string
          if (state.settings.minigameSelection === 'random') {
            minigameId = enabledMinigames[Math.floor(Math.random() * enabledMinigames.length)]
          } else {
            // For manual selection, pick first one for now (can be improved later)
            minigameId = enabledMinigames[0]
          }
          dispatch({
            type: 'START_MINIGAME',
            payload: minigameId
          })
        } else {
          // No minigames enabled, advance to next team
          setTimeout(() => {
            dispatch({ type: 'NEXT_TEAM' })
          }, 500)
        }
        break
      }
      default:
        // Normal tile - advance to next team
        setTimeout(() => {
          dispatch({ type: 'NEXT_TEAM' })
        }, 500)
        break
    }
  }

  // Manual next team button
  const handleNextTeam = () => {
    dispatch({ type: 'NEXT_TEAM' })
    setLastRoll(null)
  }

  return (
    <div className="host-board">
      <header className="board-header">
        <h1>🎮 Game Board</h1>
        <div className="header-buttons">
          <button onClick={handleResetSave} className="btn-reset-save">
            🔄 Reset Save
          </button>
          <button onClick={handleBackToSetup} className="btn-back">
            ← Back to Setup
          </button>
        </div>
      </header>

      <div className="board-container">
        {/* Current Team Indicator */}
        <div className="current-team-indicator">
          <h2>Current Turn:</h2>
          <div 
            className="current-team-display"
            style={{ backgroundColor: currentTeam?.color }}
          >
            {currentTeam?.name || 'No Team'}
          </div>
        </div>

        {/* Game Controls */}
        <div className="game-controls">
          <button 
            onClick={handleRollDice} 
            className="btn-roll-dice"
            disabled={!map || state.phase !== 'board'}
          >
            🎲 Roll Dice
          </button>
          <button 
            onClick={handleNextTeam} 
            className="btn-next-team"
            disabled={state.phase !== 'board'}
          >
            ➡️ Next Team
          </button>
          {lastRoll !== null && (
            <div className="last-roll-display">
              <span className="roll-label">Last Roll:</span>
              <span className="roll-value">{lastRoll}</span>
            </div>
          )}
        </div>

        {/* Map Display */}
        <div className="map-section">
          <h2>Game Board</h2>
          {mapError && (
            <div className="error-message">
              ⚠️ Error loading map: {mapError}
            </div>
          )}
          {!map && !mapError && (
            <div className="loading-message">
              Loading map...
            </div>
          )}
          {map && (
            <div className="board-tiles">
              {map.tiles.map((tile) => {
                // Find teams at this position
                const teamsAtPosition = state.teams.filter(team => team.position === tile.index)
                
                return (
                  <div key={tile.index} className={`tile tile-${tile.type}`}>
                    <div className="tile-index">{tile.index}</div>
                    <div className="tile-symbol">{getTileSymbol(tile.type)}</div>
                    <div className="tile-type">{tile.type}</div>
                    {tile.value && (
                      <div className="tile-value">{tile.value > 0 ? `+${tile.value}` : tile.value}</div>
                    )}
                    {teamsAtPosition.length > 0 && (
                      <div className="tile-tokens">
                        {teamsAtPosition.map(team => (
                          <div
                            key={team.id}
                            className="team-token"
                            style={{ backgroundColor: team.color }}
                            title={team.name}
                          >
                            {getTeamInitials(team.name)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="scoreboard">
          <h2>Scoreboard</h2>
          <div className="scoreboard-table">
            <div className="scoreboard-header">
              <div>Team</div>
              <div>Position</div>
              <div>Score</div>
            </div>
            {state.teams.map((team, idx) => (
              <div
                key={team.id}
                className={`scoreboard-row ${idx === state.currentTeamIndex ? 'current-team' : ''}`}
                style={{ borderLeftColor: team.color }}
              >
                <div className="scoreboard-team">
                  <div className="team-color-dot" style={{ backgroundColor: team.color }}></div>
                  {team.name}
                </div>
                <div className="scoreboard-position">{team.position}</div>
                <div className="scoreboard-score">{team.score}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Info */}
        <div className="game-info">
          <h2>Game Info</h2>
          <p><strong>Round:</strong> {state.round}</p>
          <p><strong>Phase:</strong> {state.phase}</p>
          <p><strong>Board Length:</strong> {state.settings.boardLength}</p>
          <p><strong>Win Condition:</strong> {state.settings.winCondition}</p>
          {map && <p><strong>Map:</strong> {map.name}</p>}
        </div>
      </div>
    </div>
  )
}

export default HostBoard
