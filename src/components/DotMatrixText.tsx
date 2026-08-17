import { useEffect, useRef } from 'react'

/**
 * Classic dot-matrix text — the given word is sampled offscreen and
 * re-rendered as a grid of dots. On mount the dots switch on one by one
 * in a left-to-right wave, like an LED departure board lighting up.
 * Afterwards, random dots across the whole word slowly fade to
 * translucent, hold, and return to full color — irregularly, like a
 * living LED board.
 */
export default function DotMatrixText({
  text,
  height = 120,
  gap = 7,
  color = '47, 224, 194',
  className = '',
}: {
  text: string
  height?: number
  gap?: number
  color?: string
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let dots: {
      x: number
      y: number
      r: number
      birth: number
      fadeAt: number // next time this dot starts a fade cycle
      depth: number // how translucent it gets at the bottom of a cycle (0..1)
    }[] = []
    let startAt = 0
    let revealDone = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const BASE = 0.92 // resting alpha
    const FADE_DOWN = 1100 // ms to fade out
    const HOLD = 420 // ms at minimum
    const FADE_UP = 1100 // ms to fade back

    const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)
    // irregular re-schedule: long random quiet periods so only a few
    // dots are fading at any moment, scattered across the whole word
    const nextGap = () => 4000 + Math.random() * 14000
    const nextWaveGap = () => 4200 + Math.random() * 5200

    const build = async () => {
      await document.fonts.ready
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // offscreen sample of the text
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const octx = off.getContext('2d')
      if (!octx) return
      const fontSize = h * 0.92
      octx.font = `700 ${fontSize}px 'Silkscreen', 'JetBrains Mono', monospace`
      octx.textBaseline = 'middle'
      // shrink until it fits the width
      let fs = fontSize
      while (octx.measureText(text).width > w && fs > 8) {
        fs -= 2
        octx.font = `700 ${fs}px 'Silkscreen', 'JetBrains Mono', monospace`
      }
      octx.fillStyle = '#fff'
      octx.fillText(text, 0, h / 2)

      const data = octx.getImageData(0, 0, w, h).data
      dots = []
      startAt = performance.now() + 120 // tiny beat before the wave starts
      const revealSpan = 1400 // ms for the wave to cross the full width
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const a = data[(Math.floor(y) * w + Math.floor(x)) * 4 + 3]
          if (a > 110) {
            dots.push({
              x,
              y,
              r: gap * 0.32,
              // staggered switch-on: left-to-right wave + slight vertical jitter
              birth: startAt + (x / w) * revealSpan + Math.random() * 180 + (y / h) * 90,
              // first fade happens soon after reveal, then reschedules irregularly
              fadeAt: startAt + revealSpan + 800 + Math.random() * 6000,
              depth: 0.55 + Math.random() * 0.45, // some dots nearly vanish, some just dim
            })
          }
        }
      }
      revealDone = reduced

      // pulse wave state — a bright band that sweeps the word irregularly
      let waveAt = startAt + revealSpan + 2400
      const WAVE_MS = 1500 // sweep duration across the word
      const BAND = 110 // wavefront width in px

      const draw = (t: number) => {
        ctx.clearRect(0, 0, w, h)
        let allBorn = true

        // wavefront x position (when active)
        let waveX = -1
        if (!reduced && revealDone && t >= waveAt) {
          waveX = ((t - waveAt) / WAVE_MS) * (w + BAND * 2) - BAND
          if (waveX > w + BAND) {
            waveAt = t + nextWaveGap()
            waveX = -1
          }
        }

        for (const d of dots) {
          // entrance: dots pop in with a quick scale/alpha ramp at their birth time
          if (!revealDone) {
            const age = t - d.birth
            if (age < 0) {
              allBorn = false
              continue
            }
            const k = Math.min(1, age / 320)
            if (k < 1) allBorn = false
            const ease = 1 - Math.pow(1 - k, 3)
            const scale = 0.2 + 0.8 * ease
            const alpha = 0.35 + 0.55 * ease
            ctx.fillStyle = `rgba(${color}, ${alpha})`
            ctx.beginPath()
            ctx.arc(d.x, d.y, d.r * scale, 0, Math.PI * 2)
            ctx.fill()
            continue
          }

          // ambient life: irregular slow fade cycles per dot
          let alpha = BASE
          if (!reduced && t >= d.fadeAt) {
            const ft = t - d.fadeAt
            const min = BASE * (1 - d.depth) * 0.35 // translucent floor
            if (ft < FADE_DOWN) {
              alpha = BASE - (BASE - min) * easeInOut(ft / FADE_DOWN)
            } else if (ft < FADE_DOWN + HOLD) {
              alpha = min
            } else if (ft < FADE_DOWN + HOLD + FADE_UP) {
              alpha = min + (BASE - min) * easeInOut((ft - FADE_DOWN - HOLD) / FADE_UP)
            } else {
              d.fadeAt = t + nextGap()
            }
          }

          // pulse wave boost + halo
          let r = d.r
          if (waveX >= 0) {
            const dw = Math.abs(d.x - waveX)
            if (dw < BAND) {
              const boost = 1 - dw / BAND
              alpha = Math.max(alpha, Math.min(1, BASE + boost * 0.5))
              r = d.r * (1 + boost * 0.85)
              ctx.fillStyle = `rgba(${color}, ${boost * 0.3})`
              ctx.beginPath()
              ctx.arc(d.x, d.y, d.r * 4.4, 0, Math.PI * 2)
              ctx.fill()
            }
          }

          ctx.fillStyle = `rgba(${color}, ${alpha})`
          ctx.beginPath()
          ctx.arc(d.x, d.y, r, 0, Math.PI * 2)
          ctx.fill()
        }
        if (!revealDone && allBorn) revealDone = true
        if (!reduced) raf = requestAnimationFrame(draw)
      }
      raf = requestAnimationFrame(draw)
    }

    build()
    const onResize = () => build()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [text, height, gap, color])

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={text}
      className={`block w-full ${className}`}
      style={{ height }}
    />
  )
}
