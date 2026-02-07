import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../engine/useGameStore'
import type { Team } from '../types'
import './HostEnd.css'

function HostEnd() {
  const navigate = useNavigate()
  const { state, dispatch, resetSave } = useGameStore()

  // Calculate winner(s) based on win condition
  const getWinner = (): Team | null => {
    if (state.teams.length === 0) return null

    if (state.settings.winCondition === 'finish') {
      // Winner is the team with the highest position
      const sortedByPosition = [...state.teams].sort((a, b) => b.position - a.position)
      return sortedByPosition[0]
    } else {
      // Winner is the team with the highest score
      const sortedByScore = [...state.teams].sort((a, b) => b.score - a.score)
      return sortedByScore[0]
    }
  }

  // Get sorted scoreboard
  const getScoreboard = (): Team[] => {
    if (state.settings.winCondition === 'finish') {
      // Sort by position (desc), then by score (desc)
      return [...state.teams].sort((a, b) => {
        if (b.position !== a.position) return b.position - a.position
        return b.score - a.score
      })
    } else {
      // Sort by score (desc), then by position (desc)
      return [...state.teams].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return b.position - a.position
      })
    }
  }

  const winner = getWinner()
  const scoreboard = getScoreboard()

  const handleBackToBoard = () => {
    dispatch({ type: 'SET_PHASE', payload: 'board' })
    navigate('/host/board')
  }

  const handleNewGame = () => {
    resetSave()
    navigate('/host')
  }

  return (
    <div className="host-end">
      <div className="end-container">
        <header className="end-header">
          <h1>🏆 Game Over! 🏆</h1>
        </header>

        {winner && (
          <div className="winner-section">
            <h2>Winner:</h2>
            <div 
              className="winner-display"
              style={{ backgroundColor: winner.color }}
            >
              <div className="winner-name">{winner.name}</div>
              <div className="winner-stats">
                {state.settings.winCondition === 'finish' 
                  ? `Position: ${winner.position}` 
                  : `Score: ${winner.score}`}
              </div>
            </div>
          </div>
        )}

        <div className="scoreboard-section">
          <h2>Final Scoreboard</h2>
          <table className="scoreboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Score</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              {scoreboard.map((team, index) => (
                <tr 
                  key={team.id}
                  className={team.id === winner?.id ? 'winner-row' : ''}
                >
                  <td className="rank-cell">{index + 1}</td>
                  <td className="team-cell">
                    <div className="team-display">
                      <div 
                        className="team-color-dot" 
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="team-name">{team.name}</span>
                    </div>
                  </td>
                  <td className="score-cell">{team.score}</td>
                  <td className="position-cell">{team.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="end-actions">
          <button onClick={handleBackToBoard} className="btn-back-to-board">
            ← Back to Board
          </button>
          <button onClick={handleNewGame} className="btn-new-game">
            🎮 New Game
          </button>
        </div>
      </div>
    </div>
  )
}

export default HostEnd
