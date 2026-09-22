import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, type MotionValue } from 'framer-motion'
import { useIntro } from '../lib/intro'

export default function BlockchainHeading({ exit }: { exit?: MotionValue<number> }) {
  const hostRef = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  const { revealed, onHeroReady } = useIntro()
  const startedRef = useRef(revealed)
  const sceneRef = useRef<ReturnType<typeof import('../lib/blockchainScene').mountBlockchainScene> | null>(null)

  useEffect(() => {
    startedRef.current = revealed
    sceneRef.current?.invalidate()
  }, [revealed])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    let dispose: (() => void) | undefined
    let unsubscribe: (() => void) | undefined

    // Keep the artwork visible while the renderer loads or if WebGL is unavailable.
    import('../lib/blockchainScene').then(({ mountBlockchainScene }) => {
      if (cancelled) return
      const scene = mountBlockchainScene(host, {
        reduced: !!reduced,
        getExit: () => exit?.get() ?? 0,
        getStarted: () => startedRef.current,
        onReady: () => { setReady(true); onHeroReady() },
        onUnavailable: () => { setReady(false); onHeroReady() },
      })
      sceneRef.current = scene
      dispose = scene.dispose
      unsubscribe = exit?.on('change', scene.invalidate)
    }).catch(() => {
      if (!cancelled) { setReady(false); onHeroReady() }
    })

    return () => {
      cancelled = true
      unsubscribe?.()
      dispose?.()
      sceneRef.current = null
    }
  }, [exit, reduced, onHeroReady])

  return (
    <motion.span className="blockchain-heading" data-ready={ready}
      initial={reduced ? false : { opacity: 0, scale: 0.62 }}
      animate={{ opacity: revealed ? 1 : 0, scale: reduced || revealed ? 1 : 0.62 }}
      transition={{ delay: reduced ? 0 : 0.12, duration: reduced ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="sr-only">BLOCKCHAIN.</span>
      <span className="blockchain-heading-fallback" aria-hidden="true">
        <img src="/assets/blockchain-3d.png" width="2172" height="724" alt="" fetchPriority="high" />
        <span className="blockchain-heading-mobile font-pixel">BLOCK<br />CHAIN.</span>
      </span>
      <span ref={hostRef} className="blockchain-heading-scene" aria-hidden="true" />
    </motion.span>
  )
}
