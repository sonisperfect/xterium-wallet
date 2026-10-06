import { useId, useLayoutEffect, useState } from 'react'
import {
  AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform,
  type MotionStyle, type MotionValue,
} from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import SectionMarker from '../components/SectionMarker'
import DecorativeBlock from '../components/DecorativeBlock'
import { Reveal } from '../components/Reveal'
import SegmentedReveal from '../components/SegmentedReveal'
import SplitReveal from '../components/SplitReveal'
import { HERO_SEQUENCE, stepAt } from '../lib/sequence'
import { shardPolygon } from '../lib/shard'

const EASE = [0.22, 1, 0.36, 1] as const
const WIPE_EASE = [0.65, 0, 0.35, 1] as const
// How far the magenta shard runs ahead of the incoming screen.
const WIPE_LEAD = 0.24
const CLEAR = shardPolygon(0)

const SCREENS = [
  {
    id: 'portfolio', label: 'Portfolio', src: '/assets/app/portfolio.jpg', surface: 'surface-ink',
    title: 'Your portfolio, together.',
    desc: 'Balances, assets, and everyday wallet actions in one view.',
    alt: 'Xterium portfolio with the total balance, wallet actions, and assets across XODE and Polkadot Asset Hub.',
  },
  {
    id: 'tokens', label: 'Tokens', src: '/assets/app/tokens.jpg', surface: 'surface-purple',
    title: 'The right token. The right chain.',
    desc: 'Choose an asset with its network and available balance clearly in view.',
    alt: 'Xterium token selector showing XODE, Tether USD, Xaver, DOT, and USD Coin with their networks and balances.',
  },
  {
    id: 'send', label: 'Send', src: '/assets/app/send.jpg', surface: 'surface-mint',
    title: 'Send with confidence.',
    desc: 'Paste an address, scan a QR code, or choose a contact. Set the amount and keep your account active.',
    alt: 'Xterium USDT send screen with recipient address, paste, scan and contact options, transfer keep-alive, and amount.',
  },
  {
    id: 'staking', label: 'Staking', src: '/assets/app/staking.jpg', surface: 'surface-grass',
    title: 'Put your XON to work.',
    desc: 'View your stake, explore active collators, and delegate directly from your wallet.',
    alt: 'Xterium staking screen with staked and available XON, active collators, and the quick-stake action.',
  },
  {
    id: 'governance', label: 'Governance', src: '/assets/app/governance.jpg', surface: 'surface-violet',
    title: 'Follow on-chain decisions.',
    desc: 'See council members, open proposals, and voting progress in XODE governance.',
    alt: 'Xterium governance screen with council members, open proposals, and aye and nay voting progress.',
  },
]

function AppIntroContent() {
  return (
    <Reveal variant="slide-left">
      <SectionMarker no="01" label="The app" />
      <h2 className="font-display mt-5 max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.02em] md:text-7xl">
        <SplitReveal as="span" text="Your assets," />
        <br />
        <SegmentedReveal as="span" text="clearly in view." className="app-intro-heading voxel-heading font-pixel block leading-[1.45] tracking-normal md:leading-[1.2]" />
      </h2>
    </Reveal>
  )
}

/**
 * The phone and its screen. `active` -1 shows a blank screen. Changing
 * `active` sweeps the new screen in behind a magenta shard; a change that
 * lands mid-wipe settles the screen being wiped in and starts over from it.
 */
function PhoneScreen({ active, id }: { active: number; id: string }) {
  const reduced = useReducedMotion()
  const [view, setView] = useState({ active, from: active, direction: 1 as 1 | -1 })
  if (view.active !== active) setView({ active, from: view.active, direction: active < view.active ? -1 : 1 })
  const wipeClip = useMotionValue('none')
  const bandClip = useMotionValue(CLEAR)

  // Before paint, so the incoming screen never shows unclipped for a frame.
  useLayoutEffect(() => {
    if (view.from === view.active || reduced) {
      wipeClip.set('none')
      bandClip.set(CLEAR)
      return
    }
    const draw = (t: number) => {
      wipeClip.set(shardPolygon(Math.max(0, t * (1 + WIPE_LEAD) - WIPE_LEAD), view.direction))
      bandClip.set(shardPolygon(Math.min(1, t * (1 + WIPE_LEAD)), view.direction))
    }
    draw(0)
    const controls = animate(0, 1, {
      duration: 0.62, ease: WIPE_EASE, onUpdate: draw,
      onComplete: () => { wipeClip.set('none'); bandClip.set(CLEAR) },
    })
    return () => controls.stop()
  }, [view, reduced, wipeClip, bandClip])

  const layer = (index: number) => index === view.active ? 'top' : index === view.from ? 'base' : 'off'
  const current = Math.max(active, 0)
  return (
    <div role="group" aria-roledescription="slide" id={id + '-screen'}
      aria-label={`${SCREENS[current].label}, ${current + 1} of ${SCREENS.length}`} className="showcase-image-panel">
      <div className="phone-frame">
        <motion.div className="app-screenshot" style={{ '--wipe-clip': wipeClip, '--band-clip': bandClip } as unknown as MotionStyle}>
          <div className="app-screen-blank" data-layer={layer(-1)} />
          {SCREENS.map((item, index) => (
            <img key={item.id} src={item.src} alt={item.alt} width="946" height="2049"
              loading="lazy" decoding="async" draggable={false}
              aria-hidden={index !== active} data-layer={layer(index)} />
          ))}
          <div className="app-screen-band" aria-hidden="true" />
        </motion.div>
      </div>
    </div>
  )
}

