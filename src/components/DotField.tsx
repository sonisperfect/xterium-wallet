import { useEffect, useRef } from 'react'

/**
 * Living dot field — drifting mint dots that link with hairlines
 * when close, evoking a peer-to-peer node mesh. Pure canvas, no deps.
 */
export default function DotField({ density = 0.00009 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let w = 0
    let h = 0
    let raf = 0
    type P = { x: number; y: number; vx: number; vy: number; r: number; phase: number; speed: number }
    let pts: P[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.max(24, Math.floor(w * h * density))
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 1.8,
      }))
    }

    const LINK = 110
    const tick = (tNow: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const p of pts) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10
      }
      // links
      ctx.lineWidth = 1
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d = Math.hypot(dx, dy)
          if (d < LINK) {
            ctx.strokeStyle = `rgba(47, 224, 194, ${(1 - d / LINK) * 0.16})`
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.stroke()
          }
        }
      }
      // dots — twinkle while drifting
      for (const p of pts) {
        const tw = 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(tNow * 0.001 * p.speed + p.phase))
        ctx.fillStyle = `rgba(47, 224, 194, ${tw})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [density])

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      aria-hidden="true"
    />
  )
}
