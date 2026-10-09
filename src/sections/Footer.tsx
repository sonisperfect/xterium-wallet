import type { MouseEvent, ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { Facebook, MessageCircle, Send, Twitter, Youtube } from 'lucide-react'
import LogoMark from '../components/LogoMark'
import { Reveal, RevealGroup } from '../components/Reveal'
import { useAnchorScroll } from '../hooks/useAnchorScroll'

const POLICY_LINKS = [
  { hash: 'privacy', label: 'Privacy Policy' },
  { hash: 'terms', label: 'Terms of Service' },
  { hash: 'cookies', label: 'Cookie Policy' },
  { hash: 'copyright', label: 'Copyright Policy' },
]

const SOCIALS = [
  { icon: Twitter, label: 'X (Twitter)', href: 'https://x.com/XteriumWallet' },
  { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@XteriumWallet' },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61578614355331' },
  { icon: Send, label: 'Telegram', href: 'https://t.me/RaksonXteriumBot' },
  { icon: MessageCircle, label: 'Discord', href: 'https://discord.gg/5fXf4fK8' },
]

/** A link to a section of the home page: an in-page scroll there, a navigation from any other page. */
function HomeSection({ hash, onHome, onClick, children }: {
  hash: string
  onHome: boolean
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void
  children: ReactNode
}) {
  const className = 'text-dim transition-colors hover:text-primary'
  if (onHome) return <a href={`#${hash}`} onClick={onClick} className={className}>{children}</a>
  return <Link to={{ pathname: '/', hash: `#${hash}` }} className={className}>{children}</Link>
}

export default function Footer() {
  const onAnchorClick = useAnchorScroll()
  const onHome = useLocation().pathname === '/'

  return (
    <footer className="snap-section relative border-t border-line bg-panel" data-surface="panel">
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <RevealGroup stagger={0.06} className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_auto]">
          <Reveal variant="sharp">
            <div className="flex items-center gap-2.5">
              <LogoMark size={30} />
              <span className="font-display text-lg font-bold tracking-tight">XTERIUM</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-dim">
              Your gateway to blockchain. A secure wallet extension for the Xode ecosystem.
            </p>
          </Reveal>

          <Reveal variant="sharp" className="md:border-l md:border-line-soft md:pl-8">
            <p className="font-mono2 text-[11px] uppercase tracking-[0.22em] text-dim">Product</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><HomeSection hash="showcase" onHome={onHome} onClick={onAnchorClick}>The app</HomeSection></li>
              <li><HomeSection hash="download" onHome={onHome} onClick={onAnchorClick}>Download</HomeSection></li>
            </ul>
          </Reveal>

          <Reveal variant="sharp" className="md:border-l md:border-line-soft md:pl-8">
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
            </ul>
          </Reveal>

          <Reveal variant="sharp" className="flex flex-col items-start gap-4 md:items-end md:border-l md:border-line-soft md:pl-8">
            <div className="flex flex-wrap gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-soft text-dim transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary active:translate-y-0"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </Reveal>
        </RevealGroup>

        {/* one line on wide screens: the copyright left, the policies right. Narrower,
            the policies come first and the copyright sits under them */}
        <div className="mt-12 flex flex-col gap-5 border-t border-line-soft pt-6 lg:flex-row lg:items-baseline lg:justify-between">
          <p className="order-2 font-mono2 text-[11px] uppercase tracking-[0.16em] text-dim lg:order-1">
            © {new Date().getFullYear()} Xode Network. All rights reserved.{' '}
            <a href="https://xode.net" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">
              xode.net
            </a>
          </p>
          {/* every policy lives on one page; each link lands on its section */}
          <nav aria-label="Legal" className="order-1 lg:order-2">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
              {POLICY_LINKS.map((policy) => (
                <li key={policy.hash}>
                  <Link to={{ pathname: '/policy', hash: `#${policy.hash}` }} className="text-dim transition-colors hover:text-primary">
                    {policy.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
