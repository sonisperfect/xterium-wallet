import { useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { animate, cancelFrame, frame, useMotionValue, useScroll } from 'framer-motion'
import type { MascotPose } from '../lib/mascotScene'
import { useIntro } from '../lib/intro'
import { MASCOT, STATS_STAGE, stepAt } from '../lib/sequence'
import { StageProgressContext } from '../lib/stages'

const EASE = [0.22, 1, 0.36, 1] as const
// Live 3D only where there's a cursor to follow and room to show it; elsewhere the logo image stands in.
const LIVE_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 1024px)'
// The nav's logo image is the bare mark; the mascot's square carries margin around it.
const MARGIN = 1.2
// Over the app's header logo it shows a size up, covering it whole without reaching the wordmark beside it.
const APP_LOGO_SCALE = 1.5

type Spot = { x: number; y: number; size: number }

function subscribeLive(callback: () => void) {
  const media = window.matchMedia(LIVE_QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (t: number) => t * t * (3 - 2 * t)
const easeOut = (t: number) => 1 - (1 - t) ** 3

/** Eased share of the way through `range` at `value`. */
function travel([start, end]: number[], value: number, ease = smooth) {
  return ease(clamp01((value - start) / (end - start)))
}

function mix(a: Spot, b: Spot, t: number): Spot {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, size: a.size + (b.size - a.size) * t }
}

/** A dock's centre on screen and its untransformed size, scaled to the mascot's square. */
function dock(name: string, scale = 1): Spot | null {
  const element = document.querySelector<HTMLElement>(`[data-mascot-dock="${name}"]`)
  if (!element) return null
  const bounds = element.getBoundingClientRect()
  return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2, size: element.offsetWidth * scale }
}

