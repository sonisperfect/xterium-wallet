import { useMemo } from 'react'
import { useMotionValue } from 'framer-motion'
import Mascot from '../components/Mascot'
import ScrollProgressBar from '../components/ScrollProgressBar'
import Nav from '../sections/Nav'
import Hero from '../sections/Hero'
import AppShowcase from '../sections/AppShowcase'
import Stats from '../sections/Stats'
import Download from '../sections/Download'
import Footer from '../sections/Footer'
import { useStaged } from '../hooks/useStaged'
import { StageProgressContext } from '../lib/stages'

export default function Home() {
  // Pinned stages, or plain flowing sections under reduced motion and on
  // short (landscape-phone) viewports. Every section paints its own surface.
  const staged = useStaged()
  const hero = useMotionValue(0)
  const stats = useMotionValue(0)
  const stages = useMemo(() => ({ hero, stats }), [hero, stats])
  return (
    <StageProgressContext.Provider value={stages}>
      <div className="min-h-screen">
        <ScrollProgressBar />
        <Nav />
        {staged && <Mascot />}
        <main>
          <Hero staged={staged} />
          {/* the pinned hero sequence carries the app screens itself */}
          {!staged && <AppShowcase />}
          <Stats staged={staged} />
          <Download />
        </main>
        <Footer />
      </div>
    </StageProgressContext.Provider>
  )
}
