/**
 * SectionMarker — numbered spec-sheet eyebrow, e.g. "01 / WHY XTERIUM".
 * Establishes the editorial rhythm across sections.
 */
export default function SectionMarker({ no, label }: { no: string; label: string }) {
  return (
    <p className="font-mono2 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-faint">
      <span className="text-primary">{no}</span>
      <span className="inline-block h-px w-8 bg-[rgba(47,224,194,0.35)]" aria-hidden="true" />
      <span className="text-dim">{label}</span>
    </p>
  )
}
