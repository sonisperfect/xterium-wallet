import {
  ExtrudeGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  PlaneGeometry, Shape, SRGBColorSpace, TextureLoader, Vector2,
} from 'three'

/**
 * The 3D Xterium mark shared by the preloader and the mascot: an extruded
 * diamond with metallic magenta edges, faced with the logo artwork. It spans
 * about 2 units square, centred on the origin.
 */
export function createLogoMark({ onLoad, onError }: { onLoad: () => void; onError: () => void }) {
  const group = new Group()
  const outline = new Shape([new Vector2(0, 0.95), new Vector2(0.95, 0), new Vector2(0, -0.95), new Vector2(-0.95, 0)])
  const bodyGeometry = new ExtrudeGeometry(outline, {
    depth: 0.24, bevelEnabled: true, bevelSize: 0.045, bevelThickness: 0.045,
    bevelSegments: 3, steps: 1,
  })
  bodyGeometry.translate(0, 0, -0.25)
  const face = new MeshBasicMaterial({ color: '#08070d' })
  const edge = new MeshStandardMaterial({ color: '#dc1c78', metalness: 0.55, roughness: 0.24 })
  group.add(new Mesh(bodyGeometry, [face, edge]))
  const imageGeometry = new PlaneGeometry(2.1, 2.1)
  const imageMaterial = new MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false })
  const logo = new Mesh(imageGeometry, imageMaterial)
  logo.position.z = 0.045
  // the artwork on the back too, so a full turn reads as a coin flip
  const back = new Mesh(imageGeometry, imageMaterial)
  back.position.z = -0.305
  back.rotation.y = Math.PI
  group.add(logo, back)

  let disposed = false
  const texture = new TextureLoader().load('/logo/xterium-logo.png', (loaded) => {
    if (disposed) { loaded.dispose(); return }
    loaded.colorSpace = SRGBColorSpace
    imageMaterial.map = loaded
    imageMaterial.needsUpdate = true
    onLoad()
  }, undefined, () => { if (!disposed) onError() })

  return {
    group,
    dispose() {
      disposed = true
      bodyGeometry.dispose()
      imageGeometry.dispose()
      face.dispose()
      edge.dispose()
      imageMaterial.dispose()
      texture.dispose()
    },
  }
}
