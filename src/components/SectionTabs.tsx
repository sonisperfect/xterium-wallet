import { useEffect, useRef, useState } from 'react'

export type SectionTab = { id: string; title: string }

// Where a section counts as the one being read: just under the sticky tabs.
const READING_LINE = 140

/** The section being read, for the tabs to mark. */
function useActiveSection(tabs: SectionTab[]) {
  const [active, setActive] = useState(tabs[0].id)
  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      let current = tabs[0].id
      for (const { id } of tabs) {
        const top = document.getElementById(id)?.getBoundingClientRect().top
        if (top !== undefined && top <= READING_LINE) current = id
      }
      // At the very end of the page the last section is the one in view, even if it never reached the line.
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      setActive(atEnd ? tabs[tabs.length - 1].id : current)
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
  }, [tabs])
  return active
}

/** Sticky pill tabs to a page's `#anchor` sections; the current one follows the reader. */
export default function SectionTabs({ label, tabs }: { label: string; tabs: SectionTab[] }) {
  const active = useActiveSection(tabs)
  const rowRef = useRef<HTMLUListElement>(null)

  // On narrow screens the tabs scroll sideways; keep the current one centred in view.
  useEffect(() => {
    const row = rowRef.current
    const tab = row?.querySelector<HTMLElement>('[aria-current]')
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return
    row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' })
  }, [active])

  return (
    <nav className="policy-tabs" aria-label={label}>
      <ul ref={rowRef} onScroll={(event) => {
        const row = event.currentTarget
        row.dataset.end = String(row.scrollLeft + row.clientWidth >= row.scrollWidth - 1)
      }}>
        {tabs.map(({ id, title }) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={active === id ? 'location' : undefined}>{title}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
