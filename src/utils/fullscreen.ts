/**
 * Fullscreen API Utility
 * Handles fullscreen mode for the application
 */

// Type definitions for vendor-prefixed fullscreen APIs
interface DocumentWithFullscreen extends Document {
  webkitFullscreenEnabled?: boolean
  mozFullScreenEnabled?: boolean
  msFullscreenEnabled?: boolean
  webkitFullscreenElement?: Element
  mozFullScreenElement?: Element
  msFullscreenElement?: Element
  webkitExitFullscreen?: () => Promise<void>
  mozCancelFullScreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
}

interface ElementWithFullscreen extends Element {
  webkitRequestFullscreen?: () => Promise<void>
  mozRequestFullScreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
}

/**
 * Check if the browser supports the Fullscreen API
 */
export function isFullscreenSupported(): boolean {
  const doc = document as DocumentWithFullscreen
  return !!(
    document.fullscreenEnabled ||
    doc.webkitFullscreenEnabled ||
    doc.mozFullScreenEnabled ||
    doc.msFullscreenEnabled
  )
}

/**
 * Check if the document is currently in fullscreen mode
 */
export function isFullscreen(): boolean {
  const doc = document as DocumentWithFullscreen
  return !!(
    document.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  )
}

/**
 * Request fullscreen mode
 */
export async function requestFullscreen(): Promise<void> {
  const elem = document.documentElement as ElementWithFullscreen

  try {
    if (elem.requestFullscreen) {
      await elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) {
      await elem.webkitRequestFullscreen()
    } else if (elem.mozRequestFullScreen) {
      await elem.mozRequestFullScreen()
    } else if (elem.msRequestFullscreen) {
      await elem.msRequestFullscreen()
    }
  } catch (error) {
    console.error('Error requesting fullscreen:', error)
    throw error
  }
}

/**
 * Exit fullscreen mode
 */
export async function exitFullscreen(): Promise<void> {
  const doc = document as DocumentWithFullscreen
  
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen()
    } else if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen()
    } else if (doc.msExitFullscreen) {
      await doc.msExitFullscreen()
    }
  } catch (error) {
    console.error('Error exiting fullscreen:', error)
    throw error
  }
}

/**
 * Toggle fullscreen mode
 */
export async function toggleFullscreen(): Promise<void> {
  if (isFullscreen()) {
    await exitFullscreen()
  } else {
    await requestFullscreen()
  }
}
