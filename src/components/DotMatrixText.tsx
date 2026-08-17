import { useEffect, useRef } from 'react'

/**
 * Classic dot-matrix text — the given word is sampled offscreen and
 * re-rendered as a grid of dots. On mount the dots switch on one by one
 * in a left-to-right wave, like an LED departure board lighting up;
 * afterwards a fraction of the dots keep blinking slowly.
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
      phase: number
      speed: number
      blink: boolean
      birth: number
    }[] = []
    let startAt = 0
    let revealDone = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
              phase: Math.random() * Math.PI * 2,
              speed: 0.6 + Math.random() * 1.4,
              blink: Math.random() < 0.08,
              // staggered switch-on: left-to-right wave + slight vertical jitter
              birth: startAt + (x / w) * revealSpan + Math.random() * 180 + (y / h) * 90,
            })
          }
        }
      }
      revealDone = reduced

      const draw = (t: number) => {
        ctx.clearRect(0, 0, w, h)
        let allBorn = true
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
          let alpha = 0.9
          if (!reduced && d.blink) {
            alpha = 0.5 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.0006 * d.speed + d.phase))
          }
          ctx.fillStyle = `rgba(${color}, ${alpha})`
          ctx.beginPath()
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
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
