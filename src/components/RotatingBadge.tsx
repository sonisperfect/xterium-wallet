import { ArrowDown } from 'lucide-react'

/** Rotating circular badge — ring text spins slowly around a center arrow. */
export default function RotatingBadge({ href = '#download' }: { href?: string }) {
  const label = 'DOWNLOAD XTERIUM · BROWSER WALLET · '
  return (
    <a href={href} className="group relative block h-28 w-28" aria-label="Download Xterium">
      <svg viewBox="0 0 100 100" className="spin-slow h-full w-full">
        <defs>
          <path id="ring" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-[#2fe0c2] font-mono2" fontSize="8.2" letterSpacing="2.1">
          <textPath href="#ring">{label}</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors group-hover:bg-primary/15">
          <ArrowDown className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-y-0.5" />
        </span>
      </span>
    </a>
  )
}
