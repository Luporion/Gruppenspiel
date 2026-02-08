import { useState, useEffect } from 'react'
import { isFullscreen, toggleFullscreen, isFullscreenSupported } from '../utils/fullscreen'
import './FullscreenToggle.css'

function FullscreenToggle() {
  const [isFullscreenMode, setIsFullscreenMode] = useState(false)
  const supported = isFullscreenSupported()

  useEffect(() => {
    // Update state when fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreenMode(isFullscreen())
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleToggle = async () => {
    try {
      await toggleFullscreen()
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error)
    }
  }

  if (!supported) {
    return null
  }

  return (
    <button
      onClick={handleToggle}
      className="fullscreen-toggle"
      title={isFullscreenMode ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    >
      <span className="fullscreen-toggle__icon">
        {isFullscreenMode ? '🗗' : '⛶'}
      </span>
      <span className="fullscreen-toggle__text">
        {isFullscreenMode ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      </span>
    </button>
  )
}

export default FullscreenToggle
