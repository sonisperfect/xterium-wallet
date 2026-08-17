import Nav from '../sections/Nav'
import Hero from '../sections/Hero'
import Marquee from '../sections/Marquee'
import Features from '../sections/Features'
import AppShowcase from '../sections/AppShowcase'
import HowItWorks from '../sections/HowItWorks'
import Download from '../sections/Download'
import Faq from '../sections/Faq'
import Footer from '../sections/Footer'
import DotChain from '../components/DotChain'

/** A dot-drawn blockchain strip with a traveling pulse packet. */
function ChainBand({ label }: { label: string }) {
  return (
    <section className="relative h-28 overflow-hidden border-y border-line bg-[#04130f]">
      <DotChain blocks={7} />
      <p className="font-mono2 pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.3em] text-dim">
        {label}
      </p>
    </section>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Features />
        <ChainBand label="block by block — the chain never stops" />
        <AppShowcase />
        <HowItWorks />
        <ChainBand label="every transfer, sealed in a block" />
        <Download />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}
