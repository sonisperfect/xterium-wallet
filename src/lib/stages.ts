import { createContext } from 'react'
import type { MotionValue } from 'framer-motion'

/**
 * The pinned stages' spring-smoothed progress, mirrored here by the stages
 * themselves so the mascot can travel between them.
 */
export const StageProgressContext = createContext<{ hero: MotionValue<number>; stats: MotionValue<number> } | null>(null)
