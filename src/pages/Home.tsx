import ScrollProgressBar from '../components/ScrollProgressBar'
import Nav from '../sections/Nav'
import Hero from '../sections/Hero'
import AppShowcase from '../sections/AppShowcase'
import Stats from '../sections/Stats'
import Download from '../sections/Download'
import Footer from '../sections/Footer'
import { useStaged } from '../hooks/useStaged'

export default function Home() {
  // Pinned stages, or plain flowing sections under reduced motion and on
  // short (landscape-phone) viewports. Every section paints its own surface.
  const staged = useStaged()
  return (
    <div className="min-h-screen">
      <ScrollProgressBar />
      <Nav />
      <main>
        <Hero staged={staged} />
        {/* the pinned hero sequence carries the app screens itself */}
        {!staged && <AppShowcase />}
        <Stats staged={staged} />
        <Download />
      </main>
      <Footer />
    </div>
  )
}
