import {
  ACESFilmicToneMapping, DirectionalLight, ExtrudeGeometry, Group, HemisphereLight, MathUtils,
  Mesh, MeshStandardMaterial, OrthographicCamera, Path, Scene, Shape,
  SRGBColorSpace, Vector2, WebGLRenderer,
} from 'three'

type Point = [number, number]
type Glyph = { width: number; outline: Point[]; holes?: Point[][] }

const rectangle = (x: number, y: number, width: number, height: number): Point[] => [
  [x, y], [x + width, y], [x + width, y + height], [x, y + height],
]

// Continuous outlines keep the pixel silhouette without seams between voxels.
const GLYPHS: Record<string, Glyph> = {
  B: {
    width: 6,
    outline: [[0, 0], [5, 0], [5, 1], [6, 1], [6, 6], [5, 6], [5, 7], [0, 7]],
    holes: [rectangle(2.4, 1.5, 1.3, 1.3), rectangle(2.4, 4.2, 1.3, 1.3)],
  },
  L: { width: 5.5, outline: [[0, 0], [2.4, 0], [2.4, 5], [5.5, 5], [5.5, 7], [0, 7]] },
  O: {
    width: 6,
    outline: [[1, 0], [5, 0], [5, 1], [6, 1], [6, 6], [5, 6], [5, 7], [1, 7], [1, 6], [0, 6], [0, 1], [1, 1]],
    holes: [rectangle(2.3, 1.6, 1.4, 3.8)],
  },
  C: {
    width: 6,
    outline: [[1, 0], [5, 0], [5, 1], [6, 1], [6, 2.5], [3.8, 2.5], [3.8, 1.8], [2.3, 1.8], [2.3, 5.2], [3.8, 5.2], [3.8, 4.5], [6, 4.5], [6, 6], [5, 6], [5, 7], [1, 7], [1, 6], [0, 6], [0, 1], [1, 1]],
  },
  K: {
    width: 6,
    outline: [[0, 0], [2.3, 0], [2.3, 2.4], [3.4, 2.4], [3.4, 1], [4.4, 1], [4.4, 0], [6, 0], [6, 2], [5, 2], [5, 3], [4, 3], [4, 4], [5, 4], [5, 5], [6, 5], [6, 7], [4, 7], [4, 6], [3, 6], [3, 4.7], [2.3, 4.7], [2.3, 7], [0, 7]],
  },
  H: {
    width: 6,
    outline: [[0, 0], [2.2, 0], [2.2, 2.6], [3.8, 2.6], [3.8, 0], [6, 0], [6, 7], [3.8, 7], [3.8, 4.5], [2.2, 4.5], [2.2, 7], [0, 7]],
  },
  A: {
    width: 6,
    outline: [[1, 0], [5, 0], [5, 1], [6, 1], [6, 7], [3.8, 7], [3.8, 4.7], [2.2, 4.7], [2.2, 7], [0, 7], [0, 1], [1, 1]],
    holes: [rectangle(2.2, 1.6, 1.6, 1.5)],
  },
  I: { width: 2.6, outline: rectangle(0, 0, 2.6, 7) },
  N: {
    width: 6.5,
    outline: [[0, 0], [2.3, 0], [2.3, 1], [3.3, 1], [3.3, 2], [4.3, 2], [4.3, 0], [6.5, 0], [6.5, 7], [4.3, 7], [4.3, 5], [3.3, 5], [3.3, 4], [2.3, 4], [2.3, 7], [0, 7]],
  },
  '.': { width: 2.1, outline: rectangle(0, 4.9, 2.1, 2.1) },
}

const WORD = 'BLOCKCHAIN.'
const GAP = 1.25
const DEPTH = 4.4

function createShape(glyph: Glyph) {
  const points = (outline: Point[]) => outline.map(([x, y]) => new Vector2(x - glyph.width / 2, 3.5 - y))
  const shape = new Shape(points(glyph.outline))
  shape.holes = (glyph.holes ?? []).map((hole) => new Path(points(hole)))
  return shape
}

