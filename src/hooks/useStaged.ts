import { useSyncExternalStore } from 'react'
import { useReducedMotion } from 'framer-motion'

// A pinned stage needs room for the phone, its card and the controls. Shorter
// viewports (landscape phones) get the flowing sections instead.
const STAGE_QUERY = '(min-height: 560px)'

function subscribe(callback: () => void) {
  const media = window.matchMedia(STAGE_QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

/** True when the home page runs its pinned, scroll-driven stages. */
export function useStaged() {
  const reduced = useReducedMotion()
  const tall = useSyncExternalStore(subscribe, () => window.matchMedia(STAGE_QUERY).matches, () => true)
  return !reduced && tall
}
