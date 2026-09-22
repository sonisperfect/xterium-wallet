import { motion, useReducedMotion, useScroll } from 'framer-motion'

/** Thin bar across the very top of the viewport tracking scroll progress
 * through the whole page. Skipped entirely under reduced motion. */
export default function ScrollProgressBar() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()

  if (reduced) return null

  return (
    <motion.div
      className="brand-gradient fixed left-0 top-0 z-[60] h-[3px] w-full origin-left"
      style={{ scaleX: scrollYProgress }}
      aria-hidden="true"
    />
  )
}
