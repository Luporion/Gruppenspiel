import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../engine/useGameStore'
import { loadSampleData } from '../utils/dataLoader'
import type { Team, MinigameDefinition, MapDefinition } from '../types'
import './Host.css'

function Host() {
  const navigate = useNavigate()
  const { state, dispatch, resetSave } = useGameStore()
  
  // Local form state
  const [teams, setTeams] = useState<Team[]>(state.teams.length > 0 ? state.teams : [])
  const [winCondition, setWinCondition] = useState<'finish' | 'pointsAfterRounds'>(state.settings.winCondition)
  const [boardLength, setBoardLength] = useState<number>(state.settings.boardLength)
  const [diceOptions, setDiceOptions] = useState<number[]>(state.settings.diceOptions)
  const [minigameSelection, setMinigameSelection] = useState<'random' | 'manual'>(state.settings.minigameSelection)
  const [availableMinigames, setAvailableMinigames] = useState<MinigameDefinition[]>([])
  const [enabledMinigameIds, setEnabledMinigameIds] = useState<string[]>(state.settings.enabledMinigameIds)
  const [availableMaps, setAvailableMaps] = useState<MapDefinition[]>([])
  const [selectedMapId, setSelectedMapId] = useState<string | undefined>(state.settings.mapId)
  const [errors, setErrors] = useState<string[]>([])

  // Load sample data on mount
  useEffect(() => {
    loadSampleData().then(({ map, minigames }) => {
      setAvailableMinigames(minigames)
      setAvailableMaps([map])
      if (!selectedMapId && map) {
        setSelectedMapId(map.id)
      }
      // Enable all minigames by default if none are enabled
      if (enabledMinigameIds.length === 0) {
        setEnabledMinigameIds(minigames.map(m => m.id))
      }
    })
  }, [])

  // If game has already started, navigate to board
  useEffect(() => {
    if (state.phase === 'board' || state.phase === 'minigame' || state.phase === 'end') {
      navigate('/host/board')
    }
  }, [state.phase, navigate])

  const addTeam = () => {
    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name: `Team ${teams.length + 1}`,
      color: getRandomColor(),
      score: 0,
      position: 0,
    }
    setTeams([...teams, newTeam])
  }

  const removeTeam = (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId))
  }

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams(teams.map(t => t.id === teamId ? { ...t, ...updates } : t))
  }

  const toggleMinigame = (minigameId: string) => {
    if (enabledMinigameIds.includes(minigameId)) {
      setEnabledMinigameIds(enabledMinigameIds.filter(id => id !== minigameId))
    } else {
      setEnabledMinigameIds([...enabledMinigameIds, minigameId])
    }
  }

  const validateAndStart = () => {
    const validationErrors: string[] = []
    
    if (teams.length < 2) {
      validationErrors.push('At least 2 teams are required')
    }
    if (enabledMinigameIds.length < 1) {
      validationErrors.push('At least 1 minigame must be enabled')
    }
    if (boardLength < 10) {
      validationErrors.push('Board length must be at least 10')
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])

    // Update store with all teams
    teams.forEach((team, index) => {
      if (index < state.teams.length) {
        dispatch({ type: 'UPDATE_TEAM', payload: { id: state.teams[index].id, updates: team } })
      } else {
        dispatch({ type: 'ADD_TEAM', payload: team })
      }
    })

    // Update settings
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        winCondition,
        boardLength,
        diceOptions,
        minigameSelection,
        enabledMinigameIds,
        mapId: selectedMapId,
      }
    })

    // Start the game
    dispatch({ type: 'START_GAME' })
    navigate('/host/board')
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the saved game? This will clear all progress.')) {
      resetSave()
      // Reset local state
      setTeams([])
      setWinCondition('finish')
      setBoardLength(20)
      setDiceOptions([6])
      setMinigameSelection('random')
      setEnabledMinigameIds(availableMinigames.map(m => m.id))
      setSelectedMapId(availableMaps[0]?.id)
      setErrors([])
    }
  }

  return (
    <div className="host-setup">
      <header className="host-header">
        <h1>🎮 Game Setup</h1>
        <button onClick={handleReset} className="btn-reset">
          Reset Saved Game
        </button>
      </header>

      {errors.length > 0 && (
        <div className="error-box">
          <h3>⚠️ Validation Errors:</h3>
          <ul>
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="setup-grid">
        {/* Teams Section */}
        <section className="setup-section">
          <h2>Teams</h2>
          <div className="teams-list">
            {teams.map(team => (
              <div key={team.id} className="team-item">
                <input
                  type="text"
                  value={team.name}
                  onChange={e => updateTeam(team.id, { name: e.target.value })}
                  placeholder="Team name"
                  className="team-name-input"
                />
                <input
                  type="color"
                  value={team.color}
                  onChange={e => updateTeam(team.id, { color: e.target.value })}
                  className="team-color-input"
                />
                <button onClick={() => removeTeam(team.id)} className="btn-remove">
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button onClick={addTeam} className="btn-add">
            + Add Team
          </button>
        </section>

        {/* Settings Section */}
        <section className="setup-section">
          <h2>Game Settings</h2>
          
          <div className="setting-group">
            <label>Win Condition:</label>
            <select 
              value={winCondition} 
              onChange={e => setWinCondition(e.target.value as 'finish' | 'pointsAfterRounds')}
              className="setting-select"
            >
              <option value="finish">Finish Line</option>
              <option value="pointsAfterRounds">Points After Rounds</option>
            </select>
          </div>

          <div className="setting-group">
            <label>Board Length:</label>
            <input
              type="number"
              value={boardLength}
              onChange={e => setBoardLength(parseInt(e.target.value) || 10)}
              min="10"
              className="setting-input"
            />
          </div>

          <div className="setting-group">
            <label>Dice Options:</label>
            <div className="dice-options">
              {[6, 8, 10, 12, 20].map(d => (
                <label key={d} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={diceOptions.includes(d)}
                    onChange={e => {
                      if (e.target.checked) {
                        setDiceOptions([...diceOptions, d].sort((a, b) => a - b))
                      } else {
                        setDiceOptions(diceOptions.filter(x => x !== d))
                      }
                    }}
                  />
                  d{d}
                </label>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <label>Minigame Selection:</label>
            <select
              value={minigameSelection}
              onChange={e => setMinigameSelection(e.target.value as 'random' | 'manual')}
              className="setting-select"
            >
              <option value="random">Random</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </section>

        {/* Minigames Section */}
        <section className="setup-section">
          <h2>Minigame Pool</h2>
          <div className="minigames-list">
            {availableMinigames.map(minigame => (
              <label key={minigame.id} className="minigame-item">
                <input
                  type="checkbox"
                  checked={enabledMinigameIds.includes(minigame.id)}
                  onChange={() => toggleMinigame(minigame.id)}
                />
                <span className="minigame-name">{minigame.name}</span>
                <span className="minigame-type">({minigame.type})</span>
              </label>
            ))}
          </div>
        </section>

        {/* Map Section */}
        <section className="setup-section">
          <h2>Map Selection</h2>
          <div className="map-list">
            {availableMaps.map(map => (
              <label key={map.id} className="map-item">
                <input
                  type="radio"
                  name="map"
                  checked={selectedMapId === map.id}
                  onChange={() => setSelectedMapId(map.id)}
                />
                <span className="map-name">{map.name}</span>
                <span className="map-length">({map.length} tiles)</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="start-section">
        <button onClick={validateAndStart} className="btn-start">
          🚀 Start Game
        </button>
      </div>
    </div>
  )
}

function getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export default Host
