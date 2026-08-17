import BlinkDots from '../components/BlinkDots'
import { ArrowLeftRight, FileCode2, KeyRound, Layers } from 'lucide-react'

const FEATURES = [
  {
    no: '01',
    icon: KeyRound,
    title: 'Secure key storage',
    body: 'Mnemonics and private keys are encrypted with your password and stored only on your device. Biometric unlock keeps them behind you — literally.',
    img: '/assets/gen/clear/feature-biometric.png',
    alt: 'Biometric authentication illustration',
  },
  {
    no: '02',
    icon: ArrowLeftRight,
    title: 'Send & receive tokens',
    body: 'Transfer any Xode token with a clear balance breakdown — total, transferable, and reserved — before you sign. QR-ready for in-person payments.',
    img: '/assets/gen/clear/feature-pay.png',
    alt: 'Pay with QR code illustration',
  },
  {
    no: '03',
    icon: FileCode2,
    title: 'Smart contract interaction',
    body: 'Connect to Xode dApps, swap between assets, and sign contract calls in-place with human-readable transaction review.',
    img: '/assets/gen/clear/feature-swaps.png',
    alt: 'Token swaps illustration',
  },
  {
    no: '04',
    icon: Layers,
    title: 'Token management',
    body: 'Track every asset across accounts. Add custom tokens, watch balances update, and export backups anytime.',
    img: '/assets/gen/clear/feature-wallet.png',
    alt: 'Wallet and balance illustration',
  },
]

export default function Features() {
  return (
    <section id="features" className="relative overflow-hidden py-28">
      <BlinkDots gap={20} color="239, 250, 246" baseAlpha={0.05} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-pixel text-[11px] uppercase tracking-[0.3em] text-primary sm:text-xs">
              Why Xterium
            </p>
            <h2 className="font-display mt-5 max-w-2xl text-4xl font-bold leading-[1.02] tracking-[-0.02em] md:text-6xl">
              A wallet that works
              <br />
              the way <span className="text-outline">you do.</span>
            </h2>
          </div>
          <p className="font-mono2 max-w-xs text-[12px] leading-relaxed uppercase tracking-[0.14em] text-dim">
            Four primitives — keys, transfers, contracts, assets — one extension
            <span className="blink text-primary">_</span>
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <article
              key={f.no}
              className="lift dot-frame group relative rounded-2xl bg-panel p-7 hover:bg-panel-2 hover:shadow-[0_20px_60px_-20px_rgba(47,224,194,0.25)] sm:p-9"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12">
                  <f.icon className="h-5 w-5 text-primary" />
                </span>
                <span className="font-pixel text-sm text-primary/60">{f.no}</span>
              </div>

              <h3 className="font-display mt-6 text-2xl font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-3 leading-relaxed text-dim">{f.body}</p>

              {/* clear brand illustration with a gentle float + hover pop */}
              <div className="dot-grid-fine mt-7 flex h-48 items-center justify-center overflow-hidden rounded-xl border border-line-soft bg-black/25 p-5">
                <img
                  src={f.img}
                  alt={f.alt}
                  className="float-y max-h-full w-auto object-contain drop-shadow-[0_0_18px_rgba(47,224,194,0.25)] transition-transform duration-500 group-hover:scale-[1.07]"
                  style={{ animationDelay: `${i * 0.9}s` }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
