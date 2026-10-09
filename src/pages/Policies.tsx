import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import Footer from '../sections/Footer'
import { CookiePolicy, CopyrightPolicy, PrivacyPolicy, TermsOfService } from '../sections/PolicyContent'

const POLICIES = [
  { id: 'privacy', title: 'Privacy Policy', Body: PrivacyPolicy },
  { id: 'terms', title: 'Terms of Service', Body: TermsOfService },
  { id: 'cookies', title: 'Cookie Policy', Body: CookiePolicy },
  { id: 'copyright', title: 'Copyright Policy', Body: CopyrightPolicy },
]

// Where a section counts as the one being read: just under the sticky tabs.
const READING_LINE = 140

/** The policy being read, for the tabs to mark. */
function useActivePolicy() {
  const [active, setActive] = useState(POLICIES[0].id)
  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      let current = POLICIES[0].id
      for (const { id } of POLICIES) {
        const top = document.getElementById(id)?.getBoundingClientRect().top
        if (top !== undefined && top <= READING_LINE) current = id
      }
      // At the very end of the page the last policy is the one in view, even if it never reached the line.
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      setActive(atEnd ? POLICIES[POLICIES.length - 1].id : current)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])
  return active
}

/** All four policies on one page, each reachable at /policy#<id>. */
export default function Policies() {
  const active = useActivePolicy()
  const tabsRef = useRef<HTMLUListElement>(null)

  // On narrow screens the tabs scroll sideways; keep the current one centred in view.
  useEffect(() => {
    const tabs = tabsRef.current
    const tab = tabs?.querySelector<HTMLElement>('[aria-current]')
    if (!tabs || !tab || tabs.scrollWidth <= tabs.clientWidth) return
    tabs.scrollTo({ left: tab.offsetLeft - (tabs.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' })
  }, [active])

  useEffect(() => {
    const previous = document.title
    document.title = 'Legal & Policies — Xterium Wallet'
    return () => { document.title = previous }
  }, [])

  return (
    <div className="surface-ink min-h-screen">
      <main className="policy-page">
        <Link to="/" className="policy-back font-mono2">← Back to Xterium</Link>

        <header className="policy-header">
          <h1 className="policy-title font-display">Legal &amp; <span className="policy-title-accent">Policies</span></h1>
          <p className="policy-updated">Last updated: October 2026</p>
        </header>

        <nav className="policy-tabs" aria-label="Policies">
          <ul ref={tabsRef} onScroll={(event) => {
            const row = event.currentTarget
            row.dataset.end = String(row.scrollLeft + row.clientWidth >= row.scrollWidth - 1)
          }}>
            {POLICIES.map(({ id, title }) => (
              <li key={id}>
                <a href={`#${id}`} aria-current={active === id ? 'location' : undefined}>{title}</a>
              </li>
            ))}
          </ul>
        </nav>

        {POLICIES.map(({ id, title, Body }) => (
          <section key={id} id={id} className="policy-section" aria-labelledby={`${id}-title`}>
            <h2 id={`${id}-title`} className="font-display">{title}</h2>
            <div className="policy-prose">
              <Body />
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  )
}
