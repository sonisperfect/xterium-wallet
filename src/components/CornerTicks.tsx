/**
 * CornerTicks — technical-drawing corner marks ("+") placed at the four
 * corners of a relatively-positioned parent. Pure decoration, aria-hidden.
 */
export default function CornerTicks({ inset = -5 }: { inset?: number }) {
  const tick: React.CSSProperties = {
    position: 'absolute',
    width: 11,
    height: 11,
    pointerEvents: 'none',
    color: 'rgba(47, 224, 194, 0.55)',
  }
  const line: React.CSSProperties = {
    position: 'absolute',
    background: 'currentColor',
  }
  const corners: React.CSSProperties[] = [
    { top: inset, left: inset },
    { top: inset, right: inset },
    { bottom: inset, left: inset },
    { bottom: inset, right: inset },
  ]
  return (
    <>
      {corners.map((pos, i) => (
        <span key={i} style={{ ...tick, ...pos }} aria-hidden="true">
          <span style={{ ...line, left: 5, top: 0, width: 1, height: 11 }} />
          <span style={{ ...line, top: 5, left: 0, height: 1, width: 11 }} />
        </span>
      ))}
    </>
  )
}
