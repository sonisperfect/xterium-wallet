import { useEffect, useRef } from 'react'

/**
 * Blinking dot grid — a static dotted lattice where individual dots
 * softly twinkle on their own phase. Fills the parent (absolute inset-0).
 */
export default function BlinkDots({
  gap = 26,
  color = '47, 224, 194',
  baseAlpha = 0.06,
  className = '',
}: {
  gap?: number
  color?: string
  baseAlpha?: number
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let dots: { x: number; y: number; phase: number; speed: number; twinkle: boolean }[] = []

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === 0 || h === 0) return
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dots = []
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          dots.push({
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1.6,
            twinkle: Math.random() < 0.16,
          })
        }
      }
    }

    const draw = (t: number) => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      for (const d of dots) {
        let alpha = baseAlpha
        if (!reduced && d.twinkle) {
          alpha = baseAlpha + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.001 * d.speed + d.phase))
        }
        ctx.fillStyle = `rgba(${color}, ${alpha})`
        ctx.beginPath()
        ctx.arc(d.x, d.y, 1, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!reduced) raf = requestAnimationFrame(draw)
    }

    build()
    draw(0)
    const onResize = () => {
      build()
      if (reduced) draw(0)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [gap, color, baseAlpha])

  return (
    <canvas
      ref={ref}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  )
}
