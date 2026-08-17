import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Check, Copy, RefreshCw, Send, Wallet } from 'lucide-react'

type Token = { sym: string; name: string; bal: number; price: number; change: number; color: string }

const TOKENS: Token[] = [
  { sym: 'XODE', name: 'Xode', bal: 12480.5, price: 0.0824, change: 6.4, color: '#2fe0c2' },
  { sym: 'USDT', name: 'Tether', bal: 860.0, price: 1.0, change: 0.01, color: '#22c55e' },
  { sym: 'DOT', name: 'Polkadot', bal: 142.3, price: 6.12, change: -1.8, color: '#ff5872' },
]

type Stage = 'idle' | 'form' | 'signing' | 'done'

function shorten(addr: string) {
  return addr.slice(0, 6) + '…' + addr.slice(-4)
}

export default function WalletMock() {
  const [tab, setTab] = useState<'balance' | 'send' | 'activity'>('balance')
  const [copied, setCopied] = useState(false)
  const [amount, setAmount] = useState('250')
  const [stage, setStage] = useState<Stage>('idle')
  const [txHash] = useState('0x7f3a…e9c2')
  const [sent, setSent] = useState<{ amt: string; ts: string } | null>(null)

  const total = useMemo(
    () => TOKENS.reduce((s, t) => s + t.bal * t.price, 0) - (sent ? parseFloat(sent.amt) * TOKENS[0].price : 0),
    [sent],
  )
  const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address)
    } catch {
      /* clipboard may be unavailable */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const startSend = () => {
    setStage('form')
    setTab('send')
  }

  const confirmSend = () => {
    setStage('signing')
    setTimeout(() => {
      setStage('done')
      setSent({ amt: amount, ts: new Date().toLocaleTimeString() })
    }, 1600)
  }

  const reset = () => {
    setStage('idle')
    setTab('balance')
  }

  return (
    <div className="w-[340px] select-none overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_40px_120px_-20px_rgba(47,224,194,0.30)]">
      {/* Extension chrome */}
      <div className="flex items-center gap-2 border-b border-line-soft bg-panel-2 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-2 flex items-center gap-1.5 font-mono2 text-[10px] text-dim">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
          xterium · extension
        </div>
        <RefreshCw className="ml-auto h-3 w-3 text-dim" />
      </div>

      {/* Wallet header */}
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Wallet className="h-5 w-5 text-[#04130f]" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold">Main Wallet</p>
              <button
                onClick={copy}
                className="flex items-center gap-1 font-mono2 text-[11px] text-dim transition-colors hover:text-mint-soft"
              >
                {shorten(address)}
                {copied ? <Check className="h-3 w-3 text-[#22c55e]" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
          <span className="rounded-full border border-line px-2.5 py-1 font-mono2 text-[10px] text-mint-soft">XODE MAINNET</span>
        </div>

        <div className="mt-5">
          <p className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-dim">Total balance</p>
          <p className="font-display text-4xl font-bold tracking-tight">
            ${total.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 font-mono2 text-[11px] text-[#22c55e]">▲ 3.2% today</p>
        </div>

        {/* Tabs */}
        <div className="mt-5 grid grid-cols-3 gap-1 rounded-xl border border-line-soft bg-black/30 p-1">
          {(['balance', 'send', 'activity'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg py-1.5 font-display text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                tab === t ? 'bg-primary text-[#04130f]' : 'text-dim hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab panels */}
      <div className="min-h-[228px] px-5 py-4">
        {tab === 'balance' && (
          <div className="space-y-1">
            {TOKENS.map((t) => (
              <div key={t.sym} className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.03]">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full font-mono2 text-[10px] font-bold text-black"
                  style={{ background: t.color }}
                >
                  {t.sym.slice(0, 2)}
                </span>
                <div className="flex-1">
                  <p className="font-display text-sm font-semibold">{t.sym}</p>
                  <p className="text-[11px] text-dim">{t.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono2 text-xs">{t.bal.toLocaleString()}</p>
                  <p className={`font-mono2 text-[10px] ${t.change >= 0 ? 'text-[#22c55e]' : 'text-[#ff5872]'}`}>
                    {t.change >= 0 ? '+' : ''}
                    {t.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'send' && (
          <div>
            {stage === 'form' || stage === 'idle' ? (
              <div className="space-y-3">
                <div>
                  <label className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-dim">Amount · XODE</label>
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-display text-sm font-semibold text-[#04130f] hover:text-white transition-colors hover:bg-[#0d9488]"
                >
                  <Send className="h-3.5 w-3.5" /> Review &amp; Sign
                </button>
              </div>
            ) : stage === 'signing' ? (
              <div className="flex h-[180px] flex-col items-center justify-center gap-3">
                <span className="dot-bounce"><span /><span /><span /></span>
                <p className="font-mono2 text-xs text-dim">Signing with local key…</p>
                <p className="font-mono2 text-[10px] text-dim/60">keys never leave this device</p>
              </div>
            ) : (
              <div className="flex h-[180px] flex-col items-center justify-center gap-2 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e]/15">
                  <Check className="h-5 w-5 text-[#22c55e]" />
                </span>
                <p className="font-display text-sm font-semibold">Transaction confirmed</p>
                <p className="font-mono2 text-[10px] text-dim">hash {txHash}</p>
                <button onClick={reset} className="mt-2 font-mono2 text-[11px] text-mint-soft underline underline-offset-4">
                  Back to balance
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'activity' && (
          <div className="space-y-1">
            {sent && (
              <div className="flex items-center gap-3 rounded-xl border border-line px-2 py-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </span>
                <div className="flex-1">
                  <p className="font-display text-sm font-semibold">Sent XODE</p>
                  <p className="font-mono2 text-[10px] text-dim">{sent.ts}</p>
                </div>
                <p className="font-mono2 text-xs text-[#ff5872]">-{sent.amt}</p>
              </div>
            )}
            {[
              { d: 'Received XODE', a: '+1,200', in: true, ts: 'Yesterday' },
              { d: 'Contract call · staking', a: '-400', in: false, ts: '2 days ago' },
              { d: 'Received USDT', a: '+860', in: true, ts: 'Aug 12' },
            ].map((r) => (
              <div key={r.d} className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.03]">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${r.in ? 'bg-[#22c55e]/15' : 'bg-white/5'}`}>
                  {r.in ? (
                    <ArrowDownLeft className="h-4 w-4 text-[#22c55e]" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-dim" />
                  )}
                </span>
                <div className="flex-1">
                  <p className="font-display text-sm font-semibold">{r.d}</p>
                  <p className="font-mono2 text-[10px] text-dim">{r.ts}</p>
                </div>
                <p className={`font-mono2 text-xs ${r.in ? 'text-[#22c55e]' : 'text-dim'}`}>{r.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2 border-t border-line-soft px-5 py-4">
        <button
          onClick={startSend}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 font-display text-xs font-semibold text-[#04130f] transition-colors hover:bg-[#0d9488] hover:text-white"
        >
          <Send className="h-3 w-3" /> Send
        </button>
        <button
          onClick={() => setTab('balance')}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-line py-2 font-display text-xs font-semibold text-mint-soft transition-colors hover:bg-white/5"
        >
          <ArrowDownLeft className="h-3 w-3" /> Receive
        </button>
      </div>
    </div>
  )
}
