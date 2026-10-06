import { useEffect, useState, type RefObject } from 'react'
import type { Surface } from '../lib/theme'

type NavSurface = { surface: Surface; staged: boolean }

/**
 * The surface under the fixed nav: the `data-surface` of whichever section
 * crosses the nav's midline. `staged` is true while a stage is pinned, so
 * it paints its own full-bleed colour behind the nav; once the stage
 * releases and scrolls away, its content passes under the nav like any
 * section's. Pinned stages rewrite their `data-surface` as they scroll, so
 * attribute changes resample too.
 */
export function useNavSurface(header: RefObject<HTMLElement | null>) {
  const [state, setState] = useState<NavSurface>({ surface: 'ink', staged: false })

  useEffect(() => {
    let frame = 0

    function sample() {
      frame = 0
      const bounds = header.current?.getBoundingClientRect()
      if (!bounds) return
      const line = bounds.top + bounds.height / 2
      for (const section of document.querySelectorAll<HTMLElement>('[data-surface]')) {
        const box = section.getBoundingClientRect()
        if (box.top > line || box.bottom <= line) continue
        const surface = section.dataset.surface as Surface
        const staged = section.hasAttribute('data-stage') && box.bottom >= window.innerHeight - 1
        setState((previous) => previous.surface === surface && previous.staged === staged ? previous : { surface, staged })
        return
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(sample)
    }

    schedule()
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-surface'] })
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [header])

  return state
}
