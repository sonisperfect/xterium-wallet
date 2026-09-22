import SectionMarker from '../components/SectionMarker'
import StatCounter from '../components/StatCounter'
import { Reveal, RevealGroup } from '../components/Reveal'

const STATS = [
  { value: 12, suffix: '', label: 'word recovery phrase — the only backup you need' },
  { value: 3, suffix: '', label: 'ways to import an existing wallet' },
  { value: 0, suffix: '', label: 'servers that ever see your private keys' },
  { value: 100, suffix: '%', label: 'local encryption — every key stays on your device' },
]

/** The Stats section's content on its own, so Hero can show it as the
 * second step of its pinned tab-swap instead of a standalone section. */
export function StatsContent({ active }: { active?: boolean }) {
  return (
    <>
      <Reveal variant="sharp" active={active}>
        <SectionMarker no="01" label="At a glance" />
      </Reveal>

      {/* thin dividers between columns, quick hard-edged reveal per cell —
          reads as an assembled spec sheet rather than a soft fade-in grid */}
      <RevealGroup
        active={active}
        stagger={0.06}
        className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:mt-14 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-0"
      >
        {STATS.map((s, index) => (
          <Reveal
            key={s.label}
            as="div"
            variant="sharp"
            className="lg:border-l lg:border-line-soft lg:px-8 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
          >
            <p className="font-display text-5xl font-bold tracking-normal text-primary sm:text-7xl lg:text-8xl">
              <StatCounter value={s.value} suffix={s.suffix} active={active} delay={0.16 + index * 0.06} />
            </p>
            <p className="mt-4 max-w-[22ch] text-sm leading-relaxed text-dim sm:text-base">{s.label}</p>
          </Reveal>
        ))}
      </RevealGroup>
    </>
  )
}
