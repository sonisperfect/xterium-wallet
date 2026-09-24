import ScrollBackground from '../components/ScrollBackground'
import ScrollProgressBar from '../components/ScrollProgressBar'
import Nav from '../sections/Nav'
import Hero from '../sections/Hero'
import AppShowcase from '../sections/AppShowcase'
import Download from '../sections/Download'
import Footer from '../sections/Footer'

export default function Home() {
  return (
    <div className="min-h-screen">
      <ScrollBackground />
      <ScrollProgressBar />
      <Nav />
      <main>
        <Hero />
        <AppShowcase />
        <Download />
      </main>
      <Footer />
    </div>
  )
}
