const ITEMS = [
  'Secure key storage',
  'Send & receive tokens',
  'Smart contract interaction',
  'Token management',
  'Xode dApp ready',
  'Biometric unlock',
  'Multi-wallet support',
  'Backup & restore',
]

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS]
  return (
    <section className="border-y border-line bg-panel/60 py-5">
      <div className="mask-fade-x overflow-hidden">
        <div className="marquee-track flex w-max items-center gap-8">
          {row.map((item, i) => (
            <span key={i} className="flex items-center gap-8 whitespace-nowrap">
              <span className="font-mono2 text-[12px] uppercase tracking-[0.22em] text-dim">
                {item}
              </span>
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
