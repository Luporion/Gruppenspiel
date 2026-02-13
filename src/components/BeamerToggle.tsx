import { useState, useEffect } from 'react'
import { getBeamerMode, toggleBeamerMode, applyBeamerMode } from '../utils/beamerMode'
import './BeamerToggle.css'

function BeamerToggle() {
  const [isBeamerMode, setIsBeamerMode] = useState(false)

  useEffect(() => {
    // Initialize from localStorage
    setIsBeamerMode(getBeamerMode())
  }, [])

  const handleToggle = () => {
    const newState = toggleBeamerMode()
    setIsBeamerMode(newState)
    applyBeamerMode(newState)
    // Dispatch custom event for other components to react to beamer mode changes
    window.dispatchEvent(new CustomEvent('beamerModeChanged', { detail: { enabled: newState } }))
  }

  return (
    <button
      onClick={handleToggle}
      className={`beamer-toggle ${isBeamerMode ? 'beamer-toggle--active' : ''}`}
      title={isBeamerMode ? 'Disable Beamer Mode' : 'Enable Beamer Mode'}
    >
      <span className="beamer-toggle__icon">📽️</span>
      <span className="beamer-toggle__text">
        Beamer Mode: {isBeamerMode ? 'ON' : 'OFF'}
      </span>
    </button>
  )
}

export default BeamerToggle
