import { useEffect, useState } from 'react'
import './OverflowWarning.css'

/**
 * Development-only warning component that alerts when viewport is overflowing
 * Shows a red banner at the top of the screen on desktop/beamer layouts
 */
function OverflowWarning() {
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    // Only run in development mode
    if (import.meta.env.MODE !== 'development') {
      return
    }

    // Only check on desktop/beamer (not mobile)
    const isDesktop = window.innerWidth >= 768

    if (!isDesktop) {
      return
    }

    const checkOverflow = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const viewportHeight = window.innerHeight
      const overflow = scrollHeight > viewportHeight

      setHasOverflow(overflow)

      // Also log to console for debugging
      if (overflow) {
        console.warn(
          `⚠️ OVERFLOW DETECTED: scrollHeight (${scrollHeight}px) > innerHeight (${viewportHeight}px) by ${scrollHeight - viewportHeight}px`
        )
      }
    }

    // Check immediately and on resize/DOM changes
    checkOverflow()

    // Use ResizeObserver to detect layout changes
    const resizeObserver = new ResizeObserver(checkOverflow)
    resizeObserver.observe(document.body)

    // Also check on window resize
    window.addEventListener('resize', checkOverflow)

    // Recheck periodically (in case content changes dynamically)
    const interval = setInterval(checkOverflow, 1000)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', checkOverflow)
      clearInterval(interval)
    }
  }, [])

  // Don't render in production
  if (import.meta.env.MODE !== 'development') {
    return null
  }

  // Don't render on mobile
  if (window.innerWidth < 768) {
    return null
  }

  if (!hasOverflow) {
    return null
  }

  return (
    <div className="overflow-warning">
      ⚠️ OVERFLOW: Viewport exceeded by {document.documentElement.scrollHeight - window.innerHeight}px
    </div>
  )
}

export default OverflowWarning
