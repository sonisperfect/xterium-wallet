// Jagged offsets along the wipe's leading edge, sampled evenly across it.
const EDGE = [0, 9, -4, 13, -3, 8, -2]
// Far enough past both corners that the largest offset clears the box.
const REACH = 20

/**
 * clip-path polygon for the diagonal "shard" wipe: t = 0 reveals nothing and
 * t = 1 covers the whole box. The broken edge sweeps from the bottom-left
 * corner to the top-right one; direction -1 mirrors it, so stepping back
 * wipes the other way. Every t yields the same point count, so the shape
 * moves smoothly.
 */
export function shardPolygon(t: number, direction: 1 | -1 = 1) {
  const sweep = -REACH + t * (200 + REACH * 2)
  // u runs along the diagonal (0 at the bottom-left corner, 200 at the
  // top-right one) and w across it.
  const point = (u: number, w: number) => {
    const x = (u + w) / 2
    const y = 100 - (u - w) / 2
    return direction === 1
      ? `${x.toFixed(2)}% ${y.toFixed(2)}%`
      : `${(100 - x).toFixed(2)}% ${(100 - y).toFixed(2)}%`
  }
  const edge = EDGE.map((offset, index) => point(sweep + offset, -100 + (200 * index) / (EDGE.length - 1)))
  return `polygon(${[...edge, point(-300, 100), point(-300, -100)].join(', ')})`
}
