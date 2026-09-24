import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

// hard-edged, no overshoot — each letter snaps into place like a block
// being set down, not eased into it (see Reveal's 'sharp' variant)
const SHARP = [0.65, 0, 0.35, 1] as const

/**
 * Splits text into individual letters, each masked and revealed with a
 * quick, hard-edged slide-up — reads as an assembled grid of segments
 * rather than one smooth word fading in. Falls back to plain static text
 * under reduced motion.
 */
export default function SegmentedReveal({
  text,
  as: Tag = 'span',
  className = '',
  delay = 0,
}: {
  text: string
  as?: 'span' | 'h1' | 'h2' | 'h3'
  className?: string
  delay?: number
}) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const words = text.split(' ')
  // each word's starting letter index (for stagger delay), computed
  // functionally so no variable is mutated during render
  const startIndexes = words.map((_, wi) =>
    words.slice(0, wi).reduce((sum, w) => sum + w.length, 0),
  )

  if (reduced) return <Tag className={className}>{text}</Tag>

  return (
    <Tag
      // @ts-expect-error — ref is compatible with every element `Tag` can be (span/h1/h2/h3)
      ref={ref}
      className={className}
      data-voxel-text={className.includes('voxel-heading') ? text : undefined}
    >
      {words.map((word, wi) => (
        // each word is its own atomic inline-block, so the line can only
        // wrap between words — never between two letters of the same word
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split('').map((c, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: '100%' }}
                animate={inView ? { y: '0%' } : undefined}
                transition={{ duration: 0.4, delay: delay + (startIndexes[wi] + i) * 0.025, ease: SHARP }}
              >
                {c}
              </motion.span>
            </span>
          ))}
          {wi < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
