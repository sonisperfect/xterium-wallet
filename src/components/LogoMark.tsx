/** The real Xterium mark — pink diamond with the white sparkle glyph. */
export default function LogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo/xterium-logo.png"
      width={size}
      height={size}
      className={className}
      alt=""
      aria-hidden="true"
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}
