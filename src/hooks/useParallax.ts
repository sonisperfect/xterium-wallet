import type { RefObject } from 'react'
import { useScroll, useTransform, useReducedMotion, type MotionValue } from 'framer-motion'

/**
 * Depth-parallax helper: as `target` moves through the viewport, returns a
 * motion value drifting by `distance * (1 - speed)`. speed < 1 drifts
 * slower than scroll (reads as background), speed > 1 drifts faster (reads
 * as foreground). Returns a static 0 under prefers-reduced-motion.
 */
export function useParallax(target: RefObject<HTMLElement | null>, speed = 1, distance = 80): MotionValue<number> {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target, offset: ['start end', 'end start'] })
  const range = distance * (1 - speed)
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-range, range])
  return y
}
