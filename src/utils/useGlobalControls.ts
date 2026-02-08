import { toggleBeamerMode, applyBeamerMode } from './beamerMode'
import { toggleFullscreen, exitFullscreen, isFullscreen } from './fullscreen'

/**
 * Custom hook that provides handlers for global controls (beamer mode and fullscreen)
 * These handlers can be used with buttons or keyboard shortcuts
 */
export function useGlobalControls() {
  // Handle beamer mode toggle
  const handleToggleBeamer = () => {
    const newState = toggleBeamerMode()
    applyBeamerMode(newState)
  }

  // Handle fullscreen toggle
  const handleToggleFullscreen = async () => {
    try {
      await toggleFullscreen()
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error)
    }
  }

  // Handle exit fullscreen
  const handleExitFullscreen = async () => {
    if (isFullscreen()) {
      try {
        await exitFullscreen()
      } catch (error) {
        console.error('Failed to exit fullscreen:', error)
      }
    }
  }

  return {
    handleToggleBeamer,
    handleToggleFullscreen,
    handleExitFullscreen
  }
}
