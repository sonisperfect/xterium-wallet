import BlinkDots from '../components/BlinkDots'
import WalletMock from '../components/WalletMock'

const SCREENS = [
  {
    src: '/assets/gen/clean/screen-biometric.png',
    title: 'Biometric unlock',
    desc: 'Unlock and sign with biometrics — your data stays encrypted locally.',
  },
  {
    src: '/assets/gen/clean/screen-pay.png',
    title: 'Pay with review',
    desc: 'Every payment shows token, amount, price, and recipient before you confirm.',
  },
  {
    src: '/assets/gen/clean/screen-wallets.png',
    title: 'Multi-wallet management',
    desc: 'Create, import, and switch between wallets across networks in one place.',
  },
]

const STORE_SHOTS = [
  { src: '/assets/store/welcome.png', label: 'Welcome & login' },
  { src: '/assets/store/balance.png', label: 'Total balance' },
  { src: '/assets/store/qr-pay.png', label: 'Scan QR to pay' },
  { src: '/assets/store/history.png', label: 'Payments & transfers' },
  { src: '/assets/store/explore.png', label: 'Explore services' },
]

export default function AppShowcase() {
  return (
    <section id="showcase" className="relative overflow-hidden border-t border-line py-28">
      <BlinkDots gap={26} baseAlpha={0.06} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <p className="font-pixel text-[11px] uppercase tracking-[0.3em] text-primary sm:text-xs">
          The app
        </p>
        <h2 className="font-display mt-5 max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.02em] md:text-6xl">
          Your assets,
          <br />
          <span className="text-mint-soft">clearly in view.</span>
        </h2>

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          {/* real app screenshot */}
          <div className="relative mx-auto">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 45%, rgba(47,224,194,0.16), transparent 70%)' }}
              aria-hidden="true"
            />
            <img
              src="/assets/why-xterium.png"
              alt="Xterium Wallet app — portfolio, tokens, send and swap"
              className="lift relative mx-auto w-full max-w-[360px]"
            />
          </div>

          <div>
            <ul className="space-y-0">
              {[
                ['Real-time portfolio', 'Total balance with per-token breakdown and 24h change.'],
                ['One-tap Send / Receive / Swap', 'Core actions surfaced directly on the balance screen.'],
                ['Explore & history built in', 'Track every transaction and discover Xode dApps.'],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-5 border-t border-line-soft py-6 last:border-b">
                  <span className="font-pixel mt-1 text-xs text-primary/70">0{i + 1}</span>
                  <div>
                    <p className="font-display text-lg font-semibold">{t}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-dim">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* official Chrome Web Store screenshots — freshly captured from the store listing */}
        <div className="mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h3 className="font-display text-2xl font-semibold tracking-tight">
              Fresh from the <span className="text-primary">Chrome Web Store</span>
            </h3>
            <p className="font-mono2 text-[11px] uppercase tracking-[0.18em] text-dim">
              official listing screenshots<span className="blink text-primary">_</span>
            </p>
          </div>
          <div className="scroll-slim mt-8 flex gap-5 overflow-x-auto pb-4">
            {STORE_SHOTS.map((s) => (
              <figure key={s.src} className="lift dot-frame group w-[420px] shrink-0 overflow-hidden rounded-2xl bg-panel">
                <img
                  src={s.src}
                  alt={`Xterium extension — ${s.label}`}
                  className="aspect-[8/5] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <figcaption className="font-mono2 flex items-center gap-2 px-5 py-3.5 text-[11px] uppercase tracking-[0.18em] text-dim">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary" />
                  {s.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* real feature screenshots */}
        <div className="mt-20 grid gap-5 md:grid-cols-3">
          {SCREENS.map((s) => (
            <article key={s.title} className="lift dot-frame group overflow-hidden rounded-2xl bg-panel">
              <div className="dot-grid-fine flex h-[340px] items-center justify-center border-b border-line-soft bg-black/25 p-6">
                <img
                  src={s.src}
                  alt={s.title}
                  className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dim">{s.desc}</p>
              </div>
            </article>
          ))}
        </div>

        {/* live interactive demo */}
        <div className="mt-24 grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="font-pixel text-[11px] uppercase tracking-[0.3em] text-primary sm:text-xs">
              Live demo
            </p>
            <h3 className="font-display mt-5 text-3xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
              Don't take our word for it —
              <br />
              <span className="text-outline">click the wallet.</span>
            </h3>
            <p className="mt-5 max-w-md leading-relaxed text-dim">
              A working miniature of the extension runs right here. Switch tabs, copy the address,
              and run the full Send flow — review, sign, confirm — exactly like the real thing.
            </p>
            <div className="font-mono2 mt-7 flex flex-wrap gap-x-8 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-dim">
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> No sign-up</span>
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> No real funds</span>
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Purely local</span>
            </div>
          </div>
          <div className="relative mx-auto">
            <div className="dot-frame absolute -inset-5 rounded-[1.8rem]" aria-hidden="true" />
            <WalletMock />
          </div>
        </div>
      </div>
    </section>
  )
}
