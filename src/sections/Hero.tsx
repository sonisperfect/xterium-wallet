import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { ArrowDown, ArrowDownToLine } from 'lucide-react'
import BlockchainHeading from '../components/BlockchainHeading'
import DecorativeBlock from '../components/DecorativeBlock'
import SplitReveal from '../components/SplitReveal'
import { AppIntroContent } from './AppShowcase'
import { StatsContent } from './Stats'
import { useAnchorScroll } from '../hooks/useAnchorScroll'
import { useRipple } from '../hooks/useRipple'
import { useIntro } from '../lib/intro'

const EASE = [0.22, 1, 0.36, 1] as const

function HeroSlide({ exit }: { exit?: MotionValue<number> }) {
  const reduced = useReducedMotion()
  const { revealed } = useIntro()
  const onAnchorClick = useAnchorScroll()
  const { onPointerDown, layer } = useRipple()
  return (
    <div className="hero-slide relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <div className="hero-texture pointer-events-none absolute inset-0" aria-hidden="true" />
      <DecorativeBlock top="20%" left="10%" size={26} color="var(--v-stone)" speed={1.1} spin floatDelay={-1.5} />
      <DecorativeBlock top="68%" left="88%" size={22} color="var(--v-dirt)" speed={0.8} spin floatDelay={-4} />
      <div className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-col items-center px-5 text-center sm:px-8">
        <div className="flex w-full flex-col items-center">
          <h1 className="font-display mt-4 w-full font-bold">
            <SplitReveal as="span" text="Your gateway to" className="hero-intro inline-block" active={revealed} />
            <BlockchainHeading exit={exit} />
          </h1>
          <motion.div className="hero-cta"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 12 }}
            transition={{ delay: reduced ? 0 : 0.55, duration: reduced ? 0 : 0.55, ease: EASE }}
          >
            <a
              href="#download"
              onClick={onAnchorClick}
              onPointerDown={onPointerDown}
              className="voxel-btn brand-gradient hero-download relative inline-flex items-center gap-3 overflow-hidden px-9 py-4 text-[15px] font-semibold text-white"
            >
              Download the wallet
              <ArrowDownToLine size={17} strokeWidth={1.8} aria-hidden="true" />
              {layer}
            </a>
          </motion.div>
        </div>
      </div>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : -6 }}
        transition={{ delay: reduced ? 0 : 1.3, duration: reduced ? 0 : 0.7, ease: EASE }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-mono2 text-[10px] uppercase text-faint">Scroll</span>
        <ArrowDown size={18} strokeWidth={1.6} className="hero-scroll-arrow text-primary/70" aria-hidden="true" />
      </motion.div>
    </div>
  )
}

function PinnedTabs() {
  const pinRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [statsVisible, setStatsVisible] = useState(false)
  const { revealed } = useIntro()
  const { scrollYProgress } = useScroll({ target: pinRef, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 32, mass: 0.5 })
  const exit = useTransform(progress, [0.13, 0.33], [0, 1])
  const heroOpacity = useTransform(progress, [0, 0.19, 0.33], [1, 1, 0])
  const heroY = useTransform(progress, [0.16, 0.33], [0, -36])
  const statsOpacity = useTransform(progress, [0.29, 0.4, 0.53, 0.66], [0, 1, 1, 0])
  const statsY = useTransform(progress, [0.29, 0.4, 0.53, 0.66], [52, 0, 0, -44])
  const statsScale = useTransform(progress, [0.29, 0.4], [0.96, 1])
  const appOpacity = useTransform(progress, [0.62, 0.75], [0, 1])
  const appY = useTransform(progress, [0.62, 0.75], [52, 0])

  useMotionValueEvent(progress, 'change', (value) => {
    const next = value < 0.31 ? 0 : value < 0.64 ? 1 : 2
    setActive((previous) => previous === next ? previous : next)
  })

  // Pinned layers intersect the viewport even while transparent. Start at a visible
  // opacity, and reset only once fully hidden so the outgoing numbers never jump.
  useMotionValueEvent(statsOpacity, 'change', (opacity) => {
    setStatsVisible((previous) => opacity >= 0.65 ? true : opacity <= 0.01 ? false : previous)
  })

  // Keep the scene mounted so reversing a scroll never restarts its entrance or WebGL context.
  return (
    <div ref={pinRef} className="snap-section relative" style={{ height: '300svh' }} data-hero-sequence>
      <div id="top" className="pointer-events-none absolute inset-x-0 top-0 h-px" aria-hidden="true" />
      <div className="hero-pin sticky top-0 overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="absolute inset-0"
          aria-hidden={active !== 0}
          inert={active !== 0}
          data-hero-slide="hero"
        >
          <HeroSlide exit={exit} />
        </motion.div>
        <motion.div
          style={{ opacity: statsOpacity, y: statsY, scale: statsScale }}
          className="absolute inset-0 flex items-center"
          aria-hidden={active !== 1}
          inert={active !== 1}
          data-hero-slide="stats"
        >
          <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8"><StatsContent active={statsVisible && revealed} /></div>
        </motion.div>
        <motion.div
          style={{ opacity: appOpacity, y: appY }}
          className="absolute inset-0 flex items-center"
          aria-hidden={active !== 2}
          inert={active !== 2}
          data-hero-slide="app"
        >
          <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8"><AppIntroContent /></div>
        </motion.div>
      </div>
    </div>
  )
}

export default function Hero() {
  const reduced = useReducedMotion()
  if (reduced) {
    return (
      <>
        <section id="top" className="hero-static snap-section relative">
          <HeroSlide />
        </section>
        <section id="stats" className="snap-section relative flex min-h-[100svh] items-center border-t border-line py-24">
          <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8"><StatsContent /></div>
        </section>
      </>
    )
  }
  return <PinnedTabs />
}
