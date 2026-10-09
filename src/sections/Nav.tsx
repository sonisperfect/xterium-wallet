import { useRef, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import LogoMark from '../components/LogoMark'
import { useAnchorScroll } from '../hooks/useAnchorScroll'
import { useNavSurface } from '../hooks/useNavSurface'
import { useRipple } from '../hooks/useRipple'
import { LIGHT_SURFACES, SURFACE_RGB } from '../lib/theme'

export default function Nav() {
  const headerRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const onAnchorClick = useAnchorScroll()
  const { surface, staged } = useNavSurface(headerRef)
  const { onPointerDown, layer } = useRipple()

  useMotionValueEvent(scrollY, 'change', (latest) => setScrolled(latest > 24))

  return (
    <header ref={headerRef} className="site-nav fixed inset-x-0 top-0 z-50"
      data-tone={LIGHT_SURFACES.has(surface) ? 'light' : 'dark'} data-nav-surface={surface}>
      {/* glass in the surface's own colour, so content scrolling under the nav
          blurs into the section instead of a separate bar. Pinned stages keep
          their content clear of the nav and paint right up behind it. */}
      <div
        className="site-nav-glass"
        data-visible={scrolled && !staged}
        style={{ backgroundColor: `rgba(${SURFACE_RGB[surface]}, 0.85)` }}
        aria-hidden="true"
      />

      <nav className="flex w-full items-center justify-between px-5 pt-4 pb-2.5">
        <a href="#top" onClick={onAnchorClick} className="group flex items-center gap-2.5">
          {/* the mascot grows out of this logo as the page opens */}
          <span className="inline-flex" data-mascot-dock="nav">
            <LogoMark size={30} className="nav-logo transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">XTERIUM</span>
          <span className="nav-chip font-pixel hidden rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] sm:inline-block">
            v2.0
          </span>
        </a>

        <a
          href="#download"
          onClick={onAnchorClick}
          onPointerDown={onPointerDown}
          className="voxel-btn nav-cta relative inline-flex items-center gap-2.5 overflow-hidden px-6 py-2.5 text-[13px] font-semibold tracking-tight"
        >
          Get the wallet
          {layer}
        </a>
      </nav>
    </header>
  )
}
