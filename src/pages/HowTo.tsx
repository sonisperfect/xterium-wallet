import { useEffect } from 'react'
import { Link } from 'react-router'
import SectionTabs from '../components/SectionTabs'
import Footer from '../sections/Footer'
import { ConnectAndSign, Install, Portfolio, SecurityTips, SetUp } from '../sections/HowToContent'

// The guide's parts, each reachable at /how-to#<id>; `tab` is its short name in the tab row.
const PARTS = [
  { id: 'install', tab: 'Install', title: 'Install the extension', Body: Install },
  { id: 'setup', tab: 'Set up', title: 'Set up your wallet', Body: SetUp },
  { id: 'portfolio', tab: 'Portfolio', title: 'View your portfolio', Body: Portfolio },
  { id: 'connect', tab: 'Connect & sign', title: 'Connect to a dApp and sign', Body: ConnectAndSign },
  { id: 'security', tab: 'Security', title: 'Security tips', Body: SecurityTips },
]

const TABS = PARTS.map(({ id, tab }) => ({ id, title: tab }))

/** The how-to guide: installing Xterium, importing a wallet, and connecting and signing with it. */
export default function HowTo() {
  useEffect(() => {
    const previous = document.title
    document.title = 'How to Use Xterium — Xterium Wallet'
    return () => { document.title = previous }
  }, [])

  return (
    <div className="surface-ink min-h-screen">
      <main className="policy-page">
        <Link to="/" className="policy-back font-mono2">← Back to Xterium</Link>

        <header className="policy-header">
          <h1 className="policy-title font-display">How to use <span className="policy-title-accent">Xterium</span></h1>
          <p className="howto-lead">
            Xterium is a Chrome extension wallet for the XODE network. This guide walks you through installing it,
            importing a wallet with a seed phrase, connecting it to a dApp, and signing a transaction.
          </p>
        </header>

        <SectionTabs label="Guide" tabs={TABS} />

        {PARTS.map(({ id, title, Body }) => (
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
