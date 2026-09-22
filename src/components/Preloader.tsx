import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { IntroContext } from '../lib/intro'

const MIN_DISPLAY_MS = 850
const MAX_WAIT_MS = 3500
const EASE = [0.22, 1, 0.36, 1] as const

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

export default function Preloader({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const [assets, setAssets] = useState({ brand: false, fonts: false, hero: false })
  const [minimumElapsed, setMinimumElapsed] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [complete, setComplete] = useState(false)
  const ready = minimumElapsed && assets.brand && assets.fonts && assets.hero
  const canEnter = ready || timedOut

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
    const timer = window.setTimeout(() => setExiting(true), reduced ? 0 : 160)
    return () => window.clearTimeout(timer)
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
            animate={canEnter ? 'ready' : 'loading'}
            exit="exit"
            variants={{
              loading: { opacity: 1 },
              ready: { opacity: 1 },
              exit: { opacity: 0, transition: { delay: reduced ? 0 : 0.64, duration: reduced ? 0 : 0.08 } },
            }}
          >
            <motion.div
              className="preloader-shutter preloader-shutter-top"
              variants={{ exit: { y: reduced ? 0 : '-101%', transition: { duration: reduced ? 0 : 0.7, ease: EASE } } }}
              aria-hidden="true"
            />
            <motion.div
              className="preloader-shutter preloader-shutter-bottom"
              variants={{ exit: { y: reduced ? 0 : '101%', transition: { duration: reduced ? 0 : 0.7, ease: EASE } } }}
              aria-hidden="true"
            />
            <motion.div
              className="preloader-content"
              variants={{ exit: { opacity: 0, y: reduced ? 0 : -18, scale: reduced ? 1 : 0.96, transition: { duration: reduced ? 0 : 0.22 } } }}
            >
              <PreloaderMark reduced={!!reduced} onReady={onBrandReady} />
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
              <div className="preloader-progress" aria-hidden="true">
                {[assets.brand, assets.fonts, assets.hero].map((loaded, index) => (
                  <span key={index} className="preloader-progress-track" data-loaded={loaded}>
                    <span />
                  </span>
                ))}
              </div>
              <p className="preloader-status font-mono2" aria-hidden="true">{ready ? 'Ready' : 'Loading'}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="preloader-page" inert={!complete} aria-hidden={!complete}>
        {children}
      </div>
    </IntroContext.Provider>
  )
}
