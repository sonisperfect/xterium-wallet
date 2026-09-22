import { createContext, useContext, type ElementType, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const
// hard-edged, no overshoot, no lingering follow-through — an architectural
// snap instead of a soft glide, for moments that should read as assembled
// rather than eased into place
const SHARP = [0.65, 0, 0.35, 1] as const

type RevealVariant = 'rise' | 'slide-left' | 'slide-right' | 'scale' | 'pop' | 'sharp'

const itemVariants = (y: number, variant: RevealVariant = 'rise', delay = 0) => {
  const hidden =
    variant === 'slide-left'
      ? { opacity: 0, x: -40 }
      : variant === 'slide-right'
        ? { opacity: 0, x: 40 }
        : variant === 'scale'
          ? { opacity: 0, scale: 0.92 }
          : variant === 'pop'
            ? { opacity: 0, scale: 0.7 }
            : variant === 'sharp'
              ? { opacity: 0, y: y * 0.5 }
              : { opacity: 0, y }
  // 'pop' overshoots and settles — a punchier arrival than the other
  // variants' plain ease-out, for moments that should feel like a beat
  // (e.g. the section right after a scroll-zoom transition). 'sharp' is
  // the opposite instinct — quick and flat, no bounce, no long glide.
  const transition =
    variant === 'pop'
      ? { type: 'spring', stiffness: 300, damping: 16, mass: 0.6, delay }
      : variant === 'sharp'
        ? { duration: 0.35, ease: SHARP, delay }
        : { duration: 0.7, ease: EASE, delay }
  return {
    hidden,
    visible: { opacity: 1, y: 0, x: 0, scale: 1, transition },
  }
}

const groupVariants = (stagger: number) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
})

// Tells a nested Reveal it's inside a RevealGroup, so it should let the
// group orchestrate visibility (via inherited variants) instead of running
// its own independent viewport trigger.
const InGroupContext = createContext(false)

/**
 * Scroll-reveal wrapper: fades/rises content into view once, matching the
 * easing of the site's original .rise-in CSS keyframe. Respects
 * prefers-reduced-motion centrally, so every consumer gets it for free.
 * Nest inside `RevealGroup` for a staggered sequence.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  variant = 'rise',
  as = 'div',
  className,
  active,
  ...rest
}: {
  children: ReactNode
  delay?: number
  y?: number
  variant?: RevealVariant
  as?: ElementType
  className?: string
  active?: boolean
  [key: string]: unknown
}) {
  const reduced = useReducedMotion()
  const inGroup = useContext(InGroupContext)
  const MotionTag = motion[as as 'div'] ?? motion.div

  if (reduced) {
    const Tag = as
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  if (inGroup && active === undefined) {
    // No own viewport trigger — inherits hidden/visible from the parent RevealGroup.
    return (
      <MotionTag className={className} variants={itemVariants(y, variant, delay)} {...rest}>
        {children}
      </MotionTag>
    )
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      animate={active === undefined ? undefined : active ? 'visible' : 'hidden'}
      whileInView={active === undefined ? 'visible' : undefined}
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={itemVariants(y, variant, delay)}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

/** Wraps `Reveal` children and staggers their entrance. */
export function RevealGroup({
  children,
  stagger = 0.1,
  as = 'div',
  className,
  active,
}: {
  children: ReactNode
  stagger?: number
  as?: ElementType
  className?: string
  active?: boolean
}) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as as 'div'] ?? motion.div

  if (reduced) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <InGroupContext.Provider value={true}>
      <MotionTag
        className={className}
        initial="hidden"
        animate={active === undefined ? undefined : active ? 'visible' : 'hidden'}
        whileInView={active === undefined ? 'visible' : undefined}
        viewport={{ once: true, margin: '-10% 0px' }}
        variants={groupVariants(stagger)}
      >
        {children}
      </MotionTag>
    </InGroupContext.Provider>
  )
}
