import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../engine/useGameStore'
import { useState, useEffect } from 'react'
import { loadMap } from '../utils/dataLoader'
import type { MapDefinition } from '../types'
import './HostBoard.css'

function HostBoard() {
  const navigate = useNavigate()
  const { state, resetSave } = useGameStore()
  const [map, setMap] = useState<MapDefinition | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

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
    return teamName.substring(0, 2).toUpperCase()
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
            style={{ backgroundColor: state.teams[state.currentTeamIndex]?.color }}
          >
            {state.teams[state.currentTeamIndex]?.name || 'No Team'}
          </div>
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
