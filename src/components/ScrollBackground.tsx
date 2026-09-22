import { motion } from 'framer-motion'
import { useScrollTint } from '../hooks/useScrollTint'

export default function ScrollBackground() {
  const { color, reduced, fallback } = useScrollTint(1)

  if (reduced) {
    return <div className="fixed inset-0 -z-10" style={{ background: fallback }} aria-hidden="true" />
  }

  return <motion.div className="fixed inset-0 -z-10" style={{ backgroundColor: color }} aria-hidden="true" />
}
