/** Spring that smooths wheel steps into the pinned stages' progress. */
export const STAGE_SPRING = { stiffness: 180, damping: 30, mass: 0.6 }

/**
 * Scroll timeline of the pinned hero → app sequence, as fractions of its
 * scroll distance. Every frame is a pure function of these, so a reload or
 * Back lands on the right frame. The browser checks read `data-steps` off
 * the sequence instead of copying the numbers.
 */
export const HERO_SEQUENCE = {
  /** BLOCKCHAIN. lifts out (the WebGL `exit` value runs 0 → 1). */
  heroExit: [0.04, 0.16],
  /** The hero copy fades and drifts up. */
  heroFade: [0.08, 0.17],
  /** The hero slide stops being interactive. */
  heroUntil: 0.16,
  /** The ink curtains split along the shard seam, revealing the cream stage. */
  curtains: [0.09, 0.2],
  /** The nav flips to the cream surface once the curtains clear its corners. */
  surfaceSwitch: 0.19,
  /** The phone rises into place with a blank screen. */
  phoneRise: [0.12, 0.24],
  /** "Your assets, clearly in view." — in, hold, out. */
  heading: [0.21, 0.27, 0.32, 0.36],
  /** Where each app screen takes over, with a shard wipe and its card. */
  steps: [0.37, 0.49, 0.61, 0.73, 0.85],
}

/** Index of the app screen showing at `progress`, or -1 for the blank phone. */
export function stepAt(progress: number) {
  let step = -1
  HERO_SEQUENCE.steps.forEach((start, index) => {
    if (progress >= start) step = index
  })
  return step
}

/** The settled middle of a step's scroll range, where seeking lands. */
export function stepMidpoint(index: number) {
  const { steps } = HERO_SEQUENCE
  return (steps[index] + (steps[index + 1] ?? 1)) / 2
}

/**
 * Timeline of the pinned stats stage. Its progress runs from the moment the
 * section's top enters the viewport, so the phone starts righting itself
 * while the stage is still scrolling up into place.
 */
export const STATS_STAGE = {
  /** The tilted lock-screen phone lies flat and its ghost outlines converge. */
  untilt: [0.22, 0.66],
  /** Where each stat card starts rising. */
  cards: [0.5, 0.56, 0.62, 0.68],
  /** How long a card takes to rise. */
  rise: 0.12,
  /** How far into its rise a card starts counting. */
  countAfter: 0.09,
}
