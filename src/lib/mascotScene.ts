import {
  ACESFilmicToneMapping, DirectionalLight, HemisphereLight, MathUtils,
  OrthographicCamera, Scene, SRGBColorSpace, WebGLRenderer,
} from 'three'
import { createLogoMark } from './logoMark'

export type MascotPose = {
  /** Turns about the mark's vertical axis, in radians. */
  spin: number
  /** The lock phone's tilt in CSS degrees (rotate, rotateX, rotateY), so the mark lies on its screen. */
  tiltX: number
  tiltY: number
  tiltZ: number
  /** 0 is free (resting angle, idle sway, cursor); 1 is still and flat in its dock. */
  calm: number
  /** Tucked away out of sight: nothing to draw until it's woken. */
  parked: boolean
}

// Resting three-quarter angle, so the extruded edge reads as 3D.
const REST_X = -0.13
const REST_Y = -0.3
// Furthest it turns towards the cursor (about 15° across, 10° up and down).
const MAX_YAW = 0.26
const MAX_PITCH = 0.17
// Cursor distance, in CSS px, for a full turn.
const REACH = 640
// After this long without the cursor moving, it eases back to rest.
const IDLE_MS = 2000

/**
 * The mascot's renderer. It draws into a square canvas that the page moves
 * and resizes with CSS; the drawing buffer only reallocates when the shown
 * size drifts well away from it. Renders every frame while on screen and
 * not parked; `wake()` restarts it after parking.
 */
export function mountMascotScene(
  host: HTMLElement,
  { getPose, onReady, onUnavailable }: {
    getPose: () => MascotPose
    onReady: () => void
    onUnavailable: () => void
  },
) {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  host.append(canvas)

  const scene = new Scene()
  const camera = new OrthographicCamera(-1.25, 1.25, 1.25, -1.25, 0.1, 20)
  camera.position.z = 6
  scene.add(new HemisphereLight(0xffffff, 0x331126, 2))
  const key = new DirectionalLight(0xffd8ea, 4)
  key.position.set(-3, 4, 5)
  scene.add(key)
  const rim = new DirectionalLight(0xffffff, 3)
  rim.position.set(4, 1, -2)
  scene.add(rim)

  let disposed = false
  let contextLost = false
  let loaded = false
  let rendered = false
  let visible = true
  let frame = 0
  let lastTime = 0
  let elapsed = 0
  let drawnSize = 0
  const pointer = { x: 0, y: 0, currentX: 0, currentY: 0, lastMove: 0 }
  const mark = createLogoMark({
    onLoad: () => { loaded = true; start() },
    onError: () => { if (!disposed) onUnavailable() },
  })
  scene.add(mark.group)

  function render(now: number) {
    frame = 0
    if (disposed || contextLost || !loaded || !visible || document.hidden) return
    const pose = getPose()
    if (pose.parked) { lastTime = 0; return }
    const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 1 / 60
    lastTime = now
    elapsed += delta
    if (now - pointer.lastMove > IDLE_MS) { pointer.x = 0; pointer.y = 0 }
    const smoothing = 1 - Math.exp(-delta * 4)
    pointer.currentX = MathUtils.lerp(pointer.currentX, pointer.x, smoothing)
    pointer.currentY = MathUtils.lerp(pointer.currentY, pointer.y, smoothing)

    const free = 1 - pose.calm
    // CSS tilts run with y pointing down, so pitch and roll flip sign here.
    mark.group.rotation.set(
      free * (REST_X + Math.sin(elapsed * 0.9) * 0.05 + pointer.currentY * MAX_PITCH) - MathUtils.degToRad(pose.tiltX),
      free * (REST_Y + Math.sin(elapsed * 0.7) * 0.12 + pointer.currentX * MAX_YAW) + MathUtils.degToRad(pose.tiltY) + pose.spin,
      -MathUtils.degToRad(pose.tiltZ),
    )
    mark.group.position.y = free * Math.sin(elapsed * 1.4) * 0.03
    renderer.render(scene, camera)
    if (!rendered) { rendered = true; onReady() }
    frame = requestAnimationFrame(render)
  }

  function start() {
    if (!frame && !disposed && !contextLost && loaded && visible && !document.hidden) frame = requestAnimationFrame(render)
  }

  function resize() {
    const size = host.clientWidth
    if (!size) return
    // CSS stretches small drifts; only a real change of size redraws the buffer.
    if (drawnSize && size / drawnSize > 0.8 && size / drawnSize < 1.1) return
    drawnSize = size
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(size, size, false)
    // Resizing wipes the canvas, and this runs after the frame's draw but
    // before the browser paints it, so redraw now — otherwise the mascot
    // blinks out for a frame each time its size crosses a step.
    if (rendered && !contextLost) renderer.render(scene, camera)
    start()
  }

  function move(event: PointerEvent) {
    if (event.pointerType === 'touch') return
    const bounds = host.getBoundingClientRect()
    pointer.x = MathUtils.clamp((event.clientX - bounds.left - bounds.width / 2) / REACH, -1, 1)
    pointer.y = MathUtils.clamp((event.clientY - bounds.top - bounds.height / 2) / REACH, -1, 1)
    pointer.lastMove = performance.now()
  }
  function visibilityChange() {
    lastTime = 0
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0 }
    else start()
  }
  function loseContext(event: Event) {
    event.preventDefault()
    contextLost = true
    rendered = false
    cancelAnimationFrame(frame)
    frame = 0
    onUnavailable()
  }
  function restoreContext() {
    contextLost = false
    lastTime = 0
    drawnSize = 0
    resize()
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    lastTime = 0
    if (visible) start()
    else { cancelAnimationFrame(frame); frame = 0 }
  })
  intersection.observe(host)
  window.addEventListener('pointermove', move, { passive: true })
  document.addEventListener('visibilitychange', visibilityChange)
  canvas.addEventListener('webglcontextlost', loseContext)
  canvas.addEventListener('webglcontextrestored', restoreContext)
  resize()

  return {
    wake: start,
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersection.disconnect()
      window.removeEventListener('pointermove', move)
      document.removeEventListener('visibilitychange', visibilityChange)
      canvas.removeEventListener('webglcontextlost', loseContext)
      canvas.removeEventListener('webglcontextrestored', restoreContext)
      mark.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
