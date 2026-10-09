import {
  ACESFilmicToneMapping, DirectionalLight, HemisphereLight,
  OrthographicCamera, Scene, SRGBColorSpace, WebGLRenderer,
} from 'three'
import { createLogoMark } from './logoMark'

export function mountPreloaderScene(host: HTMLElement, onReady: () => void, onUnavailable: () => void) {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  const canvas = renderer.domElement
  host.append(canvas)

  const scene = new Scene()
  const camera = new OrthographicCamera(-1.6, 1.6, 1.6, -1.6, 0.1, 20)
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
  let frame = 0
  let lastTime = 0
  let elapsed = 0
  let ready = false
  const mark = createLogoMark({
    onLoad: () => { ready = true; start() },
    onError: () => { if (!disposed) onUnavailable() },
  })
  scene.add(mark.group)

  function render(now: number) {
    frame = 0
    if (disposed || contextLost || document.hidden) return
    elapsed += lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0
    lastTime = now
    const settle = 1 - Math.pow(1 - Math.min(elapsed / 0.8, 1), 3)
    mark.group.rotation.set(-0.13 + Math.sin(elapsed * 0.9) * 0.06,
      -0.3 + Math.sin(elapsed * 1.1) * 0.2 - (1 - settle) * 0.35, -0.04)
    mark.group.position.y = Math.sin(elapsed * 1.6) * 0.045 - (1 - settle) * 0.12
    renderer.render(scene, camera)
    if (ready) { ready = false; onReady() }
    frame = requestAnimationFrame(render)
  }
  function start() {
    if (!frame && !disposed && !contextLost && !document.hidden) frame = requestAnimationFrame(render)
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.left = -1.6 * width / height
    camera.right = 1.6 * width / height
    camera.updateProjectionMatrix()
    start()
  }
  function visibilityChange() {
    lastTime = 0
    cancelAnimationFrame(frame)
    frame = 0
    if (!document.hidden) start()
  }
  function loseContext(event: Event) {
    event.preventDefault()
    contextLost = true
    cancelAnimationFrame(frame)
    frame = 0
    onUnavailable()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  document.addEventListener('visibilitychange', visibilityChange)
  canvas.addEventListener('webglcontextlost', loseContext)
  resize()

  return () => {
    disposed = true
    cancelAnimationFrame(frame)
    observer.disconnect()
    document.removeEventListener('visibilitychange', visibilityChange)
    canvas.removeEventListener('webglcontextlost', loseContext)
    mark.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
  }
}
