import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Word-by-word "mask reveal" for headline text — each word slides up out of
 * a clipped wrapper with a slight stagger, bolder than a plain fade+rise.
 * Falls back to plain static text under prefers-reduced-motion.
 *
 * Visibility is tracked on the outer (unclipped) tag via `useInView`, not
 * `whileInView` on the animating word itself — the word starts fully hidden
 * behind its own overflow-hidden mask, so an observer on the word would
 * always report 0% intersecting and could never fire.
 */
export default function SplitReveal({
  text,
  as: Tag = 'span',
  className = '',
  delay = 0,
  active = true,
}: {
  text: string
  as?: 'span' | 'h1' | 'h2' | 'h3'
  className?: string
  delay?: number
  active?: boolean
}) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const words = text.split(' ')

  if (reduced) return <Tag className={className}>{text}</Tag>

  return (
    // @ts-expect-error — ref is compatible with every element `Tag` can be (span/h1/h2/h3)
    <Tag ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={inView && active ? { y: '0%' } : undefined}
            transition={{ duration: 0.6, delay: delay + i * 0.07, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
