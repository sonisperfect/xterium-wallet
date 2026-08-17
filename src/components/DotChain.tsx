import { useEffect, useRef } from 'react'

/**
 * Dot-chain — a horizontal blockchain strip rendered entirely from dots.
 * Block nodes (dot clusters) are linked by dotted lines, and mint pulse
 * packets travel along the chain like transactions being propagated.
 */
export default function DotChain({ blocks = 6, className = '' }: { blocks?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let w = 0
    let h = 0
    let startAt = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const drawBlock = (cx: number, cy: number, s: number, active: number) => {
      // a square block drawn as a lattice of dots
      const n = 5
      const step = s / n
      for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= n; j++) {
          const edge = i === 0 || j === 0 || i === n || j === n
          const inner = (i === 2 && j === 2) || (i === 1 && j === 2) || (i === 3 && j === 2)
          if (!edge && !inner) continue
          const glow = active > 0 ? active : 0
          ctx.fillStyle = edge
            ? `rgba(47, 224, 194, ${0.35 + glow * 0.65})`
            : `rgba(239, 250, 246, ${0.25 + glow * 0.5})`
          ctx.beginPath()
          ctx.arc(cx - s / 2 + i * step, cy - s / 2 + j * step, edge ? 1.6 : 1.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      const cy = h / 2
      const margin = 70
      const span = w - margin * 2
      const xs = Array.from({ length: blocks }, (_, i) => margin + (span * i) / (blocks - 1))

      // build-in: blocks assemble one by one, then the pulse starts travelling
      const age = t - startAt
      const born = reduced ? blocks : Math.max(0, Math.floor(age / 380) + (age > 0 ? 1 : 0))

      // dotted links (fade in with the surrounding blocks)
      for (let i = 0; i < blocks - 1; i++) {
        if (i + 1 >= born) break
        const x0 = xs[i] + 24
        const x1 = xs[i + 1] - 24
        for (let x = x0; x <= x1; x += 9) {
          ctx.fillStyle = 'rgba(47, 224, 194, 0.22)'
          ctx.beginPath()
          ctx.arc(x, cy, 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // traveling pulse packets (block propagation) — only once every block exists
      let activeBlock = -1
      if (!reduced && born >= blocks) {
        const period = 5200
        const prog = (t % period) / period
        const px = margin + prog * span
        activeBlock = Math.round(prog * (blocks - 1))
        // packet trail: head + fading tail dots
        for (let k = 0; k < 10; k++) {
          const x = px - k * 10
          if (x < margin) break
          const a = 0.95 * (1 - k / 10)
          ctx.fillStyle = `rgba(167, 243, 229, ${a})`
          ctx.beginPath()
          ctx.arc(x, cy, 2.6 - k * 0.14, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // blocks on top; the block currently receiving the pulse lights up
      xs.forEach((x, i) => {
        if (i >= born) return
        // newborn blocks flash once as they snap into the chain
        const flash = !reduced && age - i * 380 < 500 ? 0.6 : 0
        drawBlock(x, cy, 34, i === activeBlock ? 1 : flash)
      })

      if (!reduced) raf = requestAnimationFrame(draw)
    }

    resize()
    startAt = performance.now() + 150
    if (reduced) draw(0)
    else raf = requestAnimationFrame(draw)
    window.addEventListener('resize', () => {
      resize()
      if (reduced) draw(0)
    })
    return () => cancelAnimationFrame(raf)
  }, [blocks])

  return <canvas ref={ref} className={`block h-full w-full ${className}`} aria-hidden="true" />
}
