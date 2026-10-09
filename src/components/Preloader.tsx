import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { IntroContext } from '../lib/intro'

const MIN_DISPLAY_MS = 850
const MAX_WAIT_MS = 3500
const EASE = [0.22, 1, 0.36, 1] as const
// slow to break, then thrown clear
const SHATTER = [0.76, 0, 0.24, 1] as const
const FLIGHT = [0.65, 0, 0.35, 1] as const

// The cream screen breaks into three jagged shards meeting under the logo,
// each thrown its own way. Class names are spelled out so Tailwind keeps them.
const SHARDS = [
  { className: 'preloader-shard preloader-shard-a', away: { x: '-40%', y: '-74%', rotate: -8 }, delay: 0.05 },
  { className: 'preloader-shard preloader-shard-b', away: { x: '62%', y: '-60%', rotate: 7 }, delay: 0.1 },
  { className: 'preloader-shard preloader-shard-c', away: { x: '6%', y: '80%', rotate: 4 }, delay: 0 },
]

type Flight = { x: number; y: number; scale: number }

/** The way into the nav's logo, at its size — or null where there's no nav (the policy page). */
function measureFlight(mark: HTMLElement | null): Flight | null {
  const logo = mark?.querySelector('img')?.getBoundingClientRect()
  const nav = document.querySelector('[data-mascot-dock="nav"]')?.getBoundingClientRect()
  if (!logo?.width || !nav?.width) return null
  return {
    x: nav.left + nav.width / 2 - (logo.left + logo.width / 2),
    y: nav.top + nav.height / 2 - (logo.top + logo.height / 2),
    scale: nav.width / logo.width,
  }
}

function PreloaderMark({ reduced, onReady }: { reduced: boolean; onReady: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host || reduced) return
    let cancelled = false
    let dispose: (() => void) | undefined
    import('../lib/preloaderScene').then(({ mountPreloaderScene }) => {
      if (cancelled) return
      dispose = mountPreloaderScene(host, () => setRendered(true), () => setRendered(false))
    }).catch(() => {
      if (!cancelled) setRendered(false)
    })
    return () => { cancelled = true; dispose?.() }
  }, [reduced])

  return (
    <div className="preloader-mark" data-rendered={rendered && !reduced} aria-hidden="true">
      <img src="/logo/xterium-logo.png" width="512" height="512" alt=""
        fetchPriority="high" onLoad={onReady} onError={onReady} />
      <div ref={hostRef} className="preloader-mark-scene" />
    </div>
  )
}

/**
 * Holds the page behind a cream brand screen until the first screen is
 * ready. Then the screen cracks into shards that fly apart over the hero,
 * while the logo flies up into the nav's logo and becomes it.
 */
export default function Preloader({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const markRef = useRef<HTMLDivElement>(null)
  // Only the home page has a hero to wait for; other pages (the policies) skip that signal.
  const [assets, setAssets] = useState(() => ({ brand: false, fonts: false, hero: window.location.pathname !== '/' }))
  const [minimumElapsed, setMinimumElapsed] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [flight, setFlight] = useState<Flight | null>(null)
  const [complete, setComplete] = useState(false)
  const ready = minimumElapsed && assets.brand && assets.fonts && assets.hero
  const canEnter = ready || timedOut
  const loaded = Number(assets.brand) + Number(assets.fonts) + Number(assets.hero)

  const onHeroReady = useCallback(() => {
    setAssets((previous) => previous.hero ? previous : { ...previous, hero: true })
  }, [])
  const onBrandReady = useCallback(() => {
    setAssets((previous) => previous.brand ? previous : { ...previous, brand: true })
  }, [])

  useEffect(() => {
    if (complete) return
    let alive = true
    const settleFonts = () => {
      if (alive) setAssets((previous) => previous.fonts ? previous : { ...previous, fonts: true })
    }
    const minimum = window.setTimeout(() => setMinimumElapsed(true), reduced ? 0 : MIN_DISPLAY_MS)
    // Only critical first-screen work gates the intro; a stalled request cannot trap the visitor.
    const deadline = window.setTimeout(() => setTimedOut(true), MAX_WAIT_MS)
    const fontDeadline = window.setTimeout(settleFonts, 800)
    document.fonts.ready.then(settleFonts, settleFonts)
    return () => {
      alive = false
      window.clearTimeout(minimum)
      window.clearTimeout(deadline)
      window.clearTimeout(fontDeadline)
    }
  }, [complete, reduced])

  useEffect(() => {
    if (!canEnter) return
    let frame = 0
    // A beat on the full progress bar, then out. The logo's flight is set a
    // frame before leaving: AnimatePresence plays the exit from the last
    // render the preloader had, so the flight has to be in that render.
    const timer = window.setTimeout(() => {
      setFlight(reduced ? null : measureFlight(markRef.current))
      frame = requestAnimationFrame(() => setExiting(true))
    }, reduced ? 0 : 160)
    return () => { window.clearTimeout(timer); cancelAnimationFrame(frame) }
  }, [canEnter, reduced])

  useEffect(() => {
    if (complete) return
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    return () => { root.style.overflow = previousOverflow }
  }, [complete])

  const intro = useMemo(() => ({ revealed: exiting, onHeroReady }), [exiting, onHeroReady])

  return (
    <IntroContext.Provider value={intro}>
      <AnimatePresence onExitComplete={() => setComplete(true)}>
        {!exiting && (
          <motion.div
            key="preloader"
            className="preloader"
            role="status"
            aria-live="polite"
            aria-label={ready ? 'Xterium is ready' : 'Loading Xterium'}
            data-ready={ready}
            initial="loading"
            animate="loading"
            exit="exit"
            variants={{ loading: {}, exit: {} }}
          >
            {/* covers the seams until the screen breaks */}
            <motion.div className="preloader-base" variants={{ exit: { opacity: 0, transition: { duration: 0 } } }} aria-hidden="true" />
            {SHARDS.map((shard) => (
              <motion.div key={shard.className} className={shard.className} aria-hidden="true"
                variants={{ exit: reduced ? {} : { ...shard.away, transition: { duration: 0.85, delay: shard.delay, ease: SHATTER } } }}
              />
            ))}
            <div className="preloader-content">
              <motion.div ref={markRef} variants={{
                exit: flight
                  ? { ...flight, transition: { duration: 0.75, ease: FLIGHT } }
                  : { opacity: 0, scale: reduced ? 1 : 0.92, transition: { duration: reduced ? 0 : 0.25 } },
              }}>
                <PreloaderMark reduced={!!reduced} onReady={onBrandReady} />
              </motion.div>
              <motion.div className="preloader-copy"
                variants={{ exit: { opacity: 0, y: reduced ? 0 : 10, transition: { duration: reduced ? 0 : 0.2 } } }}>
                <div className="preloader-wordmark font-display" aria-hidden="true">
                  {[...'XTERIUM'].map((letter, index) => (
                    <motion.span key={index}
                      initial={reduced ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: index * 0.045, ease: EASE }}
                    >{letter}</motion.span>
                  ))}
                </div>
                <p className="preloader-ecosystem font-mono2" aria-hidden="true">XODE ECOSYSTEM</p>
                {/* fills a third per signal: the logo, the fonts, the hero */}
                <div className="preloader-progress" style={{ '--loaded': loaded / 3 } as CSSProperties} aria-hidden="true">
                  <span />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="preloader-page" inert={!complete} aria-hidden={!complete}>
        {children}
      </div>
    </IntroContext.Provider>
  )
}
