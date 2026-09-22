import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  CreditCard,
  Database,
  ExternalLink,
  Globe,
  GripVertical,
  History as HistoryIcon,
  Inbox,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
  Zap,
} from 'lucide-react'
import LogoMark from './LogoMark'
import StatCounter from './StatCounter'
import { useRipple } from '../hooks/useRipple'
import { PRIMARY_HEX } from '../lib/theme'

type TabId = 'portfolio' | 'send' | 'staking' | 'gov' | 'history' | 'explore'

const TABS: { id: TabId; label: string; icon: typeof Wallet }[] = [
  { id: 'portfolio', label: 'Portfolio', icon: Wallet },
  { id: 'send', label: 'Send', icon: Send },
  { id: 'staking', label: 'Staking', icon: Database },
  { id: 'gov', label: 'GOV', icon: ShieldCheck },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'explore', label: 'Explore', icon: Compass },
]

// order matches the real app's own asset list exactly
const ASSETS = [
  { mark: 'x', name: 'XODE', network: 'Xode', color: PRIMARY_HEX, bal: '0.00 XON', price: '$5' },
  { mark: 'x', name: 'XODE EVM', network: 'XODE EVM', color: PRIMARY_HEX, bal: '0.00 XON', price: '$5' },
  { mark: 'x', name: 'Xaver', network: 'Xode', color: '#14b8a6', bal: '0.00 XAV', price: '$0' },
  { mark: 't', name: 'Tether USD', network: 'Xode', color: '#14b8a6', bal: '0.00 USDT', price: '$0.9995' },
]

const QUICK_ACTIONS = [
  { label: 'Send', icon: Send },
  { label: 'Receive', icon: ChevronDown },
  { label: 'Swap', icon: RefreshCw },
  { label: 'Buy', icon: CreditCard },
  { label: 'Stake', icon: Database },
]

const STAKING_STEPS = [
  'Delegate XON to an active collator.',
  'Collators produce blocks and earn rewards, shared with their delegators.',
  'Unstake whenever you want to stop delegating.',
]

const GOV_STEPS = [
  'The treasury council reviews on-chain proposals (spending, XCM, config).',
  'A proposal passes once it reaches its aye threshold.',
  'XODE has no public referenda — only council members can vote.',
]

const PROPOSALS = [
  { name: 'polkadotXcm.send', id: '#0 · 0x685c…2e4e6', aye: 3, ayeTotal: 3, nay: 0 },
  { name: 'treasury.spendLocal', id: '#5 · 0x9c7b…f8bea', aye: 0, ayeTotal: 3, nay: 0 },
]

const DAPPS = [
  { name: 'XODE dApp', desc: 'The XODE blockc…', color: PRIMARY_HEX },
  { name: 'XODE omni', desc: 'Turn your phone…', color: '#14b8a6' },
]

type Stage = 'idle' | 'form' | 'signing' | 'done'

function TokenIcon({ mark, color }: { mark: string; color: string }) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#08070d] font-mono2 text-sm"
      style={{ borderColor: `${color}88`, color }}
      aria-hidden="true"
    >
      {mark}
    </span>
  )
}

