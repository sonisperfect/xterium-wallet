import { useCallback, type MouseEvent } from 'react'

/** Click handler for in-page `#anchor` links — smooth native scroll to the target. */
export function useAnchorScroll() {
  return useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href')
    if (!href?.startsWith('#')) return
    const el = document.querySelector(href)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
}
