import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../engine/useGameStore'
import { useState, useEffect, useRef, useCallback } from 'react'
import { loadMinigame, loadMap } from '../utils/dataLoader'
import { checkWinConditions } from '../utils/winConditions'
import type { MinigameDefinition, PhysicalMinigameDefinition, QuizMinigameDefinition, MapDefinition } from '../types'
import './HostMinigame.css'

// Default points constants
const DEFAULT_WIN_POINTS = 10
const DEFAULT_CORRECT_POINTS = 10

function HostMinigame() {
  const navigate = useNavigate()
  const { state, dispatch } = useGameStore()
  const [minigame, setMinigame] = useState<MinigameDefinition | null>(null)
  const [minigameError, setMinigameError] = useState<string | null>(null)
  const [map, setMap] = useState<MapDefinition | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedWinnerTeamId, setSelectedWinnerTeamId] = useState<string>('')
  const [manualPoints, setManualPoints] = useState<number>(0)
  const [selectedCorrectTeams, setSelectedCorrectTeams] = useState<Set<string>>(new Set())
  const timerRef = useRef<number | null>(null)

  // Helper function to safely abort minigame and return to board
  const abortToBoard = useCallback(() => {
    dispatch({ type: 'END_MINIGAME' })
    setTimerRunning(false)
    navigate('/host/board', { replace: true })
  }, [dispatch, navigate])

  // Load minigame when component mounts or activeMinigameId changes
  useEffect(() => {
    if (state.activeMinigameId) {
      loadMinigame(state.activeMinigameId)
        .then(loadedMinigame => {
          setMinigame(loadedMinigame)
          setTimeLeft(loadedMinigame.timeLimitSec)
          setMinigameError(null)
        })
        .catch(error => {
          console.error('Error loading minigame:', error)
          setMinigameError(error.message)
        })
    }
    // Note: Don't auto-redirect if no activeMinigameId - show fallback UI instead
  }, [state.activeMinigameId])

  // Load map for win condition checking
  useEffect(() => {
    if (state.settings.mapId) {
      loadMap(state.settings.mapId)
        .then(loadedMap => setMap(loadedMap))
        .catch(error => console.error('Error loading map:', error))
    }
  }, [state.settings.mapId])

  // Redirect to board if phase changes away from minigame (but only if we had an active minigame before)
  useEffect(() => {
    if (state.phase !== 'minigame' && state.activeMinigameId) {
      navigate('/host/board')
    }
  }, [state.phase, state.activeMinigameId, navigate])

  // Timer effect
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = window.setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false)
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timerRunning, timeLeft])

  const handleStartTimer = () => {
    setTimerRunning(true)
  }

  const handleStopTimer = () => {
    setTimerRunning(false)
  }

  const handleResetTimer = () => {
    setTimerRunning(false)
    setTimeLeft(minigame?.timeLimitSec || 0)
  }

  const handleFinishPhysical = () => {
    if (!minigame || minigame.type !== 'physical') return

    // Award points based on winner selection or manual points
    if (selectedWinnerTeamId) {
      const winPoints = minigame.scoring.win ?? DEFAULT_WIN_POINTS
      const team = state.teams.find(t => t.id === selectedWinnerTeamId)
      if (team) {
        dispatch({
          type: 'UPDATE_SCORE',
          payload: { teamId: team.id, score: team.score + winPoints }
        })
      }
    } else if (manualPoints !== 0) {
      // Award manual points to current team
      const currentTeam = state.teams[state.currentTeamIndex]
      if (currentTeam) {
        dispatch({
          type: 'UPDATE_SCORE',
          payload: { teamId: currentTeam.id, score: currentTeam.score + manualPoints }
        })
      }
    }

    // Return to board
    finishMinigame()
  }

  const handleFinishQuiz = () => {
    if (!minigame || minigame.type !== 'quiz') return

    // Award points to selected correct teams
    const correctPoints = minigame.scoring.correct ?? DEFAULT_CORRECT_POINTS
    selectedCorrectTeams.forEach(teamId => {
      const team = state.teams.find(t => t.id === teamId)
      if (team) {
        dispatch({
          type: 'UPDATE_SCORE',
          payload: { teamId: team.id, score: team.score + correctPoints }
        })
      }
    })

    // Return to board
    finishMinigame()
  }

  const finishMinigame = () => {
    // End minigame and advance to next team
    dispatch({ type: 'END_MINIGAME' })
    dispatch({ type: 'NEXT_TEAM' })

    // Check win conditions after finishing minigame
    if (checkWinConditions(state.settings, state.teams, state.round, map)) {
      dispatch({ type: 'END_GAME' })
      navigate('/host/end')
    } else {
      navigate('/host/board')
    }
  }

  const toggleCorrectTeam = (teamId: string) => {
    const newSet = new Set(selectedCorrectTeams)
    if (newSet.has(teamId)) {
      newSet.delete(teamId)
    } else {
      newSet.add(teamId)
    }
    setSelectedCorrectTeams(newSet)
  }

  // Show fallback UI if no active minigame is selected
  if (!state.activeMinigameId) {
    return (
      <div className="host-minigame">
        <div className="error-message">
          ℹ️ No active minigame selected
          <p className="error-message-explanation">
            Return to the game board to continue playing. Minigames are triggered when landing on a minigame tile.
          </p>
        </div>
        <button onClick={abortToBoard} className="btn-back">
          ← Back to Board
        </button>
      </div>
    )
  }

  if (minigameError) {
    return (
      <div className="host-minigame">
        <div className="error-message">
          ⚠️ Error loading minigame: {minigameError}
        </div>
        <button onClick={abortToBoard} className="btn-back">
          ← Back to Board
        </button>
      </div>
    )
  }

  if (!minigame) {
    return (
      <div className="host-minigame">
        <div className="loading-message">Loading minigame...</div>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="host-minigame">
      <header className="minigame-header">
        <h1>🎮 {minigame.name}</h1>
        <div className="timer-display">
          <span className="timer-label">Time:</span>
          <span className={`timer-value ${timeLeft < 10 ? 'timer-warning' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </header>

      <div className="minigame-container">
        {minigame.description && (
          <div className="minigame-description">
            <p>{minigame.description}</p>
          </div>
        )}

        <div className="timer-controls">
          <button onClick={handleStartTimer} disabled={timerRunning} className="btn-timer">
            ▶️ Start Timer
          </button>
          <button onClick={handleStopTimer} disabled={!timerRunning} className="btn-timer">
            ⏸️ Stop Timer
          </button>
          <button onClick={handleResetTimer} className="btn-timer">
            🔄 Reset Timer
          </button>
        </div>

        {minigame.type === 'physical' && (
          <PhysicalMinigameUI
            minigame={minigame as PhysicalMinigameDefinition}
            teams={state.teams}
            selectedWinnerTeamId={selectedWinnerTeamId}
            setSelectedWinnerTeamId={setSelectedWinnerTeamId}
            manualPoints={manualPoints}
            setManualPoints={setManualPoints}
            onFinish={handleFinishPhysical}
          />
        )}

        {minigame.type === 'quiz' && (
          <QuizMinigameUI
            minigame={minigame as QuizMinigameDefinition}
            teams={state.teams}
            showAnswer={showAnswer}
            setShowAnswer={setShowAnswer}
            selectedCorrectTeams={selectedCorrectTeams}
            toggleCorrectTeam={toggleCorrectTeam}
            onFinish={handleFinishQuiz}
          />
        )}
      </div>
    </div>
  )
}

interface PhysicalMinigameUIProps {
  minigame: PhysicalMinigameDefinition
  teams: Array<{ id: string; name: string; color: string }>
  selectedWinnerTeamId: string
  setSelectedWinnerTeamId: (id: string) => void
  manualPoints: number
  setManualPoints: (points: number) => void
  onFinish: () => void
}

function PhysicalMinigameUI({
  minigame,
  teams,
  selectedWinnerTeamId,
  setSelectedWinnerTeamId,
  manualPoints,
  setManualPoints,
  onFinish
}: PhysicalMinigameUIProps) {
  return (
    <div className="physical-minigame">
      <div className="minigame-rules">
        <h2>Rules:</h2>
        <ul>
          {minigame.rules.map((rule, idx) => (
            <li key={idx}>{rule}</li>
          ))}
        </ul>
      </div>

      <div className="winner-selection">
        <h2>Select Winner:</h2>
        <select
          value={selectedWinnerTeamId}
          onChange={e => setSelectedWinnerTeamId(e.target.value)}
          className="team-select"
        >
          <option value="">-- Select Team --</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name} (+{minigame.scoring.win ?? DEFAULT_WIN_POINTS} points)
            </option>
          ))}
        </select>
      </div>

      <div className="manual-points">
        <h2>Or Enter Manual Points:</h2>
        <input
          type="number"
          value={manualPoints}
          onChange={e => {
            const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
            setManualPoints(isNaN(value) ? 0 : value)
          }}
          placeholder="0"
          className="points-input"
        />
        <span className="points-hint">
          (for current team)
        </span>
      </div>

      <button onClick={onFinish} className="btn-finish">
        ✅ Finish & Return to Board
      </button>
    </div>
  )
}

interface QuizMinigameUIProps {
  minigame: QuizMinigameDefinition
  teams: Array<{ id: string; name: string; color: string }>
  showAnswer: boolean
  setShowAnswer: (show: boolean) => void
  selectedCorrectTeams: Set<string>
  toggleCorrectTeam: (teamId: string) => void
  onFinish: () => void
}

function QuizMinigameUI({
  minigame,
  teams,
  showAnswer,
  setShowAnswer,
  selectedCorrectTeams,
  toggleCorrectTeam,
  onFinish
}: QuizMinigameUIProps) {
  return (
    <div className="quiz-minigame">
      <div className="quiz-question">
        <h2>Question:</h2>
        <p className="question-text">{minigame.question}</p>
      </div>

      <div className="quiz-options">
        <h2>Options:</h2>
        <ul>
          {minigame.options.map((option, idx) => (
            <li
              key={idx}
              className={`option ${showAnswer && idx === minigame.correctIndex ? 'correct-option' : ''}`}
            >
              {String.fromCharCode(65 + idx)}. {option}
              {showAnswer && idx === minigame.correctIndex && ' ✓'}
            </li>
          ))}
        </ul>
      </div>

      {!showAnswer && (
        <button onClick={() => setShowAnswer(true)} className="btn-reveal">
          👁️ Reveal Answer
        </button>
      )}

      {showAnswer && (
        <div className="correct-answer-display">
          <p>
            <strong>Correct Answer:</strong>{' '}
            {String.fromCharCode(65 + minigame.correctIndex)}. {minigame.options[minigame.correctIndex]}
          </p>
        </div>
      )}

      <div className="team-selection">
        <h2>Which teams answered correctly?</h2>
        <div className="team-checkboxes">
          {teams.map(team => (
            <label key={team.id} className="team-checkbox">
              <input
                type="checkbox"
                checked={selectedCorrectTeams.has(team.id)}
                onChange={() => toggleCorrectTeam(team.id)}
              />
              <span style={{ color: team.color }}>{team.name}</span>
              <span className="points-hint">
                (+{minigame.scoring.correct ?? DEFAULT_CORRECT_POINTS} points)
              </span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={onFinish} className="btn-finish">
        ✅ Finish & Return to Board
      </button>
    </div>
  )
}

export default HostMinigame
