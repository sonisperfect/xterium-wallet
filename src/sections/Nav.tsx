import { useState } from 'react'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import LogoMark from '../components/LogoMark'
import { useAnchorScroll } from '../hooks/useAnchorScroll'
import { useRipple } from '../hooks/useRipple'
import { useScrollTint } from '../hooks/useScrollTint'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const onAnchorClick = useAnchorScroll()
  const { color, reduced, fallback } = useScrollTint(0.85)
  const { onPointerDown, layer } = useRipple()

  useMotionValueEvent(scrollY, 'change', (latest) => setScrolled(latest > 24))

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? 'border-line' : 'border-transparent'
      }`}
    >
      {/* glass backdrop — its tint tracks the same scroll-driven color as
          ScrollBackground, so the nav feels like part of the same surface */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-md"
        style={{ backgroundColor: reduced ? fallback : color }}
        initial={false}
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
      />

      <nav className="flex w-full items-center justify-between px-5 pt-4 pb-2.5">
        <a href="#top" onClick={onAnchorClick} className="group flex items-center gap-2.5">
          <LogoMark size={30} className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
          <span className="font-display text-lg font-bold tracking-tight">XTERIUM</span>
          <span className="font-pixel hidden rounded-sm border border-line-soft px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-faint sm:inline-block">
            v2.0
          </span>
        </a>

        <a
          href="#download"
          onClick={onAnchorClick}
          onPointerDown={onPointerDown}
          className="voxel-btn brand-gradient relative inline-flex items-center gap-2.5 overflow-hidden px-6 py-2.5 text-[13px] font-semibold tracking-tight text-white"
        >
          Get the wallet
          {layer}
        </a>
      </nav>
    </header>
  )
}