function PortfolioPanel({ total }: { total: number }) {
  return (
    <div className="space-y-5">
      <div className="mesh-bg relative overflow-hidden rounded-2xl border border-line-soft bg-panel-2 p-4">
        {/* a bold diagonal sweep, not just a soft corner glow — the real
            app's balance card reads as lit up, not just faintly tinted */}
        <div
          className="pointer-events-none absolute -right-10 -top-16 h-64 w-40 rotate-[28deg] bg-gradient-to-b from-primary via-[#7a48e0] to-transparent opacity-90 blur-md"
          aria-hidden="true"
        />
        <p className="font-mono2 relative text-[10px] uppercase tracking-[0.15em] text-dim">Total Balance</p>
        <p className="font-display relative mt-1 text-3xl font-bold">
          ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="relative mt-5 grid grid-cols-5 gap-1.5">
          {QUICK_ACTIONS.map((a) => (
            <motion.button
              key={a.label}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/30">
                <a.icon className="h-4 w-4 text-white" strokeWidth={1.75} />
              </span>
              <span className="font-mono2 text-[8.5px] text-dim">{a.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mesh-bg relative overflow-hidden rounded-2xl border border-line-soft bg-panel-2 p-4">
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br from-primary/50 to-[#7a48e0]/50 blur-2xl" />
        <p className="font-mono2 relative text-[10px] uppercase tracking-[0.15em] text-primary">Xode Omni</p>
        <p className="font-display relative mt-1 text-sm font-semibold">Run a node from your phone</p>
        <p className="font-mono2 relative mt-1 text-[11px] text-primary">Earn rewards →</p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <p className="font-display text-sm font-semibold">Assets</p>
            <SlidersHorizontal className="h-3.5 w-3.5 text-dim" strokeWidth={1.75} />
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-line-soft px-2.5 py-1">
            <Globe className="h-3 w-3 text-primary" strokeWidth={1.75} />
            <span className="font-mono2 text-[9.5px] text-dim">Xode Network</span>
            <ChevronDown className="h-3 w-3 text-dim" strokeWidth={1.75} />
          </span>
        </div>

        <div className="mt-2 space-y-0.5">
          {ASSETS.map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-line-soft bg-panel-2 px-3 py-2.5 transition-colors hover:bg-white/[0.03]">
              <TokenIcon mark={a.mark} color={a.color} />
              <div className="min-w-0 flex-1">
                <p className="font-display truncate text-sm font-semibold">{a.name}</p>
                <p className="font-mono2 truncate text-[10px] text-dim">
                  {a.bal} · <span className="text-primary">{a.network}</span>
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono2 text-xs">$0.00</p>
                <p className="font-mono2 text-[10px] text-dim">{a.price}</p>
              </div>
              <GripVertical className="h-3.5 w-3.5 shrink-0 text-faint" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

function SendPanel({
  amount,
  setAmount,
  stage,
  confirmSend,
  reset,
  txHash,
}: {
  amount: string
  setAmount: (v: string) => void
  stage: Stage
  confirmSend: () => void
  reset: () => void
  txHash: string
}) {
  if (stage === 'signing') {
    return (
      <div className="flex h-[260px] flex-col items-center justify-center gap-3">
        <span className="dot-bounce"><span /><span /><span /></span>
        <p className="font-mono2 text-xs text-dim">Signing with local key…</p>
        <p className="font-mono2 text-[10px] text-dim/60">keys never leave this device</p>
      </div>
    )
  }
  if (stage === 'done') {
    return (
      <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e]/15">
          <Check className="h-5 w-5 text-[#22c55e]" />
        </span>
        <p className="font-display text-sm font-semibold">Transaction confirmed</p>
        <p className="font-mono2 text-[10px] text-dim">hash {txHash}</p>
        <button onClick={reset} className="mt-2 font-mono2 text-[11px] text-mint-soft underline underline-offset-4">
          Back to portfolio
        </button>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <div>
        <label className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-dim">Token</label>
        <div className="mt-1.5 flex items-center justify-between rounded-xl border border-line-soft bg-black/40 px-3 py-2.5">
          <span className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full font-mono2 text-[9px] font-bold text-white"
              style={{ background: PRIMARY_HEX }}
            >
              XO
            </span>
            <span className="font-display text-sm font-semibold">XODE</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-dim" />
        </div>
      </div>
      <div>
        <label className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-dim">Amount · XON</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          className="mt-1.5 w-full rounded-xl border border-line-soft bg-black/40 px-3 py-2.5 font-mono2 text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-dim">Recipient</label>
        <input
          defaultValue="5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"
          className="mt-1.5 w-full rounded-xl border border-line-soft bg-black/40 px-3 py-2.5 font-mono2 text-[11px] outline-none focus:border-primary"
        />
      </div>
      <button
        onClick={confirmSend}
        className="brand-gradient flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-display text-sm font-semibold text-white"
      >
        <Send className="h-3.5 w-3.5" /> Review &amp; Sign
      </button>
    </div>
  )
}

function StakingPanel() {
  const { onPointerDown, layer } = useRipple()
  return (
    <div className="space-y-4">
      <div>
        <p className="font-display text-lg font-bold">Stake your XON</p>
        <p className="mt-1 font-display text-sm font-semibold text-primary">Earn rewards.</p>
      </div>

      <div className="mesh-bg relative overflow-hidden rounded-2xl border border-line-soft bg-panel-2 p-4">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primary/35 blur-2xl" />
        <p className="font-mono2 relative text-[10px] uppercase tracking-[0.15em] text-dim">Your stake</p>
        <p className="font-display relative mt-1 text-2xl font-bold">0.00 XON</p>
        <div className="relative mt-3 flex items-center gap-4 text-[10px] text-dim">
          <span>Available <strong className="font-semibold text-ink">0.00 XON</strong></span>
          <span>APY <strong className="font-semibold text-primary">0.00%</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-line-soft bg-panel-2 p-3 text-center">
          <Database className="mx-auto h-4 w-4 text-primary" strokeWidth={1.75} />
          <p className="font-display mt-1.5 text-lg font-bold">
            <StatCounter value={17} />
          </p>
          <p className="font-mono2 text-[9px] text-dim">Active collators</p>
        </div>
        <div className="rounded-xl border border-line-soft bg-panel-2 p-3 text-center">
          <ShieldCheck className="mx-auto h-4 w-4 text-primary" strokeWidth={1.75} />
          <p className="font-display mt-1.5 text-lg font-bold">
            <StatCounter value={20} decimals={2} />
          </p>
          <p className="font-mono2 text-[9px] text-dim">Total staked (XON)</p>
        </div>
      </div>

      <div>
        <p className="font-mono2 text-[10px] uppercase tracking-[0.15em] text-dim">Quick stake</p>
        <div className="mt-2 rounded-2xl border border-primary/40 bg-panel-2 p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Zap className="h-4 w-4 text-primary" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-display text-xs font-semibold">Recommended collator</p>
              <p className="font-mono2 text-[10px] text-dim">
                XqDrNx…RJGUM <span className="text-[#22c55e]">● Active</span>
              </p>
            </div>
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed text-dim">
            New to staking? We picked a reliable active collator for you.
          </p>
          <button
            onPointerDown={onPointerDown}
            className="brand-gradient relative mt-3 w-full overflow-hidden rounded-xl py-2.5 font-display text-sm font-semibold text-white"
          >
            Stake XON
            {layer}
          </button>
        </div>
        <button className="mt-2 flex w-full items-center justify-between rounded-xl border border-line-soft px-3.5 py-2.5 text-left font-mono2 text-[11px] text-dim">
          Choose a collator (advanced)
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div>
        <p className="font-mono2 text-[10px] uppercase tracking-[0.15em] text-dim">How it works</p>
        <ol className="mt-2 space-y-2.5">
          {STAKING_STEPS.map((s, i) => (
            <li key={s} className="flex gap-2.5 text-[11px] leading-relaxed text-dim">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono2 text-[9px] text-white">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function GovPanel() {
  return (
    <div className="space-y-4">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 font-mono2 text-[10px] text-primary">
        <ShieldCheck className="h-3 w-3" strokeWidth={1.75} /> On-chain governance
      </span>
      <div>
        <p className="font-display text-lg font-bold">XODE GOV</p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-dim">
          The treasury council decides on-chain proposals. Anyone can follow what is being decided;
          council members can vote.
        </p>
        <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-line-soft px-2.5 py-1 font-mono2 text-[10px] text-dim">
          You are an observer
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-line-soft bg-panel-2 p-3 text-center">
          <p className="font-display text-lg font-bold">
            <StatCounter value={5} />
          </p>
          <p className="font-mono2 text-[9px] text-dim">Council members</p>
        </div>
        <div className="rounded-xl border border-line-soft bg-panel-2 p-3 text-center">
          <p className="font-display text-lg font-bold">
            <StatCounter value={2} />
          </p>
          <p className="font-mono2 text-[9px] text-dim">Open proposals</p>
        </div>
      </div>

      <div>
        <p className="font-mono2 text-[10px] uppercase tracking-[0.15em] text-dim">Open proposals</p>
        <div className="mt-2 space-y-2.5">
          {PROPOSALS.map((p) => (
            <div key={p.name} className="rounded-xl border border-line-soft bg-panel-2 p-3">
              <div className="flex items-center justify-between">
                <p className="font-display text-xs font-semibold">{p.name}</p>
                <span className="font-mono2 text-[9px] text-faint">{p.id}</span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between font-mono2 text-[9px] text-dim">
                  <span className="text-[#22c55e]">✓ Aye</span>
                  <span>{p.aye} / {p.ayeTotal}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#22c55e]"
                    style={{ width: `${(p.aye / p.ayeTotal) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between font-mono2 text-[9px] text-dim">
                  <span className="text-[#ff5872]">⊘ Nay</span>
                  <span>{p.nay}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono2 text-[10px] uppercase tracking-[0.15em] text-dim">How it works</p>
        <ol className="mt-2 space-y-2.5">
          {GOV_STEPS.map((s, i) => (
            <li key={s} className="flex gap-2.5 text-[11px] leading-relaxed text-dim">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono2 text-[9px] text-white">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function HistoryPanel({ sent }: { sent: { amt: string; ts: string } | null }) {
  const [view, setView] = useState<'transfers' | 'transactions'>('transfers')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-line-soft bg-black/30 p-1">
        {(['transfers', 'transactions'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-lg py-1.5 font-display text-[11px] font-semibold capitalize transition-colors ${
              view === v ? 'bg-primary text-white' : 'text-dim hover:text-foreground'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line-soft py-2 font-mono2 text-[11px] text-primary">
        <ExternalLink className="h-3 w-3" /> View full history on Explorer
      </button>

      {view === 'transfers' && sent ? (
        <div className="flex items-center gap-3 rounded-xl border border-line px-2.5 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
            <Send className="h-4 w-4 text-primary" />
          </span>
          <div className="flex-1">
            <p className="font-display text-sm font-semibold">Sent XODE</p>
            <p className="font-mono2 text-[10px] text-dim">{sent.ts}</p>
          </div>
          <p className="font-mono2 text-xs text-[#ff5872]">-{sent.amt}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Inbox className="h-8 w-8 text-faint" strokeWidth={1.5} />
          <p className="font-mono2 text-[12px] text-dim">No transactions found.</p>
        </div>
      )}
    </div>
  )
}

function ExplorePanel() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono2 text-[10px] uppercase tracking-[0.15em] text-primary">dApps</p>
        <p className="font-display mt-1 text-lg font-bold">Explore</p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-dim">Discover XODE dApps and open them in-wallet.</p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-line-soft bg-black/30 px-3 py-2.5">
        <Search className="h-3.5 w-3.5 text-dim" />
        <span className="font-mono2 text-[11px] text-faint">Search or enter dApp URL</span>
      </div>

      <div>
        <p className="font-mono2 text-[10px] uppercase tracking-[0.15em] text-dim">Featured</p>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {DAPPS.map((d) => (
            <div key={d.name} className="rounded-xl border border-line-soft bg-panel-2 p-3">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full font-mono2 text-[10px] font-bold text-white"
                style={{ background: d.color }}
              >
                {d.name[5]}
              </span>
              <p className="font-display mt-2 text-xs font-semibold">{d.name}</p>
              <p className="font-mono2 mt-0.5 text-[10px] text-dim">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function WalletMock({
  forcedTab,
  interactive = true,
}: {
  /** when set, overrides the displayed tab — used to sync the mockup with
      a scroll-driven feature narrative instead of user taps */
  forcedTab?: TabId
  interactive?: boolean
} = {}) {
  const reduced = useReducedMotion()
  const [internalTab, setInternalTab] = useState<TabId>('portfolio')
  const tab = forcedTab ?? internalTab
  const [amount, setAmount] = useState('250')
  const [stage, setStage] = useState<Stage>('idle')
  const [txHash] = useState('0x7f3a…e9c2')
  const [sent, setSent] = useState<{ amt: string; ts: string } | null>(null)

  const total = useMemo(() => (sent ? 0 : 0), [sent])

  // subtle cursor-reactive tilt — only for the standalone interactive demo,
  // never the pinned/forced instance, desktop pointers only
  const cardRef = useRef<HTMLDivElement>(null)
  const rawRotateX = useMotionValue(0)
  const rawRotateY = useMotionValue(0)
  const rotateX = useSpring(rawRotateX, { stiffness: 150, damping: 20 })
  const rotateY = useSpring(rawRotateY, { stiffness: 150, damping: 20 })

  useEffect(() => {
    if (!interactive || reduced) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = cardRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      rawRotateY.set(px * 6)
      rawRotateX.set(-py * 6)
    }
    const onLeave = () => {
      rawRotateX.set(0)
      rawRotateY.set(0)
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [interactive, reduced, rawRotateX, rawRotateY])

  const confirmSend = () => {
    setStage('signing')
    setTimeout(() => {
      setStage('done')
      setSent({ amt: amount, ts: new Date().toLocaleTimeString() })
    }, 1600)
  }

  const reset = () => {
    setStage('idle')
    setInternalTab('portfolio')
  }

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        ref={cardRef}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={`w-[340px] select-none overflow-hidden rounded-[2rem] border border-line bg-panel shadow-[0_40px_120px_-20px_rgba(255,20,147,0.30)] ${
          interactive ? '' : 'pointer-events-none'
        }`}
      >
      {/* App header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <LogoMark size={26} className="shrink-0" />
          <div>
            <p className="font-display text-sm font-bold tracking-tight">XTERIUM</p>
            <p className="font-mono2 text-[10.5px] text-dim">
              wallet101 <span className="text-faint">(15kQju…BB7V4)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-dim">
          <motion.span
            animate={reduced ? undefined : { rotate: [0, -14, 12, -8, 0] }}
            transition={reduced ? undefined : { duration: 0.7, repeat: Infinity, repeatDelay: 4.5, ease: 'easeInOut' }}
          >
            <Bell className="h-4 w-4" strokeWidth={1.75} />
          </motion.span>
          <Settings className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>

      {/* Tab panels */}
      <div className="h-[500px] overflow-y-auto px-5 pb-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={reduced ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'portfolio' && <PortfolioPanel total={total} />}
            {tab === 'send' && (
              <SendPanel amount={amount} setAmount={setAmount} stage={stage} confirmSend={confirmSend} reset={reset} txHash={txHash} />
            )}
            {tab === 'staking' && <StakingPanel />}
            {tab === 'gov' && <GovPanel />}
            {tab === 'history' && <HistoryPanel sent={sent} />}
            {tab === 'explore' && <ExplorePanel />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom tab bar */}
      <div className="grid grid-cols-6 gap-0.5 border-t border-line-soft px-1 pb-3 pt-2.5">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <motion.button
              key={t.id}
              onClick={() => setInternalTab(t.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-1 pt-1"
            >
              <span className={`h-0.5 w-5 rounded-full transition-colors duration-200 ${active ? 'bg-primary' : 'bg-transparent'}`} />
              <t.icon className={`h-4 w-4 transition-colors duration-200 ${active ? 'text-primary' : 'text-dim'}`} strokeWidth={1.75} />
              <span className={`font-mono2 text-[8px] transition-colors duration-200 ${active ? 'text-primary' : 'text-faint'}`}>
                {t.label}
              </span>
            </motion.button>
          )
        })}
      </div>
      </motion.div>
    </div>
  )
}
