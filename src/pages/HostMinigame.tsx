import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../engine/useGameStore'
import { useState, useEffect, useRef, useCallback } from 'react'
import { loadMinigame, loadMinigames, loadMap } from '../utils/dataLoader'
import { checkWinConditions } from '../utils/winConditions'
import type { MinigameDefinition, PhysicalMinigameDefinition, QuizMinigameDefinition, MapDefinition } from '../types'
import BeamerToggle from '../components/BeamerToggle'
import FullscreenToggle from '../components/FullscreenToggle'
import { getBeamerMode } from '../utils/beamerMode'
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
  const [availableMinigames, setAvailableMinigames] = useState<MinigameDefinition[]>([])
  const [loadingMinigames, setLoadingMinigames] = useState(false)
  const timerRef = useRef<number | null>(null)
  const beamerRootRef = useRef<HTMLDivElement | null>(null)

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

  // Load available minigames for manual selection mode
  useEffect(() => {
    if (!state.activeMinigameId && state.settings.minigameSelection === 'manual' && state.phase === 'minigame') {
      const enabledIds = state.settings.enabledMinigameIds || []
      if (enabledIds.length > 0) {
        setLoadingMinigames(true)
        loadMinigames(enabledIds)
          .then(minigames => {
            setAvailableMinigames(minigames)
            setLoadingMinigames(false)
          })
          .catch(error => {
            console.error('Error loading minigames:', error)
            setMinigameError(error.message)
            setLoadingMinigames(false)
          })
      }
    }
  }, [state.activeMinigameId, state.settings.minigameSelection, state.settings.enabledMinigameIds, state.phase])

  // Load map for win condition checking
  // Prefer generated map from state, fall back to loading from file
  useEffect(() => {
    if (state.map) {
      setMap(state.map)
    } else if (state.settings.mapId) {
      loadMap(state.settings.mapId)
        .then(loadedMap => setMap(loadedMap))
        .catch(error => console.error('Error loading map:', error))
    }
  }, [state.map, state.settings.mapId])

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

  // Beamer Mode Auto-Scaling Effect
  // Ensures the entire page fits within 100vh when beamer mode is active
  useEffect(() => {
    const applyBeamerScaling = () => {
      const isBeamerMode = getBeamerMode()
      const rootElement = beamerRootRef.current

      if (!rootElement) return

      if (isBeamerMode) {
        // Reset scale to measure actual height
        rootElement.style.transform = 'none'
        rootElement.style.transformOrigin = 'top center'

        // Small delay to ensure DOM has updated
        requestAnimationFrame(() => {
          const contentHeight = rootElement.scrollHeight
          const viewportHeight = window.innerHeight

          // Only scale down if content exceeds viewport
          if (contentHeight > viewportHeight) {
            const scaleFactor = viewportHeight / contentHeight
            rootElement.style.transform = `scale(${scaleFactor})`
          } else {
            rootElement.style.transform = 'none'
          }
        })
      } else {
        // Remove scaling when beamer mode is off
        rootElement.style.transform = 'none'
      }
    }

    // Apply scaling on mount, when beamer mode changes, or when content changes
    applyBeamerScaling()

    // Listen for beamer mode changes via storage events (from BeamerToggle)
    const handleBeamerChange = () => {
      applyBeamerScaling()
    }

    window.addEventListener('storage', handleBeamerChange)
    // Also listen for custom event from BeamerToggle if it dispatches one
    window.addEventListener('beamerModeChanged', handleBeamerChange)

    // Reapply on window resize
    window.addEventListener('resize', applyBeamerScaling)

    return () => {
      window.removeEventListener('storage', handleBeamerChange)
      window.removeEventListener('beamerModeChanged', handleBeamerChange)
      window.removeEventListener('resize', applyBeamerScaling)
    }
  }, [minigame, timeLeft, selectedWinnerTeamId, selectedCorrectTeams, showAnswer])

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

  const handleSelectMinigame = (minigameId: string) => {
    dispatch({ type: 'SET_ACTIVE_MINIGAME', payload: minigameId })
  }

  const handlePickRandomMinigame = () => {
    const enabledIds = state.settings.enabledMinigameIds || []
    if (enabledIds.length > 0) {
      const randomId = enabledIds[Math.floor(Math.random() * enabledIds.length)]
      dispatch({ type: 'SET_ACTIVE_MINIGAME', payload: randomId })
    }
  }

  // Show fallback UI if no active minigame is selected
  if (!state.activeMinigameId) {
    // Manual selection mode: show minigame selection UI
    if (state.settings.minigameSelection === 'manual' && state.phase === 'minigame') {
      const enabledIds = state.settings.enabledMinigameIds || []
      
      if (loadingMinigames) {
        return (
          <div className="host-minigame">
            <div className="loading-message">Loading minigames...</div>
          </div>
        )
      }

      if (enabledIds.length === 0) {
        return (
          <div className="host-minigame">
            <div className="error-message">
              ⚠️ No minigames enabled
              <p className="error-message-explanation">
                Please configure at least one minigame in the game settings.
              </p>
            </div>
            <button onClick={abortToBoard} className="btn-back">
              ← Back to Board
            </button>
          </div>
        )
      }

      return (
        <div className="host-minigame">
          <header className="minigame-header">
            <h1>🎮 Choose a Minigame</h1>
            <div className="minigame-header-controls">
              <BeamerToggle />
              <FullscreenToggle />
            </div>
          </header>

          <div className="minigame-selection-container">
            <div className="minigame-selection-list">
              {availableMinigames.map(mg => (
                <div key={mg.id} className="minigame-selection-card">
                  <div className="minigame-selection-info">
                    <h2>
                      {mg.type === 'physical' ? '🏃' : '❓'} {mg.name}
                    </h2>
                    {mg.description && <p className="minigame-selection-description">{mg.description}</p>}
                    <p className="minigame-selection-meta">
                      Type: <strong>{mg.type === 'physical' ? 'Physical' : 'Quiz'}</strong> | 
                      Time: <strong>{Math.floor(mg.timeLimitSec / 60)}:{(mg.timeLimitSec % 60).toString().padStart(2, '0')}</strong>
                    </p>
                  </div>
                  <button 
                    onClick={() => handleSelectMinigame(mg.id)} 
                    className="btn-select-minigame"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>

            <div className="minigame-selection-actions">
              <button onClick={handlePickRandomMinigame} className="btn-pick-random">
                🎲 Pick Random
              </button>
              <button onClick={abortToBoard} className="btn-back">
                ← Back to Board
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Default fallback for other cases
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
    <div className="host-minigame" ref={beamerRootRef}>
      <header className="minigame-header">
        <h1>🎮 {minigame.name}</h1>
        <div className="minigame-header-controls">
          <BeamerToggle />
          <FullscreenToggle />
          <div className="timer-display">
            <span className="timer-label">Time:</span>
            <span className={`timer-value ${timeLeft < 10 ? 'timer-warning' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      <div className="minigame-layout">
        <div className="minigame-main">
          {minigame.description && (
            <div className="minigame-description">
              <p>{minigame.description}</p>
            </div>
          )}

          {minigame.type === 'physical' && (
            <PhysicalMinigameMainContent
              minigame={minigame as PhysicalMinigameDefinition}
            />
          )}

          {minigame.type === 'quiz' && (
            <QuizMinigameMainContent
              minigame={minigame as QuizMinigameDefinition}
              showAnswer={showAnswer}
              setShowAnswer={setShowAnswer}
            />
          )}
        </div>

        <div className="minigame-side">
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
            <PhysicalMinigameSideContent
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
            <QuizMinigameSideContent
              minigame={minigame as QuizMinigameDefinition}
              teams={state.teams}
              selectedCorrectTeams={selectedCorrectTeams}
              toggleCorrectTeam={toggleCorrectTeam}
              onFinish={handleFinishQuiz}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Physical Minigame - Main Content (Rules)
interface PhysicalMinigameMainContentProps {
  minigame: PhysicalMinigameDefinition
}

function PhysicalMinigameMainContent({ minigame }: PhysicalMinigameMainContentProps) {
  return (
    <div className="minigame-rules">
      <h2>Rules:</h2>
      <ul>
        {minigame.rules.map((rule, idx) => (
          <li key={idx}>{rule}</li>
        ))}
      </ul>
    </div>
  )
}

// Physical Minigame - Side Content (Winner Selection)
interface PhysicalMinigameSideContentProps {
  minigame: PhysicalMinigameDefinition
  teams: Array<{ id: string; name: string; color: string }>
  selectedWinnerTeamId: string
  setSelectedWinnerTeamId: (id: string) => void
  manualPoints: number
  setManualPoints: (points: number) => void
  onFinish: () => void
}

function PhysicalMinigameSideContent({
  minigame,
  teams,
  selectedWinnerTeamId,
  setSelectedWinnerTeamId,
  manualPoints,
  setManualPoints,
  onFinish
}: PhysicalMinigameSideContentProps) {
  return (
    <>
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
    </>
  )
}

// Quiz Minigame - Main Content (Question and Options)
interface QuizMinigameMainContentProps {
  minigame: QuizMinigameDefinition
  showAnswer: boolean
  setShowAnswer: (show: boolean) => void
}

function QuizMinigameMainContent({
  minigame,
  showAnswer,
  setShowAnswer
}: QuizMinigameMainContentProps) {
  return (
    <>
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
    </>
  )
}

// Quiz Minigame - Side Content (Team Selection)
interface QuizMinigameSideContentProps {
  minigame: QuizMinigameDefinition
  teams: Array<{ id: string; name: string; color: string }>
  selectedCorrectTeams: Set<string>
  toggleCorrectTeam: (teamId: string) => void
  onFinish: () => void
}

function QuizMinigameSideContent({
  minigame,
  teams,
  selectedCorrectTeams,
  toggleCorrectTeam,
  onFinish
}: QuizMinigameSideContentProps) {
  return (
    <>
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
    </>
  )
}

export default HostMinigame
