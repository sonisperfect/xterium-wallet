import { useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { BG_DEEP_RGB, BG_RGB, PANEL_2_RGB, PANEL_RGB } from '../lib/theme'

// scroll progress through the whole page -> a slowly drifting tint, shared
// by ScrollBackground (the full-page backdrop) and Nav (its glass overlay),
// so the two stay in lockstep instead of drifting out of sync
const STOPS = [0, 0.12, 0.26, 0.4, 0.52, 0.64, 0.76, 0.88, 1]
const RGB_STOPS = [
  BG_RGB,
  BG_RGB,
  PANEL_RGB,
  PANEL_2_RGB,
  PANEL_RGB,
  PANEL_2_RGB,
  BG_DEEP_RGB,
  BG_RGB,
  BG_DEEP_RGB,
]

export function useScrollTint(alpha = 1) {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const colors = RGB_STOPS.map((rgb) => `rgba(${rgb}, ${alpha})`)
  const color = useTransform(scrollYProgress, STOPS, colors)
  return { color, reduced, fallback: colors[0] }
}
