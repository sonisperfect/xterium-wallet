/**
 * SectionMarker — numbered spec-sheet eyebrow, e.g. "01 / WHY XTERIUM".
 * Establishes the editorial rhythm across sections. Takes its colours from
 * the surface it sits on.
 */
export default function SectionMarker({ no, label }: { no: string; label: string }) {
  return (
    <p className="font-mono2 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em]">
      <span className="text-fg-accent">{no}</span>
      <span className="section-marker-rule inline-block h-px w-8" aria-hidden="true" />
      <span className="text-fg-dim">{label}</span>
    </p>
  )
}
