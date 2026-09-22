import { Apple, Chrome, Play } from 'lucide-react'
import SectionMarker from '../components/SectionMarker'
import { Reveal, RevealGroup } from '../components/Reveal'
import SplitReveal from '../components/SplitReveal'
import { useRipple } from '../hooks/useRipple'

const SURE = [
  { src: '/assets/tinted/about-sure-s.png', label: 'Safe' },
  { src: '/assets/tinted/about-sure-u.png', label: 'User-friendly' },
  { src: '/assets/tinted/about-sure-r.png', label: 'Reliable' },
  { src: '/assets/tinted/about-sure-e.png', label: 'Efficient' },
]

const STORES = [
  {
    icon: Chrome,
    top: 'Available in the',
    name: 'Chrome Web Store',
    href: 'https://chromewebstore.google.com/detail/xterium/klfhdmiebenifpdmdmkjicdohjilabdg',
  },
  {
    icon: Play,
    top: 'Get it on',
    name: 'Google Play',
    href: 'https://play.google.com/store/apps/details?id=net.xode.xtr',
  },
  {
    icon: Apple,
    top: 'Download on the',
    name: 'App Store',
    href: 'https://apps.apple.com/ph/app/xterium-xode-wallet/id6809356501',
  },
]

function StoreLink({ s }: { s: (typeof STORES)[number] }) {
  const { onPointerDown, layer } = useRipple()
  return (
    <a
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={s.name}
      onPointerDown={onPointerDown}
      className="voxel-card relative flex items-center gap-3.5 overflow-hidden border border-line-soft bg-panel px-7 py-4 hover:border-primary/40 hover:bg-panel-2"
    >
      <s.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
      <span className="relative text-left">
        <span className="font-mono2 block text-[9px] uppercase tracking-[0.18em] text-dim">{s.top}</span>
        <span className="font-display block text-[15px] font-semibold leading-tight">{s.name}</span>
      </span>
      {layer}
    </a>
  )
}

export default function Download() {
  return (
    <section id="download" className="snap-section relative flex min-h-[100svh] flex-col justify-center border-t border-line py-24">
      <div className="relative mx-auto w-full max-w-4xl px-5 text-center sm:px-8">
        <RevealGroup stagger={0.12}>
          <Reveal className="flex justify-center">
            <SectionMarker no="03" label="Download" />
          </Reveal>
          <Reveal
            as="h2"
            variant="sharp"
            className="mt-5 text-4xl font-bold leading-[0.98] tracking-[-0.02em] sm:text-5xl md:text-7xl"
          >
            <SplitReveal text="Seamless access —" />
            <br />
            anytime,{' '}
            <SplitReveal as="span" text="anywhere." className="voxel-heading inline-block font-pixel tracking-normal" />
          </Reveal>
          <Reveal as="p" className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-dim">
            One wallet, every device. Get Xterium on your browser or phone and take
            the Xode ecosystem with you.
          </Reveal>

          {/* store links — native buttons; dots wake up and march on hover */}
          <Reveal className="mt-10 flex flex-wrap items-stretch justify-center gap-3">
            {STORES.map((s) => (
              <StoreLink key={s.name} s={s} />
            ))}
          </Reveal>

          <Reveal as="p" className="font-mono2 mt-7 text-[11px] uppercase tracking-[0.18em] text-dim">
            Also available for Firefox and Chromium-based browsers
          </Reveal>

          {/* S.U.R.E trust strip — thin dividers between items, each
              snapping in on its own instead of arriving as one block */}
          <Reveal variant="sharp" className="mt-14 rounded-lg border border-line-soft bg-panel px-6 py-7">
            <p className="font-mono2 text-center text-[11px] uppercase tracking-[0.22em] text-dim">
              The Xterium promise
            </p>
            <RevealGroup
              stagger={0.06}
              className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4"
            >
              {SURE.map((s) => (
                <Reveal
                  key={s.label}
                  variant="sharp"
                  className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:border-l sm:border-line-soft sm:pl-6 sm:first:border-l-0 sm:first:pl-0"
                >
                  <img src={s.src} alt={s.label} className="h-10 w-10 object-contain" />
                  <span className="font-mono2 text-[10px] uppercase tracking-[0.16em] text-mint-soft">
                    {s.label}
                  </span>
                </Reveal>
              ))}
            </RevealGroup>
          </Reveal>
        </RevealGroup>
      </div>
    </section>
  )
}
