import { useEffect, useState } from 'react'
import { Facebook, MessageCircle, Send, Twitter, Youtube } from 'lucide-react'
import BlinkDots from '../components/BlinkDots'

const SOCIALS = [
  { icon: Twitter, label: 'X (Twitter)', href: 'https://x.com/XteriumWallet' },
  { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@XteriumWallet' },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61578614355331' },
  { icon: Send, label: 'Telegram', href: 'https://t.me/RaksonXteriumBot' },
  { icon: MessageCircle, label: 'Discord', href: 'https://discord.gg/5fXf4fK8' },
]

export default function Footer() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer className="relative overflow-hidden border-t border-line bg-panel">
      <BlinkDots gap={20} color="239, 250, 246" baseAlpha={0.04} />
      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_auto]">
          <div>
            <img src="/assets/footer-logo.png" alt="Xterium" className="h-9 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-dim">
              Your gateway to blockchain. A secure wallet extension for the Xode ecosystem.
            </p>
          </div>

          <div>
            <p className="font-mono2 text-[11px] uppercase tracking-[0.22em] text-dim">Product</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#features" className="text-dim transition-colors hover:text-primary">Features</a></li>
              <li><a href="#showcase" className="text-dim transition-colors hover:text-primary">The app</a></li>
              <li><a href="#how-it-works" className="text-dim transition-colors hover:text-primary">How it works</a></li>
              <li><a href="#download" className="text-dim transition-colors hover:text-primary">Download</a></li>
            </ul>
          </div>

          <div>
            <p className="font-mono2 text-[11px] uppercase tracking-[0.22em] text-dim">Ecosystem</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="https://xode.net" target="_blank" rel="noopener noreferrer" className="text-dim transition-colors hover:text-primary">
                  XODE.net
                </a>
              </li>
              <li>
                <a href="https://omni.xode.net" target="_blank" rel="noopener noreferrer" className="text-dim transition-colors hover:text-primary">
                  OMNI · omni.xode.net
                </a>
              </li>
              <li>
                <a
                  href="https://chromewebstore.google.com/detail/xterium/klfhdmiebenifpdmdmkjicdohjilabdg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dim transition-colors hover:text-primary"
                >
                  Chrome Web Store
                </a>
              </li>
              <li><a href="#faq" className="text-dim transition-colors hover:text-primary">Support & FAQ</a></li>
            </ul>
          </div>

          <div className="flex flex-col items-start gap-4 md:items-end">
            <div className="flex flex-wrap gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-soft text-dim transition-colors hover:border-primary hover:text-primary"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="font-mono2 text-[11px] text-dim">
              local time <span className="text-mint-soft">{time}</span>
              <span className="blink text-primary">_</span>
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line-soft pt-6 font-mono2 text-[11px] uppercase tracking-[0.16em] text-dim md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} RAKSON OPC · All rights reserved</p>
          <p className="hidden text-faint lg:block">build 2.0.4 · main · sha dfc93e1</p>
          <p className="flex items-center gap-2">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Xterium Wallet — built for the <span className="text-primary">Xode</span> ecosystem
          </p>
        </div>
      </div>
    </footer>
  )
}
