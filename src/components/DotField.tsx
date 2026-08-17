import { useEffect, useRef } from 'react'

/**
 * Living dot field — drifting mint dots that link with hairlines
 * when close, evoking a peer-to-peer node mesh. Pure canvas, no deps.
 * The mesh is mouse-reactive: dots near the cursor flare up, swell,
 * and are gently pushed aside, and links around the cursor brighten.
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

    // mouse with soft follow
    let mx = -9999
    let my = -9999
    let tx = -9999
    let ty = -9999
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      tx = e.clientX - rect.left
      ty = e.clientY - rect.top
    }
    const onLeave = () => {
      tx = -9999
      ty = -9999
    }

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
    const FIELD = 170 // cursor influence radius
    const tick = (tNow: number) => {
      ctx.clearRect(0, 0, w, h)
      // soft-follow the cursor
      mx += (tx - mx) * 0.14
      my += (ty - my) * 0.14
      const mouseOn = mx > -9000

      for (const p of pts) {
        p.x += p.vx
        p.y += p.vy
        // gentle repulsion around the cursor
        if (mouseOn) {
          const dx = p.x - mx
          const dy = p.y - my
          const d = Math.hypot(dx, dy)
          if (d < FIELD && d > 0.01) {
            const f = ((FIELD - d) / FIELD) * 0.9
            p.x += (dx / d) * f
            p.y += (dy / d) * f
          }
        }
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
            let a = (1 - d / LINK) * 0.16
            if (mouseOn) {
              const dm = Math.min(
                Math.hypot(pts[i].x - mx, pts[i].y - my),
                Math.hypot(pts[j].x - mx, pts[j].y - my),
              )
              if (dm < FIELD) a += ((FIELD - dm) / FIELD) * 0.4
            }
            ctx.strokeStyle = `rgba(47, 224, 194, ${Math.min(a, 0.6)})`
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.stroke()
          }
        }
      }
      // dots — twinkle while drifting, flare near the cursor
      for (const p of pts) {
        let alpha = 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(tNow * 0.001 * p.speed + p.phase))
        let r = p.r
        if (mouseOn) {
          const d = Math.hypot(p.x - mx, p.y - my)
          if (d < FIELD) {
            const k = (FIELD - d) / FIELD
            alpha = Math.min(1, alpha + k * 0.75)
            r = p.r * (1 + k * 1.1)
          }
        }
        ctx.fillStyle = `rgba(47, 224, 194, ${alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
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
