import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../engine/useGameStore'
import './HostBoard.css'

function HostBoard() {
  const navigate = useNavigate()
  const { state, resetSave } = useGameStore()

  const handleBackToSetup = () => {
    if (confirm('Are you sure you want to go back to setup? This will reset the game.')) {
      resetSave()
      navigate('/host')
    }
  }

  return (
    <div className="host-board">
      <header className="board-header">
        <h1>🎮 Game Board</h1>
        <button onClick={handleBackToSetup} className="btn-back">
          ← Back to Setup
        </button>
      </header>

      <div className="board-info">
        <div className="info-card">
          <h2>Game Info</h2>
          <p><strong>Round:</strong> {state.round}</p>
          <p><strong>Phase:</strong> {state.phase}</p>
          <p><strong>Board Length:</strong> {state.settings.boardLength}</p>
          <p><strong>Win Condition:</strong> {state.settings.winCondition}</p>
        </div>

        <div className="info-card">
          <h2>Teams</h2>
          {state.teams.map((team, idx) => (
            <div 
              key={team.id} 
              className="team-info"
              style={{ borderLeftColor: team.color }}
            >
              <span className="team-name">
                {team.name}
                {idx === state.currentTeamIndex && ' 👉'}
              </span>
              <span className="team-stats">
                Position: {team.position} | Score: {team.score}
              </span>
            </div>
          ))}
        </div>

        <div className="info-card">
          <h2>Settings</h2>
          <p><strong>Dice Options:</strong> {state.settings.diceOptions.map(d => `d${d}`).join(', ')}</p>
          <p><strong>Minigame Selection:</strong> {state.settings.minigameSelection}</p>
          <p><strong>Enabled Minigames:</strong> {state.settings.enabledMinigameIds.length}</p>
          {state.settings.mapId && <p><strong>Map:</strong> {state.settings.mapId}</p>}
        </div>
      </div>

      <div className="placeholder-board">
        <p className="placeholder-text">
          🎲 Board visualization coming soon!
        </p>
        <p className="placeholder-subtext">
          This is a placeholder for the game board view.
          The game state is being tracked and persisted to localStorage.
        </p>
      </div>
    </div>
  )
}

export default HostBoard
