import { useState, type PointerEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

let idCounter = 0

/** Click/tap ripple feedback for buttons. Spread `onPointerDown` on the
 * (relative, overflow-hidden) trigger element and render `layer` as its
 * last child. No-op under prefers-reduced-motion. */
export function useRipple() {
  const reduced = useReducedMotion()
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([])

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.8
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const id = idCounter++
    setRipples((r) => [...r, { id, x, y, size }])
    window.setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 650)
  }

  const layer = (
    <AnimatePresence>
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-white/35"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          initial={{ scale: 0, opacity: 0.55 }}
          animate={{ scale: 1, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </AnimatePresence>
  )

  return { onPointerDown, layer }
}