function ScreenControls({ active, onChange, id }: { active: number; onChange: (index: number) => void; id: string }) {
  return (
    <div className="showcase-arrows" role="group" aria-label="Screenshot navigation">
      <button type="button" onClick={() => onChange((active + SCREENS.length - 1) % SCREENS.length)}
        aria-controls={id + '-screen'} aria-label="Previous app screen" title="Previous app screen">
        <ArrowLeft size={18} aria-hidden="true" />
      </button>
      <button type="button" onClick={() => onChange((active + 1) % SCREENS.length)}
        aria-controls={id + '-screen'} aria-label="Next app screen" title="Next app screen">
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </div>
  )
}

function ScreenCopy({ active }: { active: number }) {
  const reduced = useReducedMotion()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={active} className="showcase-copy" aria-live="polite" aria-atomic="true"
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduced ? 0 : -4 }}
        transition={{ duration: reduced ? 0 : 0.16, ease: EASE }}
      >
        <span className="font-mono2 text-[11px] text-fg-accent">0{active + 1} / 05</span>
        <h3 className="font-display mt-3 text-2xl font-semibold leading-tight">{SCREENS[active].title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-fg-dim">{SCREENS[active].desc}</p>
      </motion.div>
    </AnimatePresence>
  )
}

function SimpleShowcase() {
  const [active, setActive] = useState(0)
  const id = useId()
  return (
    <div className="showcase-simple" data-showcase-mode="gallery">
      <div className="showcase-simple-layout">
        <div className="showcase-preview">
          <PhoneScreen active={active} id={id} />
          <ScreenControls active={active} onChange={setActive} id={id} />
        </div>
        <div className="showcase-simple-details">
          <ScreenCopy active={active} />
        </div>
      </div>
    </div>
  )
}

/** One screen's card: rises from below as its step starts, lifts away as the next one does. */
function TourCard({ index, progress, current }: { index: number; progress: MotionValue<number>; current: boolean }) {
  const start = HERO_SEQUENCE.steps[index]
  const next = HERO_SEQUENCE.steps[index + 1]
  const last = next === undefined
  const input = last ? [start - 0.005, start + 0.045] : [start - 0.005, start + 0.045, next - 0.035, next + 0.005]
  const y = useTransform(progress, input, last ? ['40svh', '0svh'] : ['40svh', '0svh', '0svh', '-30svh'])
  const opacity = useTransform(progress, input, last ? [0, 1] : [0, 1, 1, 0])
  const screen = SCREENS[index]
  return (
    <motion.article className={`tour-card ${screen.surface}`} data-side={index % 2 ? 'right' : 'left'}
      style={{ y, opacity }} aria-hidden={!current}>
      <span className="tour-card-index font-mono2">0{index + 1} / 05</span>
      <h3 className="tour-card-title font-display">{screen.title}</h3>
      <p className="tour-card-desc">{screen.desc}</p>
    </motion.article>
  )
}

/**
 * The app half of the pinned hero sequence: the phone rises with a blank
 * screen, the heading takes the stage, then each screen sweeps in with its
 * card. Scroll position picks the step; `onSeek` scrolls to one.
 */
export function AppStage({ progress, active, onSeek }: {
  progress: MotionValue<number>
  active: boolean
  onSeek: (index: number) => void
}) {
  const id = useId()
  const [step, setStep] = useState(() => stepAt(progress.get()))
  useMotionValueEvent(progress, 'change', (value) => setStep(stepAt(value)))
  const { phoneRise, heading } = HERO_SEQUENCE
  const phoneY = useTransform(progress, phoneRise, ['110svh', '0svh'])
  const controlsOpacity = useTransform(progress, [phoneRise[1] - 0.04, phoneRise[1]], [0, 1])
  const headingOpacity = useTransform(progress, heading, [0, 1, 1, 0])
  const headingScale = useTransform(progress, heading, [0.9, 1, 1, 1.05])
  const current = Math.max(step, 0)

  return (
    <div className="stage-app tone-cream" data-hero-slide="app" data-showcase-mode="scroll" aria-hidden={!active} inert={!active}>
      <motion.div className="stage-heading-wrap" style={{ opacity: headingOpacity, scale: headingScale }}>
        <SectionMarker no="01" label="The app" />
        <h2 className="stage-heading font-display">
          Your assets,
          <span className="voxel-heading font-pixel" data-voxel-text="clearly in view.">clearly in view.</span>
        </h2>
      </motion.div>
      <div className="stage-app-grid">
        <motion.div className="stage-phone" style={{ y: phoneY }}>
          <PhoneScreen active={step} id={id} />
        </motion.div>
        {SCREENS.map((screen, index) => (
          <TourCard key={screen.id} index={index} progress={progress} current={index === step} />
        ))}
        <motion.div className="stage-controls" style={{ opacity: controlsOpacity }}>
          <div className="showcase-index font-mono2" aria-hidden="true">
            <span>0{current + 1}</span><span>/ 05</span>
          </div>
          <ScreenControls active={current} onChange={onSeek} id={id} />
        </motion.div>
      </div>
      <p className="sr-only" aria-live="polite">{step >= 0 ? `${SCREENS[step].title} ${SCREENS[step].desc}` : ''}</p>
    </div>
  )
}

/** The app section for the flowing (unpinned) layout: heading, then the button gallery. */
export default function AppShowcase() {
  return (
    <section id="showcase" className="app-showcase surface-cream relative" data-surface="cream">
      <DecorativeBlock top="8%" left="88%" size={28} color="var(--v-grass)" speed={1.1} spin floatDelay={-2.5} />
      <DecorativeBlock top="60%" left="6%" size={24} color="var(--v-stone)" speed={0.75} floatDelay={-5} />
      <div className="mx-auto max-w-7xl px-5 pt-24 sm:px-8"><AppIntroContent /></div>
      <SimpleShowcase />
    </section>
  )
}
