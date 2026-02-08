/**
 * Beamer Mode Utility
 * Manages beamer mode preference in localStorage
 */

const BEAMER_MODE_KEY = 'beamerMode'

/**
 * Get current beamer mode state from localStorage
 */
export function getBeamerMode(): boolean {
  try {
    const stored = localStorage.getItem(BEAMER_MODE_KEY)
    return stored === 'true'
  } catch (error) {
    console.error('Error reading beamer mode from localStorage:', error)
    return false
  }
}

/**
 * Set beamer mode state in localStorage
 */
export function setBeamerMode(enabled: boolean): void {
  try {
    localStorage.setItem(BEAMER_MODE_KEY, enabled.toString())
  } catch (error) {
    console.error('Error saving beamer mode to localStorage:', error)
  }
}

/**
 * Toggle beamer mode state
 * Returns the new state
 */
export function toggleBeamerMode(): boolean {
  const currentState = getBeamerMode()
  const newState = !currentState
  setBeamerMode(newState)
  return newState
}

/**
 * Apply beamer mode class to body element
 */
export function applyBeamerMode(enabled: boolean): void {
  if (enabled) {
    document.body.classList.add('beamer')
  } else {
    document.body.classList.remove('beamer')
  }
}

/**
 * Initialize beamer mode from localStorage on app load
 */
export function initializeBeamerMode(): void {
  const enabled = getBeamerMode()
  applyBeamerMode(enabled)
}
