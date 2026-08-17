import { useEffect, useState } from 'react'
import CornerTicks from './CornerTicks'

const LINES: Array<{ text: string; tone?: 'cmd' | 'dim' | 'ok' | 'warn' }> = [
  { text: '$ xterium sign --review', tone: 'cmd' },
  { text: '┌─ TRANSACTION REVIEW ──────────────┐', tone: 'dim' },
  { text: '  NETWORK   XODE MAINNET', tone: 'dim' },
  { text: '  FROM      5FHn…94ty · Main Wallet' },
  { text: '  TO        5Gkm…21xp' },
  { text: '  AMOUNT    250.00 XON', tone: 'ok' },
  { text: '  FEE       0.010 XODE', tone: 'dim' },
  { text: '  NONCE     18', tone: 'dim' },
  { text: '└─ STATUS     AWAITING SIGNATURE', tone: 'warn' },
]

const toneClass: Record<string, string> = {
  cmd: 'text-mint-soft',
  dim: 'text-faint',
  ok: 'phosphor',
  warn: 'text-mint-soft',
}

/**
 * TerminalReview — a code-drawn signing terminal that types out a
 * human-readable transaction review, mirroring the extension's real flow.
 */
export default function TerminalReview() {
  const [chars, setChars] = useState(0)
  const total = LINES.reduce((n, l) => n + l.text.length + 1, 0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setChars(total)
      return
    }
    let n = 0
    const id = window.setInterval(() => {
      n += 2
      if (n >= total) {
        setChars(total)
        window.clearInterval(id)
      } else {
        setChars(n)
      }
    }, 24)
    return () => window.clearInterval(id)
  }, [total])

  let budget = chars
  const visible = LINES.map((l) => {
    const take = Math.max(0, Math.min(l.text.length, budget))
    budget -= l.text.length + 1
    return { ...l, shown: l.text.slice(0, take), done: take >= l.text.length }
  }).filter((l) => l.shown.length > 0 || l.done)

  const done = chars >= total

  return (
    <div className="terminal-scan frame-mint relative rounded-lg bg-[#020c09]/90 shadow-[0_0_0_1px_rgba(2,12,9,0.6),0_24px_80px_-32px_rgba(47,224,194,0.28)] backdrop-blur-sm">
      <CornerTicks />
      {/* title bar */}
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/12" />
          <span className="h-2 w-2 rounded-full bg-white/12" />
          <span className="h-2 w-2 rounded-full bg-primary/60" />
        </div>
        <span className="spec-label">xterium — sign · review</span>
        <span className="font-mono2 text-[10px] text-faint">sh</span>
      </div>
      {/* body */}
      <div className="font-mono2 min-h-[218px] px-4 py-4 text-[11.5px] leading-[1.75]">
        {visible.map((l, i) => (
          <p key={i} className={`whitespace-pre ${toneClass[l.tone ?? ''] ?? ''}`}>
            {l.shown}
            {!l.done && <span className="blink text-primary">▌</span>}
          </p>
        ))}
        {done && <span className="blink text-primary">▌</span>}
      </div>
      {/* status strip */}
      <div className="flex items-center justify-between border-t border-line px-4 py-2">
        <span className="spec-label flex items-center gap-2">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary" />
          keys never leave device
        </span>
        <span className="spec-label">utf-8 · ln 9</span>
      </div>
    </div>
  )
}
