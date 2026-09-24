import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useParallax } from '../hooks/useParallax'

/** A single small isometric cube, drifting at its own depth as the page scrolls. */
export default function DecorativeBlock({
  top,
  left,
  size = 34,
  color = 'var(--v-grass)',
  speed = 0.85,
  spin = false,
  floatDelay = 0,
  className = '',
}: {
  top: string
  left: string
  size?: number
  color?: string
  speed?: number
  spin?: boolean
  floatDelay?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const y = useParallax(ref, speed, 40)

  return (
    <motion.div
      ref={ref}
      style={{ top, left, y, willChange: 'transform' }}
      className={`pointer-events-none absolute hidden lg:block ${className}`}
      aria-hidden="true"
    >
      <motion.div
        animate={
          reduced
            ? undefined
            : { y: [0, -9, 0], rotate: [0, 1.5, -1, 0], scale: [1, 1.035, 1] }
        }
        transition={
          reduced
            ? undefined
            : { duration: 7, delay: floatDelay, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <motion.div
          animate={spin && !reduced ? { rotate: 360 } : undefined}
          transition={spin && !reduced ? { duration: 18, repeat: Infinity, ease: 'linear' } : undefined}
        >
        <svg width={size} height={size * 0.9} viewBox="-30 -28 60 56">
          <polygon points="0,-28 26,-14 0,0 -26,-14" fill={color} opacity="0.9" />
          <polygon points="-26,-14 0,0 0,28 -26,14" fill={color} opacity="0.55" />
          <polygon points="26,-14 0,0 0,28 26,14" fill={color} opacity="0.32" />
        </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