/** Layout offset of `element` below `ancestor`, ignoring transforms. */
function offsetWithin(element: HTMLElement, ancestor: HTMLElement) {
  let top = 0
  let node: HTMLElement | null = element
  while (node && node !== ancestor) {
    top += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return top
}

/**
 * The resting gap between the blank screen's top edge and the app heading's
 * marker. Measured from layout, so neither the phone rising nor the heading
 * scaling in moves it.
 */
function blankGap() {
  const screen = document.querySelector<HTMLElement>('[data-mascot-dock="app"]')
  const floor = document.querySelector<HTMLElement>('[data-mascot-floor]')
  const stage = screen?.closest<HTMLElement>('[data-hero-slide="app"]')
  if (!screen || !floor || !stage) return null
  return offsetWithin(floor, stage) - offsetWithin(screen, stage)
}

/**
 * The Xterium mark as a companion through the pinned stages. At the top of
 * the page it's tucked away behind the nav's logo. Scrolling from there, it
 * grows out of the logo — turning over once — and drops into the hero,
 * rising huge from the bottom edge and turning towards the cursor. Then it
 * shrinks onto the top of the phone, then — as the screens start — over the
 * logo in the app's header, turning over with each screen change, and
 * finally lands in the stats stage's lock screen. Back at the top, it
 * tucks into the logo again. Where it sits is read off the
 * `data-mascot-dock` elements every frame they move, so it stays attached to
 * whatever carries it.
 */
export default function Mascot() {
  const stages = useContext(StageProgressContext)
  const { revealed } = useIntro()
  const live = useSyncExternalStore(subscribeLive, () => window.matchMedia(LIVE_QUERY).matches, () => false)
  const { scrollY } = useScroll()
  const bodyRef = useRef<HTMLDivElement>(null)
  const turnRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const scene = useRef<{ wake: () => void } | null>(null)
  const pose = useRef<MascotPose>({ spin: 0, tiltX: 0, tiltY: 0, tiltZ: 0, calm: 1, parked: true })
  const [ready, setReady] = useState(false)
  // 0 tucked behind the nav's logo, 1 out on its route.
  const out = useMotionValue(0)
  const flip = useMotionValue(0)

  // Out once the page scrolls from the top, back into the logo when it returns there.
  useEffect(() => {
    let target = 0
    const decide = () => {
      const next = revealed && scrollY.get() > MASCOT.outAfter ? 1 : 0
      if (next === target) return
      target = next
      animate(out, next, { duration: next ? MASCOT.outDuration : MASCOT.inDuration, ease: EASE })
    }
    decide()
    return scrollY.on('change', decide)
  }, [revealed, scrollY, out])

  // A turn each time the app screen changes, the way it changed.
  useEffect(() => {
    if (!stages) return
    let step = stepAt(stages.hero.get())
    return stages.hero.on('change', (value) => {
      const next = stepAt(value)
      if (next === step) return
      const direction = next > step ? 1 : -1
      step = next
      animate(flip, Math.round(flip.get()) + direction, { duration: MASCOT.flipDuration, ease: EASE })
    })
  }, [stages, flip])

  useEffect(() => {
    const host = hostRef.current
    if (!live || !host) return
    let cancelled = false
    let dispose: (() => void) | undefined
    // Keep the logo image showing while the renderer loads or if WebGL is unavailable.
    import('../lib/mascotScene').then(({ mountMascotScene }) => {
      if (cancelled) return
      const handle = mountMascotScene(host, {
        getPose: () => pose.current,
        onReady: () => setReady(true),
        onUnavailable: () => setReady(false),
      })
      scene.current = handle
      dispose = handle.dispose
    }).catch(() => {
      if (!cancelled) setReady(false)
    })
    return () => { cancelled = true; dispose?.(); scene.current = null }
  }, [live])

  // Before paint, so it's never drawn a frame away from where it belongs.
  useLayoutEffect(() => {
    if (!stages) return
    const body = bodyRef.current
    function update() {
      const nav = dock('nav', MARGIN)
      const hero = dock('hero')
      const appTop = dock('app')
      const appLogo = dock('app-logo', MARGIN * APP_LOGO_SCALE)
      const stats = dock('stats')
      const gap = blankGap()
      if (!body || !nav || !hero || !appTop || !appLogo || !stats || gap === null || !stages) return
      // On the blank screen it centres in the gap between the screen's top edge
      // (where its dock box starts) and the heading's marker, never crowding either.
      const screenTop = appTop.y - appTop.size / 2
      appTop.size = Math.min(appTop.size, gap * 0.8)
      appTop.y = screenTop + gap / 2
      // On the phone: at its top centre while the screen is blank, then over
      // the logo in the app's header once the screens start.
      const onLogo = travel(MASCOT.topToLogo, stages.hero.get())
      const app = mix(appTop, appLogo, onLogo)
      // Once the phone scrolls away it hops off, rather than riding up under the
      // nav and dropping back down from there, and heads straight for the lock screen.
      const navBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
      const perch = { ...app, y: Math.max(app.y, navBottom + app.size * 0.3) }
      const toApp = travel(MASCOT.heroToApp, stages.hero.get())
      const toStats = travel(MASCOT.appToStats, stages.stats.get(), easeOut)
      const emerging = out.get()
      const spot = mix(nav, mix(mix(hero, perch, toApp), stats, toStats), emerging)
      body.style.width = `${spot.size}px`
      body.style.height = `${spot.size}px`
      body.style.transform = `translate3d(${spot.x - spot.size / 2}px, ${spot.y - spot.size / 2}px, 0)`
      // Tucked away, it waits face-on behind the nav's logo with nothing to draw.
      const parked = emerging < 0.01
      // Still and face-on wherever it stands in for a logo: the nav's, the app's, the lock screen's.
      const calm = Math.max(1 - emerging, onLogo * toApp, toStats)
      body.dataset.parked = String(parked)
      body.dataset.calm = String(calm > 0.98)

      // In the lock screen it takes the phone's tilt, so it reads as printed on the glass.
      const [from, to] = STATS_STAGE.untilt
      const lean = (1 - clamp01((stages.stats.get() - from) / (to - from))) * toStats
      const { tilt } = STATS_STAGE
      const turns = emerging + toApp + toStats + flip.get()
      Object.assign(pose.current, {
        spin: turns * Math.PI * 2, tiltX: tilt.x * lean, tiltY: tilt.y * lean, tiltZ: tilt.z * lean,
        calm, parked,
      })
      turnRef.current?.style.setProperty('transform',
        `perspective(1100px) rotate(${tilt.z * lean}deg) rotateX(${tilt.x * lean}deg) rotateY(${tilt.y * lean + turns * 360}deg)`)
      scene.current?.wake()
    }
    // After framer has written this frame's transforms, so the docks read where they're drawn.
    const schedule = () => frame.postRender(update)
    const unsubscribe = [scrollY, stages.hero, stages.stats, out, flip].map((value) => value.on('change', schedule))
    window.addEventListener('resize', schedule)
    update()
    return () => {
      unsubscribe.forEach((stop) => stop())
      window.removeEventListener('resize', schedule)
      cancelFrame(update)
    }
  }, [stages, scrollY, out, flip])

  return (
    <div className="mascot-layer" aria-hidden="true">
      <div ref={bodyRef} className="mascot" data-ready={live && ready}>
        <div ref={turnRef} className="mascot-turn">
          <img src="/logo/xterium-logo.png" width="512" height="512" alt="" draggable={false} />
        </div>
        {live && <div ref={hostRef} className="mascot-scene" />}
      </div>
    </div>
  )
}
