import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import LogoMark from '../components/LogoMark'
import SectionMarker from '../components/SectionMarker'
import StatCounter from '../components/StatCounter'
import { Reveal, RevealGroup } from '../components/Reveal'
import { STAGE_SPRING, STATS_STAGE } from '../lib/sequence'

const STATS = [
  { value: 12, suffix: '', label: 'word recovery phrase — the only backup you need', surface: 'surface-cream' },
  { value: 3, suffix: '', label: 'ways to import an existing wallet', surface: 'surface-mint' },
  { value: 0, suffix: '', label: 'servers that ever see your private keys', surface: 'surface-ink' },
  { value: 100, suffix: '%', label: 'local encryption — every key stays on your device', surface: 'surface-grass' },
]

function StatBody({ stat, index, active }: { stat: (typeof STATS)[number]; index: number; active?: boolean }) {
  return (
    <>
      <p className="font-display stat-value">
        <StatCounter value={stat.value} suffix={stat.suffix} active={active} delay={0.08 + index * 0.06} />
      </p>
      <p className="stat-label text-fg-dim">{stat.label}</p>
    </>
  )
}

/** A stat card that rises into its slot around the phone. */
function StageStatCard({ stat, index, progress, active }: {
  stat: (typeof STATS)[number]
  index: number
  progress: MotionValue<number>
  active: boolean
}) {
  const start = STATS_STAGE.cards[index]
  const y = useTransform(progress, [start, start + STATS_STAGE.rise], ['45svh', '0svh'])
  const opacity = useTransform(progress, [start, start + STATS_STAGE.rise * 0.6], [0, 1])
  return (
    <motion.div className={`stat-card ${stat.surface}`} data-slot={'abcd'[index]} style={{ y, opacity }}>
      <StatBody stat={stat} index={index} active={active} />
    </motion.div>
  )
}

/** A locked phone that starts tilted back like it's lying on a table, then rights itself. */
function LockPhone({ progress }: { progress: MotionValue<number> }) {
  const range = STATS_STAGE.untilt
  const rotateX = useTransform(progress, range, [52, 0])
  const rotateY = useTransform(progress, range, [-24, 0])
  const rotate = useTransform(progress, range, [-16, 0])
  const near = useTransform(progress, range, [-18, 0])
  const far = useTransform(progress, range, [-36, 0])
  const nearY = useTransform(near, (value) => -value)
  const farY = useTransform(far, (value) => -value)
  const farOpacity = useTransform(progress, range, [0.3, 0])
  const nearOpacity = useTransform(progress, range, [0.6, 0])
  return (
    <div className="lock-phone" aria-hidden="true">
      <motion.div className="lock-tilt" style={{ rotateX, rotateY, rotate }}>
        <motion.div className="lock-ghost" style={{ x: far, y: farY, opacity: farOpacity }} />
        <motion.div className="lock-ghost" style={{ x: near, y: nearY, opacity: nearOpacity }} />
        <div className="phone-frame">
          <div className="lock-screen">
            <LogoMark size={56} />
            <span className="lock-dots">
              {Array.from({ length: 6 }, (_, index) => <span key={index} data-filled={index < 4} />)}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function StatsStage() {
  const ref = useRef<HTMLElement>(null)
  const [counting, setCounting] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const progress = useSpring(scrollYProgress, STAGE_SPRING)

  // A card counts once it has mostly risen, and resets once it drops away again.
  useMotionValueEvent(progress, 'change', (value) => {
    setCounting(STATS_STAGE.cards.filter((start) => value >= start + STATS_STAGE.countAfter).length)
  })

  return (
    <section ref={ref} id="stats" className="stats-stage surface-purple" data-surface="purple" data-stage="stats">
      <div className="stats-sticky">
        <SectionMarker no="02" label="At a glance" />
        <div className="stats-grid">
          <LockPhone progress={progress} />
          {STATS.map((stat, index) => (
            <StageStatCard key={stat.label} stat={stat} index={index} progress={progress} active={index < counting} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsFlow() {
  return (
    <section id="stats" className="stats-flow surface-purple relative" data-surface="purple">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal variant="sharp">
          <SectionMarker no="02" label="At a glance" />
        </Reveal>
        <RevealGroup stagger={0.06} className="stats-flow-grid">
          {STATS.map((stat, index) => (
            <Reveal key={stat.label} as="div" variant="sharp" className={`stat-card ${stat.surface}`}>
              <StatBody stat={stat} index={index} />
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}

export default function Stats({ staged }: { staged: boolean }) {
  return staged ? <StatsStage /> : <StatsFlow />
}
