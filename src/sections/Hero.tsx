import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { ArrowDown, ArrowDownToLine } from 'lucide-react'
import BlockchainHeading from '../components/BlockchainHeading'
import DecorativeBlock from '../components/DecorativeBlock'
import SplitReveal from '../components/SplitReveal'
import { AppStage } from './AppShowcase'
import { useAnchorScroll } from '../hooks/useAnchorScroll'
import { useRipple } from '../hooks/useRipple'
import { useIntro } from '../lib/intro'
import { HERO_SEQUENCE, STAGE_SPRING, stepMidpoint } from '../lib/sequence'
import { StageProgressContext } from '../lib/stages'

const EASE = [0.22, 1, 0.36, 1] as const

function HeroSlide({ exit, mascot = false }: { exit?: MotionValue<number>; mascot?: boolean }) {
  const reduced = useReducedMotion()
  const { revealed } = useIntro()
  const onAnchorClick = useAnchorScroll()
  const { onPointerDown, layer } = useRipple()
  return (
    <div className="hero-slide relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      data-mascot={mascot || undefined}>
      <div className="hero-texture pointer-events-none absolute inset-0" aria-hidden="true" />
      {/* where the mascot rises from the bottom edge once scrolling starts */}
      {mascot && <span className="hero-mascot-dock" data-mascot-dock="hero" aria-hidden="true" />}
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

/** The hero's ink backdrop, split along a jagged seam that parts as the hero scrolls away. */
function Curtains({ progress }: { progress: MotionValue<number> }) {
  const left = useTransform(progress, HERO_SEQUENCE.curtains, ['0%', '-56%'])
  const right = useTransform(progress, HERO_SEQUENCE.curtains, ['0%', '56%'])
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <motion.div className="hero-curtain hero-curtain-left" style={{ x: left }} />
      <motion.div className="hero-curtain hero-curtain-right" style={{ x: right }} />
    </div>
  )
}

/**
 * The pinned hero → app sequence. BLOCKCHAIN. lifts out, the ink curtains
 * part onto the cream stage, and the phone rises to walk through the five
 * app screens. The heading canvas stays mounted throughout, so scrolling
 * back never restarts its entrance or its WebGL context.
 */
function HeroSequence() {
  const pinRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'hero' | 'app'>('hero')
  const [surface, setSurface] = useState<'ink' | 'cream'>('ink')
  const { revealed } = useIntro()
  const shared = useContext(StageProgressContext)
  const { scrollYProgress } = useScroll({ target: pinRef, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, STAGE_SPRING)
  const exit = useTransform(progress, HERO_SEQUENCE.heroExit, [0, 1])
  const heroOpacity = useTransform(progress, HERO_SEQUENCE.heroFade, [1, 0])
  const heroY = useTransform(progress, HERO_SEQUENCE.heroFade, [0, -40])

  useEffect(() => shared?.hero.set(progress.get()), [shared, progress])
  useMotionValueEvent(progress, 'change', (value) => {
    setPhase(value < HERO_SEQUENCE.heroUntil ? 'hero' : 'app')
    setSurface(value < HERO_SEQUENCE.surfaceSwitch ? 'ink' : 'cream')
    shared?.hero.set(value)
  })

  const seek = useCallback((index: number) => {
    const sequence = pinRef.current
    if (!sequence) return
    const top = sequence.getBoundingClientRect().top + window.scrollY
    const distance = sequence.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + distance * stepMidpoint(index), behavior: 'smooth' })
  }, [])

  return (
    <div ref={pinRef} className="hero-sequence" data-hero-sequence data-stage="hero" data-surface={surface}
      data-steps={HERO_SEQUENCE.steps.join(',')}>
      <div id="top" className="sequence-anchor" style={{ top: 0 }} aria-hidden="true" />
      <div id="showcase" className="sequence-anchor" style={{ top: `calc((100% - 100svh) * ${stepMidpoint(0)})` }} aria-hidden="true" />
      <div className="hero-pin sticky top-0 overflow-hidden">
        <div className="surface-cream absolute inset-0" aria-hidden="true" />
        <Curtains progress={progress} />
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="absolute inset-0 z-[1]"
          aria-hidden={phase !== 'hero'}
          inert={phase !== 'hero'}
          data-hero-slide="hero"
        >
          <HeroSlide exit={exit} mascot />
        </motion.div>
        <AppStage progress={progress} active={phase === 'app' && revealed} onSeek={seek} />
      </div>
    </div>
  )
}

export default function Hero({ staged }: { staged: boolean }) {
  if (staged) return <HeroSequence />
  return (
    <section id="top" className="hero-static surface-ink relative" data-surface="ink">
      <HeroSlide />
    </section>
  )
}
