import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../engine/useGameStore'
import { useState, useEffect, useRef, useMemo } from 'react'
import { loadMap } from '../utils/dataLoader'
import { checkWinConditions } from '../utils/winConditions'
import type { MapDefinition } from '../types'
import BeamerToggle from '../components/BeamerToggle'
import FullscreenToggle from '../components/FullscreenToggle'
import OverflowWarning from '../components/OverflowWarning'
import { useHotkeys } from '../utils/useHotkeys'
import { useGlobalControls } from '../utils/useGlobalControls'
import './HostBoard.css'

function HostBoard() {
  const navigate = useNavigate()
  const { state, dispatch, resetSave } = useGameStore()
  const [map, setMap] = useState<MapDefinition | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [isTimeoutPending, setIsTimeoutPending] = useState(false)
  const nextTeamTimeoutRef = useRef<number | null>(null)
  const { handleToggleBeamer, handleToggleFullscreen, handleExitFullscreen } = useGlobalControls()

  // Load map from state or from file
  useEffect(() => {
    // First check if we have a generated map in state
    if (state.map) {
      setMap(state.map)
      setMapError(null)
    } else if (state.settings.mapId) {
      // Fall back to loading from file for backward compatibility
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
  }, [state.map, state.settings.mapId])

  // Navigate to minigame when phase changes
  useEffect(() => {
    if (state.phase === 'minigame') {
      navigate('/host/minigame')
    } else if (state.phase === 'end') {
      navigate('/host/end')
    }
  }, [state.phase, navigate])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (nextTeamTimeoutRef.current !== null) {
        clearTimeout(nextTeamTimeoutRef.current)
      }
      setIsTimeoutPending(false)
    }
  }, [])

  // Check win conditions and navigate to end screen if game is over
  useEffect(() => {
    if (!map || state.phase !== 'board') return

    const shouldEndGame = checkWinConditions(state.settings, state.teams, state.round, map)
    if (shouldEndGame) {
      dispatch({ type: 'END_GAME' })
      navigate('/host/end')
    }
  }, [state.teams, state.round, state.phase, state.settings, map, dispatch, navigate])

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

  // Check if map has grid layout (all tiles have pos coordinates)
  // Memoized to avoid recalculating on every render
  const hasGridLayout = useMemo(() => {
    if (!map) return false
    return map.tiles.every(tile => tile.pos !== undefined)
  }, [map])

  // Calculate grid dimensions for 2D grid layouts
  // Memoized to avoid recalculating on every render
  const gridDimensions = useMemo(() => {
    if (!map || !hasGridLayout) return { cols: 5, rows: 5 }
    
    // Use explicit gridCols/gridRows if provided
    if (map.gridCols !== undefined && map.gridRows !== undefined) {
      return { cols: map.gridCols, rows: map.gridRows }
    }
    
    // Otherwise, calculate optimal dimensions
    // Find max x and y from tile positions
    let maxX = 0
    let maxY = 0
    map.tiles.forEach(tile => {
      if (tile.pos) {
        maxX = Math.max(maxX, tile.pos.x)
        maxY = Math.max(maxY, tile.pos.y)
      }
    })
    
    // Grid dimensions are max + 1 (since positions are 0-indexed)
    return { cols: maxX + 1, rows: maxY + 1 }
  }, [map, hasGridLayout])

  // Render a tile with all its content (index, symbol, type, value, team tokens)
  const renderTileContent = (tile: MapDefinition['tiles'][0], teamsAtPosition: typeof state.teams) => (
    <>
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
    </>
  )

  // Get current team
  const currentTeam = state.teams[state.currentTeamIndex]

  // Roll dice and process turn
  const handleRollDice = () => {
    if (!map || !currentTeam) return

    // Step 1: Roll dice
    // Pick a random dice option from settings (MVP: should be just one option)
    // Fallback to [6] if diceOptions is missing OR empty
    const diceOptions = state.settings.diceOptions?.length > 0 ? state.settings.diceOptions : [6]
    const selectedDiceSides = diceOptions[Math.floor(Math.random() * diceOptions.length)]
    const roll = Math.floor(Math.random() * selectedDiceSides) + 1
    
    setLastRoll(roll)

    // Step 2: Calculate new position (capped at last tile index, which is the finish tile)
    const currentPosition = currentTeam.position
    const lastTileIndex = map.tiles.length - 1
    const newPosition = Math.min(currentPosition + roll, lastTileIndex)

    // Step 3: Update position with MOVE_TEAM (always, to ensure capping is applied)
    dispatch({
      type: 'MOVE_TEAM',
      payload: { teamId: currentTeam.id, position: newPosition }
    })

    // Step 4: Apply tile effects
    const landedTile = map.tiles.find(tile => tile.index === newPosition)
    if (landedTile) {
      applyTileEffect(landedTile)
    } else {
      // If tile not found, treat as normal tile and advance to next team
      scheduleNextTeam()
    }
  }

  // Helper function to schedule next team transition
  const scheduleNextTeam = () => {
    // Clear any pending timeout
    if (nextTeamTimeoutRef.current !== null) {
      clearTimeout(nextTeamTimeoutRef.current)
    }
    
    setIsTimeoutPending(true)
    nextTeamTimeoutRef.current = window.setTimeout(() => {
      dispatch({ type: 'NEXT_TEAM' })
      setIsTimeoutPending(false)
      nextTeamTimeoutRef.current = null
    }, 500)
  }

  // Apply tile effects based on tile type
  const applyTileEffect = (tile: MapDefinition['tiles'][0]) => {
    if (!currentTeam) return

    switch (tile.type) {
      case 'bonus': {
        const points = tile.value ?? 3
        const newScore = currentTeam.score + points
        dispatch({
          type: 'UPDATE_SCORE',
          payload: { teamId: currentTeam.id, score: newScore }
        })
        // Advance to next team after bonus
        scheduleNextTeam()
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
        scheduleNextTeam()
        break
      }
      case 'minigame': {
        // Pick minigame based on selection mode
        const enabledMinigames = state.settings.enabledMinigameIds || []
        if (enabledMinigames.length > 0) {
          if (state.settings.minigameSelection === 'random') {
            // Random mode: auto-select and start minigame
            const minigameId = enabledMinigames[Math.floor(Math.random() * enabledMinigames.length)]
            dispatch({
              type: 'START_MINIGAME',
              payload: minigameId
            })
          } else {
            // Manual mode: navigate to minigame page without activeMinigameId to show selection UI
            dispatch({
              type: 'START_MINIGAME',
              payload: undefined
            })
          }
        } else {
          // No minigames enabled, advance to next team
          scheduleNextTeam()
        }
        break
      }
      default:
        // Normal tile - advance to next team
        scheduleNextTeam()
        break
    }
  }

  // Manual next team button
  const handleNextTeam = () => {
    // Clear any pending timeout to prevent double NEXT_TEAM
    if (nextTeamTimeoutRef.current !== null) {
      clearTimeout(nextTeamTimeoutRef.current)
      nextTeamTimeoutRef.current = null
      setIsTimeoutPending(false)
    }
    
    dispatch({ type: 'NEXT_TEAM' })
    setLastRoll(null)
  }

  // Setup keyboard hotkeys
  useHotkeys([
    {
      key: ' ', // Spacebar produces event.key = ' ' (single space character)
      handler: handleRollDice,
      enabled: state.phase === 'board',
      description: 'Roll Dice'
    },
    {
      key: 'n',
      handler: handleNextTeam,
      enabled: state.phase === 'board',
      description: 'Next Team'
    },
    {
      key: 'b',
      handler: handleToggleBeamer,
      description: 'Toggle Beamer Mode'
    },
    {
      key: 'f',
      handler: handleToggleFullscreen,
      description: 'Toggle Fullscreen'
    },
    {
      key: 'Escape',
      handler: handleExitFullscreen,
      description: 'Exit Fullscreen'
    }
  ])

  return (
    <div className="host-board">
      <OverflowWarning />
      <header className="board-header">
        <h1>🎮 Game Board</h1>
        <div className="header-buttons">
          <BeamerToggle />
          <FullscreenToggle />
          <button onClick={handleResetSave} className="btn-reset-save">
            🔄 Reset Save
          </button>
          <button onClick={handleBackToSetup} className="btn-back">
            ← Back to Setup
          </button>
        </div>
      </header>

      <div className="board-container">
        {/* Show warning if no teams are configured */}
        {!currentTeam && (
          <div className="error-message" style={{ marginBottom: '2rem' }}>
            ⚠️ No teams configured. Please go back to setup to add teams.
          </div>
        )}

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
            disabled={!map || !currentTeam || state.phase !== 'board' || isTimeoutPending}
          >
            🎲 Roll Dice
          </button>
          <button 
            onClick={handleNextTeam} 
            className="btn-next-team"
            disabled={!currentTeam || state.phase !== 'board' || isTimeoutPending}
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
            <>
              {hasGridLayout ? (
                // Grid layout for 2D boards
                <div 
                  className="board-grid"
                  style={{
                    gridTemplateColumns: `repeat(${gridDimensions.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${gridDimensions.rows}, 1fr)`
                  }}
                >
                  {map.tiles.map((tile) => {
                    const teamsAtPosition = state.teams.filter(team => team.position === tile.index)
                    
                    return (
                      <div 
                        key={tile.index} 
                        className={`tile tile-${tile.type}`}
                        style={{
                          gridColumn: tile.pos!.x + 1,
                          gridRow: tile.pos!.y + 1,
                        }}
                      >
                        {renderTileContent(tile, teamsAtPosition)}
                      </div>
                    )
                  })}
                </div>
              ) : (
                // Linear layout for 1D boards
                <div className="board-tiles">
                  {map.tiles.map((tile) => {
                    const teamsAtPosition = state.teams.filter(team => team.position === tile.index)
                    
                    return (
                      <div key={tile.index} className={`tile tile-${tile.type}`}>
                        {renderTileContent(tile, teamsAtPosition)}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
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
          {map && <p><strong>Board Length:</strong> {map.tiles.length} tiles</p>}
          <p><strong>Win Condition:</strong> {state.settings.winCondition}</p>
          {map && <p><strong>Map:</strong> {map.name}</p>}
        </div>
      </div>
    </div>
  )
}

export default HostBoard
