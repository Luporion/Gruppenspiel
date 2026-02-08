import { useEffect } from 'react'

/**
 * Check if the event target is an input field where we should not trigger hotkeys
 */
function isInputField(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  const isEditable = target.isContentEditable

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    isEditable
  )
}

export interface HotkeyConfig {
  key: string
  handler: () => void
  enabled?: boolean
  description?: string
}

/**
 * Custom hook for managing keyboard shortcuts
 * Automatically prevents hotkeys from triggering while typing in input fields
 */
export function useHotkeys(hotkeys: HotkeyConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger hotkeys when typing in input fields
      if (isInputField(event.target)) {
        return
      }

      const key = event.key.toLowerCase()

      // Find matching hotkey
      const hotkey = hotkeys.find(h => {
        const hotkeyKey = h.key.toLowerCase()
        const enabled = h.enabled !== false // Default to enabled if not specified
        return hotkeyKey === key && enabled
      })

      if (hotkey) {
        event.preventDefault()
        hotkey.handler()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [hotkeys])
}
