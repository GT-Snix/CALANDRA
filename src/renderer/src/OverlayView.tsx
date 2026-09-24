import { useEffect, useRef, useState } from 'react'
import { toDateKey } from './lib/date'
import { getNow } from './lib/clock'
import { getOverlayMode } from './lib/overlayMode'
import { DayMode } from './overlay/DayMode'
import { NightMode } from './overlay/NightMode'

const POLL_INTERVAL_MS = 60_000
const RESIZE_DEBOUNCE_MS = 130

export default function OverlayView() {
  const [now, setNow] = useState(getNow)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(getNow()), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  // Measures the card's natural content height (unconstrained — see
  // overlay.css, nothing above this element forces height:100%) and asks
  // the main process to resize the actual BrowserWindow to match. Clamping
  // to min/max happens in main (ipc/overlay.ts); here we just debounce how
  // often we ask, so rapid content changes don't cause visible jitter.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null
    const scheduleMeasure = (): void => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const height = el.getBoundingClientRect().height
        window.daylog.resizeOverlay(Math.ceil(height))
      }, RESIZE_DEBOUNCE_MS)
    }

    // MutationObserver (DOM tree changes) is the primary trigger rather than
    // ResizeObserver: ResizeObserver delivery is tied to the compositor's
    // frame cadence, which browsers throttle for backgrounded/occluded
    // windows — exactly this overlay's situation much of the time.
    // MutationObserver fires as a microtask regardless, so it reliably
    // catches every task-list add/remove. ResizeObserver stays as a
    // fallback for size changes with no DOM mutation (e.g. text reflow).
    const mutationObserver = new MutationObserver(scheduleMeasure)
    mutationObserver.observe(el, { childList: true, subtree: true, characterData: true })

    const resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(el)

    scheduleMeasure()

    return () => {
      mutationObserver.disconnect()
      resizeObserver.disconnect()
      if (resizeTimeout) clearTimeout(resizeTimeout)
    }
  }, [])

  const result = getOverlayMode(now)

  return (
    <div className="overlay-root" ref={rootRef}>
      {result.mode === 'day' ? (
        <DayMode date={result.targetDate!} />
      ) : (
        <NightMode
          endingDay={result.endingDay!}
          endingDayLabel={result.endingDay === toDateKey(now) ? 'today' : 'yesterday'}
          planningDay={result.planningDay!}
        />
      )}
    </div>
  )
}