export function mountBlockchainScene(
  host: HTMLElement,
  { reduced, getExit, getStarted, onReady, onUnavailable }: {
    reduced: boolean
    getExit: () => number
    getStarted: () => boolean
    onReady: () => void
    onUnavailable: () => void
  },
) {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  host.append(canvas)

  const scene = new Scene()
  const camera = new OrthographicCamera(-40, 40, 8, -8, 0.1, 200)
  camera.position.set(0, 0, 90)
  const word = new Group()
  scene.add(word)

  const face = new MeshStandardMaterial({ color: '#d6ccb5', roughness: 0.34, metalness: 0.12 })
  const edge = new MeshStandardMaterial({ color: '#778184', roughness: 0.3, metalness: 0.48 })
  const side = new MeshStandardMaterial({ color: '#30383b', roughness: 0.42, metalness: 0.32 })
  scene.add(new HemisphereLight(0xffffff, 0x24232c, 2.2))
  const key = new DirectionalLight(0xfff5de, 3.4)
  key.position.set(-24, 28, 40)
  scene.add(key)
  const rim = new DirectionalLight(0xc8dbed, 2.2)
  rim.position.set(25, -8, -3)
  scene.add(rim)

  const geometries: ExtrudeGeometry[] = []
  const letters = [...WORD].map((character) => {
    const glyph = GLYPHS[character]
    const shape = createShape(glyph)
    const bodyGeometry = new ExtrudeGeometry(shape, {
      depth: DEPTH, bevelEnabled: true, bevelSegments: 1, steps: 1,
      bevelSize: 0.16, bevelThickness: 0.16, curveSegments: 1,
    })
    bodyGeometry.translate(0, 0, -DEPTH)
    const faceGeometry = new ExtrudeGeometry(shape, {
      depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1,
      bevelSize: 0.13, bevelThickness: 0.14, curveSegments: 1,
    })
    geometries.push(bodyGeometry, faceGeometry)
    const group = new Group()
    group.add(new Mesh(bodyGeometry, [side, edge]), new Mesh(faceGeometry, face))
    word.add(group)
    return { group, width: glyph.width, x: 0, y: 0 }
  })

  let disposed = false
  let contextLost = false
  let visible = true
  let frame = 0
  let lastTime = 0
  let elapsed = 0
  let ready = false
  const pointer = { x: 0, y: 0, currentX: 0, currentY: 0 }
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')

  function render(now: number) {
    frame = 0
    if (disposed || contextLost || !visible || document.hidden) return
    const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 1 / 60
    lastTime = now
    if (getStarted()) elapsed += delta
    const exit = getExit()
    const smoothing = 1 - Math.exp(-delta * 6)
    pointer.currentX = MathUtils.lerp(pointer.currentX, pointer.x, smoothing)
    pointer.currentY = MathUtils.lerp(pointer.currentY, pointer.y, smoothing)

    letters.forEach((letter, index) => {
      const drift = reduced || !finePointer.matches ? 0 : Math.sin(elapsed * 0.8 + index * 0.32) * 0.045
      letter.group.position.set(letter.x, letter.y + drift, 0)
      // Rotate each glyph around its own center, keeping the baseline readable.
      letter.group.rotation.set(-0.32 + pointer.currentY * 0.055, -0.3 + pointer.currentX * 0.065, 0)
    })
    word.position.y = exit * 2.4
    word.rotation.x = exit * 0.13
    word.scale.setScalar(1 + exit * 0.13)
    key.position.x = -24 + pointer.currentX * 12
    renderer.render(scene, camera)
    if (!ready) { ready = true; onReady() }
    // No background GPU work while another pinned slide is showing.
    if (!reduced && getStarted() && exit < 0.999) frame = requestAnimationFrame(render)
  }

  function invalidate() {
    if (!frame && !disposed && !contextLost) frame = requestAnimationFrame(render)
  }

  function resize() {
    // Render at the full layout resolution while the heading's entrance scales it visually.
    const { clientWidth: width, clientHeight: height } = host
    if (!width || !height) return
    const compact = window.matchMedia('(max-width: 639px)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.5 : 2))
    renderer.setSize(width, height, false)
    const rows = compact ? [letters.slice(0, 5), letters.slice(5)] : [letters]
    let widest = 0
    rows.forEach((row, rowIndex) => {
      const rowWidth = row.reduce((sum, letter) => sum + letter.width, 0) + (row.length - 1) * GAP
      widest = Math.max(widest, rowWidth)
      let x = -rowWidth / 2
      row.forEach((letter) => {
        letter.x = x + letter.width / 2
        letter.y = compact ? 5.3 - rowIndex * 10.6 : 0
        x += letter.width + GAP
      })
    })
    const aspect = width / height
    const worldHeight = Math.max(compact ? 23 : 12.5, (widest + 3.8) / aspect)
    camera.left = -worldHeight * aspect / 2
    camera.right = worldHeight * aspect / 2
    camera.top = worldHeight / 2
    camera.bottom = -worldHeight / 2
    camera.updateProjectionMatrix()
    invalidate()
  }

  function move(event: PointerEvent) {
    if (reduced || !finePointer.matches || event.pointerType === 'touch') return
    const bounds = host.getBoundingClientRect()
    pointer.x = MathUtils.clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1)
    pointer.y = MathUtils.clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1)
    invalidate()
  }
  function resetPointer() { pointer.x = 0; pointer.y = 0 }
  function visibilityChange() {
    lastTime = 0
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0 }
    else invalidate()
  }
  function loseContext(event: Event) {
    event.preventDefault()
    contextLost = true
    cancelAnimationFrame(frame)
    frame = 0
    onUnavailable()
  }
  function restoreContext() {
    contextLost = false
    ready = false
    lastTime = 0
    resize()
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    lastTime = 0
    if (visible) invalidate()
    else { cancelAnimationFrame(frame); frame = 0 }
  })
  observer.observe(host)
  host.addEventListener('pointermove', move)
  host.addEventListener('pointerleave', resetPointer)
  document.addEventListener('visibilitychange', visibilityChange)
  canvas.addEventListener('webglcontextlost', loseContext)
  canvas.addEventListener('webglcontextrestored', restoreContext)
  resize()

  return {
    invalidate,
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      observer.disconnect()
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', resetPointer)
      document.removeEventListener('visibilitychange', visibilityChange)
      canvas.removeEventListener('webglcontextlost', loseContext)
      canvas.removeEventListener('webglcontextrestored', restoreContext)
      geometries.forEach((geometry) => geometry.dispose())
      face.dispose()
      edge.dispose()
      side.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
