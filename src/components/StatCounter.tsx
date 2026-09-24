import { useEffect, useRef } from 'react'
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'

/** Counts on first viewport entry, or replays when a controlled slide becomes active. */
export default function StatCounter({
  value,
  suffix = '',
  decimals = 0,
  active,
  delay = 0,
}: {
  value: number
  suffix?: string
  decimals?: number
  active?: boolean
  delay?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduced = useReducedMotion()
  const visible = active ?? inView
  const count = useMotionValue(reduced ? value : 0)
  const display = useTransform(count, (current) => current.toFixed(decimals) + suffix)

  useEffect(() => {
    count.set(reduced ? value : 0)
    if (!visible || reduced) return
    const controls = animate(count, value, {
      delay,
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    })
    return () => controls.stop()
  }, [visible, reduced, value, delay, count])

  return (
    <motion.span ref={ref}>{display}</motion.span>
  )
}
