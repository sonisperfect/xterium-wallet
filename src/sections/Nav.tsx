import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

const LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'The app', href: '#showcase' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-line bg-[#04130f]/85 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#top" className="flex items-center gap-3">
          <img src="/logo/xterium-logo-with-text.png" alt="Xterium Wallet" className="h-8 w-auto" />
          <span className="font-mono2 hidden rounded-sm border border-line-soft px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-faint sm:inline-block">
            v2.0
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono2 text-[12px] uppercase tracking-[0.18em] text-dim transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a
            href="#download"
            className="inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-2.5 text-[13px] font-semibold tracking-tight text-[#04130f] transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(47,224,194,0.45)]"
          >
            Get the wallet
          </a>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-[#04130f]/95 px-5 py-4 backdrop-blur-md md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-mono2 block py-2.5 text-[12px] uppercase tracking-[0.18em] text-dim"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#download"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-[#04130f]"
          >
            Get the wallet
          </a>
        </div>
      )}
    </header>
  )
}
