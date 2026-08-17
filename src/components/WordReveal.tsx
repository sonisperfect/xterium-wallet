export default function WordReveal({
  text,
  accentWords = [],
  baseDelay = 120,
  step = 90,
}: {
  text: string
  accentWords?: string[]
  baseDelay?: number
  step?: number
}) {
  const words = text.split(' ')
  const accents = new Set(accentWords.map((w) => w.toLowerCase().replace(/[^a-z.]/g, '')))
  return (
    <>
      {words.map((w, i) => {
        const accent = accents.has(w.toLowerCase().replace(/[^a-z.]/g, ''))
        return (
          <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span
              className={`rise-in inline-block ${accent ? 'text-primary' : ''}`}
              style={{ animationDelay: `${baseDelay + i * step}ms` }}
            >
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          </span>
        )
      })}
    </>
  )
}
