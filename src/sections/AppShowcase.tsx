import { useId, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import SectionMarker from '../components/SectionMarker'
import DecorativeBlock from '../components/DecorativeBlock'
import { Reveal } from '../components/Reveal'
import SegmentedReveal from '../components/SegmentedReveal'
import SplitReveal from '../components/SplitReveal'

const EASE = [0.22, 1, 0.36, 1] as const
const DESKTOP_QUERY = '(min-width: 1024px) and (min-height: 620px)'

const SCREENS = [
  {
    id: 'portfolio', label: 'Portfolio', src: '/assets/app/portfolio.jpg',
    title: 'Your portfolio, together.',
    desc: 'Balances, assets, and everyday wallet actions in one view.',
    alt: 'Xterium portfolio with the total balance, wallet actions, and assets across XODE and Polkadot Asset Hub.',
  },
  {
    id: 'tokens', label: 'Tokens', src: '/assets/app/tokens.jpg',
    title: 'The right token. The right chain.',
    desc: 'Choose an asset with its network and available balance clearly in view.',
    alt: 'Xterium token selector showing XODE, Tether USD, Xaver, DOT, and USD Coin with their networks and balances.',
  },
  {
    id: 'send', label: 'Send', src: '/assets/app/send.jpg',
    title: 'Send with confidence.',
    desc: 'Paste an address, scan a QR code, or choose a contact. Set the amount and keep your account active.',
    alt: 'Xterium USDT send screen with recipient address, paste, scan and contact options, transfer keep-alive, and amount.',
  },
  {
    id: 'staking', label: 'Staking', src: '/assets/app/staking.jpg',
    title: 'Put your XON to work.',
    desc: 'View your stake, explore active collators, and delegate directly from your wallet.',
    alt: 'Xterium staking screen with staked and available XON, active collators, and the quick-stake action.',
  },
  {
    id: 'governance', label: 'Governance', src: '/assets/app/governance.jpg',
    title: 'Follow on-chain decisions.',
    desc: 'See council members, open proposals, and voting progress in XODE governance.',
    alt: 'Xterium governance screen with council members, open proposals, and aye and nay voting progress.',
  },
]

function subscribeDesktop(callback: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

export function AppIntroContent() {
  return (
    <Reveal variant="slide-left">
      <SectionMarker no="02" label="The app" />
      <h2 className="font-display mt-5 max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.02em] md:text-7xl">
        <SplitReveal as="span" text="Your assets," />
        <br />
        <SegmentedReveal as="span" text="clearly in view." className="app-intro-heading voxel-heading font-pixel block leading-[1.45] tracking-normal md:leading-[1.2]" />
      </h2>
    </Reveal>
  )
}

function Screenshot({ active, id }: { active: number; id: string }) {
  const reduced = useReducedMotion()
  return (
    <div role="group" aria-roledescription="slide" id={id + '-screen'}
      aria-label={`${SCREENS[active].label}, ${active + 1} of ${SCREENS.length}`} className="showcase-image-panel">
      <div className="app-screenshot">
        {SCREENS.map((item, index) => (
          <motion.img key={item.id} src={item.src} alt={item.alt} width="946" height="2049"
            loading="lazy" decoding="async" draggable={false} aria-hidden={index !== active}
            initial={false}
            animate={{ opacity: index === active ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 0.32, ease: EASE }}
            style={{ zIndex: index === active ? 1 : 0 }}
          />
        ))}
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
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduced ? 0 : -8 }}
        transition={{ duration: reduced ? 0 : 0.22, ease: EASE }}
      >
        <span className="font-mono2 text-[11px] text-primary">0{active + 1} / 05</span>
        <h3 className="font-display mt-3 text-2xl font-semibold leading-tight">{SCREENS[active].title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-dim">{SCREENS[active].desc}</p>
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
          <Screenshot active={active} id={id} />
          <ScreenControls active={active} onChange={setActive} id={id} />
        </div>
        <div className="showcase-simple-details">
          <ScreenCopy active={active} />
        </div>
      </div>
    </div>
  )
}

function SyncedShowcase() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const id = useId()
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = Math.min(SCREENS.length - 1, Math.max(0, Math.floor(value * SCREENS.length)))
    setActive((previous) => previous === next ? previous : next)
  })

  function selectScreen(index: number) {
    const element = wrapRef.current
    if (!element) return
    const top = element.getBoundingClientRect().top + window.scrollY
    const distance = element.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + distance * ((index + 0.5) / SCREENS.length), behavior: 'smooth' })
  }

  return (
    <div ref={wrapRef} className="showcase-sequence" data-showcase-mode="scroll">
      <div className="showcase-sticky">
        <div className="showcase-desktop-layout">
          <div className="showcase-desktop-copy"><ScreenCopy active={active} /></div>
          <Screenshot active={active} id={id} />
          <div className="showcase-desktop-navigation">
            <div className="showcase-desktop-index font-mono2" aria-hidden="true">
              <span>0{active + 1}</span><span>/ 05</span>
            </div>
            <ScreenControls active={active} onChange={selectScreen} id={id} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AppShowcase() {
  const reduced = useReducedMotion()
  const desktop = useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP_QUERY).matches, () => false)
  return (
    <section id="showcase" className="app-showcase snap-section relative border-t border-line">
      <DecorativeBlock top="8%" left="88%" size={28} color="var(--v-grass)" speed={1.1} spin floatDelay={-2.5} />
      <DecorativeBlock top="60%" left="6%" size={24} color="var(--v-stone)" speed={0.75} floatDelay={-5} />
      {reduced && <div className="mx-auto max-w-7xl px-5 pt-24 sm:px-8"><AppIntroContent /></div>}
      {desktop && !reduced ? <SyncedShowcase /> : <SimpleShowcase />}
    </section>
  )
}
