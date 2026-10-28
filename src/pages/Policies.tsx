import { useEffect } from 'react'
import { Link } from 'react-router'
import SectionTabs from '../components/SectionTabs'
import Footer from '../sections/Footer'
import { CookiePolicy, CopyrightPolicy, PrivacyPolicy, TermsOfService } from '../sections/PolicyContent'

const POLICIES = [
  { id: 'privacy', title: 'Privacy Policy', Body: PrivacyPolicy },
  { id: 'terms', title: 'Terms of Service', Body: TermsOfService },
  { id: 'cookies', title: 'Cookie Policy', Body: CookiePolicy },
  { id: 'copyright', title: 'Copyright Policy', Body: CopyrightPolicy },
]

/** All four policies on one page, each reachable at /policy#<id>. */
export default function Policies() {
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

        <SectionTabs label="Policies" tabs={POLICIES} />

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
