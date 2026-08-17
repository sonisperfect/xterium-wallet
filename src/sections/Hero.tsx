import { useEffect, useRef, useState } from 'react'
import DotField from '../components/DotField'
import BlinkDots from '../components/BlinkDots'
import DotMatrixText from '../components/DotMatrixText'
import RotatingBadge from '../components/RotatingBadge'
import Magnetic from '../components/Magnetic'
import TerminalReview from '../components/TerminalReview'

export default function Hero() {
  const contentRef = useRef<HTMLDivElement>(null)
  const [block, setBlock] = useState(8412336)

  // gentle parallax: hero content drifts up and fades as you scroll away
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = contentRef.current
        if (!el) return
        const y = window.scrollY
        if (y < window.innerHeight * 1.2) {
          el.style.transform = `translateY(${y * 0.22}px)`
          el.style.opacity = String(Math.max(0.25, 1 - y / (window.innerHeight * 0.85)))
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // ambient chain ticker — decorative block counter
  useEffect(() => {
    const id = window.setInterval(() => setBlock((b) => b + 1), 2400)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* living dot mesh + blinking lattice + engineering grid */}
      <DotField />
      <BlinkDots gap={26} baseAlpha={0.05} />
      <div className="grid-lines grid-pan pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(47,224,194,0.09), transparent 65%), radial-gradient(ellipse 90% 60% at 50% 110%, rgba(4,19,15,0.9), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div
        ref={contentRef}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pt-36 pb-24 will-change-transform sm:px-8"
      >
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="font-mono2 mb-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-faint">
              <span className="text-primary">00</span>
              <span className="inline-block h-px w-8 bg-[rgba(47,224,194,0.35)]" aria-hidden="true" />
              <span className="text-dim">Browser extension · Xode ecosystem</span>
            </p>

            <h1 className="font-display max-w-5xl text-[11vw] leading-[0.98] font-bold tracking-[-0.03em] sm:text-[7.5vw] lg:text-[4.9rem]">
              <span className="rise-in inline-block" style={{ animationDelay: '150ms' }}>Your gateway to</span>
            </h1>

            {/* classic dot-matrix headline — dots settle and blink like an LED board */}
            <div className="rise-in mt-2 max-w-3xl" style={{ animationDelay: '300ms' }}>
              <DotMatrixText text="BLOCKCHAIN." height={130} gap={6} />
            </div>
            <p className="sr-only">Your gateway to blockchain.</p>

            <div className="mt-10 flex max-w-2xl flex-col gap-8">
              <p className="rise-in text-base leading-relaxed text-dim sm:text-lg" style={{ animationDelay: '0.5s' }}>
                Secure, seamless, and powerful. Manage digital assets and interact with
                Xode dApps — right from your browser.
              </p>

              <div className="rise-in flex flex-wrap items-center gap-4" style={{ animationDelay: '0.62s' }}>
                <Magnetic>
                  <a
                    href="#download"
                    className="group inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-[15px] font-semibold tracking-tight text-[#04130f] transition-shadow duration-300 hover:shadow-[0_0_36px_rgba(47,224,194,0.45)]"
                  >
                    Download the wallet
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center gap-3 rounded-full border border-[rgba(239,250,246,0.25)] px-8 py-4 text-[15px] font-medium transition-colors duration-300 hover:border-primary hover:text-primary"
                  >
                    See how it works
                  </a>
                </Magnetic>
              </div>

              <div className="rise-in font-mono2 flex flex-wrap items-center gap-x-8 gap-y-3 text-[12px] uppercase tracking-[0.16em] text-dim" style={{ animationDelay: '0.74s' }}>
                <span className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  Live on Xode mainnet
                </span>
                <span>Keys stay on-device</span>
                <span>
                  Open for every node<span className="blink text-primary">_</span>
                </span>
              </div>
            </div>
          </div>

          {/* signing terminal — the product's review flow, drawn in code */}
          <div className="rise-in float-y relative hidden lg:block" style={{ animationDelay: '0.55s' }}>
            <TerminalReview />
          </div>
        </div>
      </div>

      {/* rotating circular CTA */}
      <div className="absolute right-10 bottom-28 z-10 hidden md:block lg:right-16">
        <RotatingBadge href="#download" />
      </div>

      {/* bottom hairline + chain readout */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-8 sm:px-8">
        <div className="flex items-center justify-between border-t border-line pt-5">
          <span className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-dim">
            Xterium Wallet — v2
          </span>
          <span className="font-mono2 hidden items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-faint sm:flex">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary" />
            synced · block #{block.toLocaleString('en-US')}
          </span>
          <span className="font-mono2 hidden text-[11px] uppercase tracking-[0.2em] text-dim md:block">
            Scroll to explore ↓
          </span>
        </div>
      </div>
    </section>
  )
}
