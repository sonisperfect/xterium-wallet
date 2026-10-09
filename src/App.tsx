import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import Home from './pages/Home'
import Policies from './pages/Policies'

const PRIVACY = { pathname: '/policy', hash: '#privacy' }

/**
 * Each navigation lands where its link points: on the `#anchor` if it has
 * one, otherwise at the top of the new page rather than wherever the last
 * page was scrolled to. A new page cuts straight there; a move within the
 * same page scrolls smoothly. (A fresh load is already at the top; see
 * main.tsx.)
 */
function useLandingScroll() {
  const { pathname, hash, key } = useLocation()
  const previousPath = useRef<string | null>(null)
  useEffect(() => {
    const firstLoad = previousPath.current === null
    const samePage = previousPath.current === pathname
    previousPath.current = pathname
    // A frame later, once the new page is laid out and the browser has
    // clamped the old scroll position to it.
    const frame = requestAnimationFrame(() => {
      const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) target.scrollIntoView({ behavior: samePage ? 'smooth' : 'instant', block: 'start' })
      else if (!firstLoad && !samePage) window.scrollTo({ top: 0, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, key])
}

export default function App() {
  useLandingScroll()
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/policy" element={<Policies />} />
      {/* the old single-policy addresses */}
      <Route path="/privacy" element={<Navigate to={PRIVACY} replace />} />
      <Route path="/privacy-policy" element={<Navigate to={PRIVACY} replace />} />
    </Routes>
  )
}
