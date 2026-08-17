import { Apple, Chrome, Play } from 'lucide-react'
import BlinkDots from '../components/BlinkDots'
import SectionMarker from '../components/SectionMarker'

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
    href: 'https://play.google.com/store/apps/details?id=com.xterium.wallet',
  },
  {
    icon: Apple,
    top: 'Download on the',
    name: 'App Store',
    href: 'https://apps.apple.com/ph/app/xterium/id6745164228',
  },
]

export default function Download() {
  return (
    <section id="download" className="relative overflow-hidden border-t border-line py-28">
      <BlinkDots gap={26} baseAlpha={0.06} />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <div className="flex justify-center">
          <SectionMarker no="04" label="Download" />
        </div>
        <h2 className="font-display mt-5 text-4xl font-bold leading-[1.02] tracking-[-0.02em] md:text-6xl">
          Seamless access —
          <br />
          anytime, <span className="text-outline">anywhere.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl leading-relaxed text-dim">
          Manage your digital assets and interact with the Xode ecosystem through a secure,
          easy-to-use wallet designed for all your devices. Browser or mobile — Xterium has
          you covered.
        </p>

        {/* store links — native buttons; dots wake up and march on hover */}
        <div className="mt-10 flex flex-wrap items-stretch justify-center gap-3">
          {STORES.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              className="btn-dots lift group flex items-center gap-3.5 rounded-lg border border-[rgba(239,250,246,0.09)] bg-panel px-7 py-4 transition-colors duration-300 hover:border-[rgba(47,224,194,0.4)] hover:bg-panel-2 hover:shadow-[0_0_0_1px_rgba(47,224,194,0.12),0_16px_44px_-16px_rgba(47,224,194,0.35)]"
            >
              <s.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <span className="relative text-left">
                <span className="font-mono2 block text-[9px] uppercase tracking-[0.18em] text-dim">
                  {s.top}
                </span>
                <span className="font-display block text-[15px] font-semibold leading-tight">
                  {s.name}
                </span>
              </span>
            </a>
          ))}
        </div>

        <p className="font-mono2 mt-7 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-dim">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary" />
          Also available for Firefox and Chromium-based browsers
        </p>

        {/* S.U.R.E trust strip — slim, single row */}
        <div className="mt-14 rounded-lg border border-[rgba(239,250,246,0.09)] bg-panel px-6 py-7">
          <p className="font-mono2 text-[11px] uppercase tracking-[0.22em] text-dim">
            The Xterium promise<span className="blink text-primary">_</span>
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {SURE.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <img src={s.src} alt={s.label} className="h-10 w-10 object-contain" />
                <span className="font-mono2 text-[10px] uppercase tracking-[0.16em] text-mint-soft">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
