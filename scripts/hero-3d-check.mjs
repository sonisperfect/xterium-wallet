import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const base = process.env.HERO_URL ?? 'http://127.0.0.1:7212/'
const out = 'scripts/shots-dev'
await mkdir(out, { recursive: true })
const browser = await chromium.launch({
  channel: 'msedge', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const failures = []

async function pixelStats(page, screenshot) {
  return page.evaluate(async (base64) => {
    const img = new Image()
    img.src = `data:image/png;base64,${base64}`
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const context = canvas.getContext('2d')
    context.drawImage(img, 0, 0)
    const { data } = context.getImageData(0, 0, img.width, img.height)
    let painted = 0
    let left = img.width, right = 0, top = img.height, bottom = 0
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const i = (y * img.width + x) * 4
        if (data[i] > 110 && data[i + 1] > 100 && data[i + 2] > 85) {
          painted++
          left = Math.min(left, x); right = Math.max(right, x)
          top = Math.min(top, y); bottom = Math.max(bottom, y)
        }
      }
    }
    return { width: img.width, height: img.height, painted, left, right, top, bottom }
  }, screenshot.toString('base64'))
}

async function checkViewport(name, width, height, reduced = false) {
  const context = await browser.newContext({
    viewport: { width, height }, deviceScaleFactor: 1,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    isMobile: width < 640, hasTouch: width < 640,
  })
  const page = await context.newPage()
  await page.addInitScript(() => {
    window.heroEntranceScales = []
    function sampleEntrance() {
      const heading = document.querySelector('.blockchain-heading')
      if (heading) {
        const style = getComputedStyle(heading)
        const scale = new DOMMatrixReadOnly(style.transform).a
        window.heroEntranceScales.push(scale)
        if ((scale >= 0.999 && style.opacity === '1' && !document.querySelector('.preloader')) || window.heroEntranceScales.length >= 600) return
      }
      requestAnimationFrame(sampleEntrance)
    }
    requestAnimationFrame(sampleEntrance)
  })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().startsWith(base)) errors.push(`${response.status()} ${response.url()}`)
  })
  try {
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.waitForSelector('.blockchain-heading[data-ready="true"]', { timeout: 20000 })
    await page.locator('[role="status"]').waitFor({ state: 'detached', timeout: 10000 })
    await page.waitForTimeout(2800)
    const entranceScales = await page.evaluate(() => window.heroEntranceScales)
    assert(entranceScales.length > 0, `${name}: no entrance samples`)
    assert(Math.abs(entranceScales.at(-1) - 1) < 0.002, `${name}: entrance did not settle at full size`)
    if (reduced) assert(entranceScales.every((scale) => Math.abs(scale - 1) < 0.002), `${name}: reduced motion still zooms`)
    else {
      assert(Math.min(...entranceScales) < 0.7, `${name}: entrance did not start zoomed out`)
      assert(entranceScales.some((scale) => scale > 0.7 && scale < 0.97), `${name}: entrance did not animate through the zoom`)
      assert(entranceScales.every((scale, index) => !index || scale >= entranceScales[index - 1] - 0.002), `${name}: entrance zoom reversed`)
    }
    const scene = page.locator('.blockchain-heading-scene')
    const first = await scene.screenshot({ path: `${out}/hero-${name}-letters.png` })
    const pixels = await pixelStats(page, first)
    assert(pixels.painted > 800, `${name}: blank lettering`)
    assert(pixels.left > 2 && pixels.right < pixels.width - 3, `${name}: horizontal clipping`)
    assert(pixels.top > 2 && pixels.bottom < pixels.height - 3, `${name}: vertical clipping`)
    await page.screenshot({ path: `${out}/hero-${name}.png` })
    const layout = await page.evaluate(() => {
      const heading = document.querySelector('h1').getBoundingClientRect()
      const button = document.querySelector('.hero-download').getBoundingClientRect()
      const nav = document.querySelector('header').getBoundingClientRect()
      return { headingTop: heading.top, headingBottom: heading.bottom, buttonTop: button.top,
        buttonBottom: button.bottom, navBottom: nav.bottom, height: innerHeight,
        width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }
    })
    assert(layout.headingBottom <= layout.buttonTop, `${name}: heading overlaps CTA`)
    assert(layout.headingTop >= layout.navBottom - 2, `${name}: heading overlaps nav`)
    assert(layout.buttonBottom < height - 35, `${name}: CTA outside viewport`)
    if (layout.scrollWidth > layout.width + 1) {
      console.log(JSON.stringify({ name, layout, overflow: await page.evaluate(() =>
        [...document.querySelectorAll('main *, footer *')].filter((element) => {
          const bounds = element.getBoundingClientRect()
          return bounds.width > 0 && bounds.right > document.documentElement.clientWidth + 1
        }).slice(0, 15).map((el) => ({ tag: el.tagName, classes: el.className, width: el.getBoundingClientRect().width }))) }))
    }
    assert(layout.scrollWidth <= layout.width + 1, `${name}: page overflow`)

    if (name === 'desktop') {
      await page.waitForTimeout(350)
      assert(!first.equals(await scene.screenshot()), 'Idle motion is frozen')
      const bounds = await scene.boundingBox()
      await page.mouse.move(bounds.x + bounds.width * 0.9, bounds.y + bounds.height * 0.35)
      await page.waitForTimeout(600)
      await page.screenshot({ path: `${out}/hero-pointer.png` })
      const originalCanvas = await page.locator('.blockchain-heading canvas').elementHandle()
      for (const [progress, active] of [[0.45, 'stats'], [0.85, 'app'], [0.45, 'stats'], [0, 'hero']]) {
        await page.evaluate((p) => {
          const section = document.querySelector('[data-hero-sequence]')
          window.scrollTo({ top: section.offsetTop + (section.offsetHeight - innerHeight) * p, behavior: 'instant' })
        }, progress)
        await page.waitForTimeout(1100)
        assert.equal(await page.locator(`[data-hero-slide="${active}"]`).getAttribute('aria-hidden'), 'false')
        const inactive = await page.locator('[data-hero-slide][aria-hidden="true"]').evaluateAll((elements) => elements.every((el) => el.inert))
        assert(inactive, 'Inactive slide can receive focus')
        await page.screenshot({ path: `${out}/hero-scroll-${active}.png` })
      }
      assert(await originalCanvas.evaluate((canvas) => canvas === document.querySelector('.blockchain-heading canvas')), 'Scroll recreated the canvas')
      await originalCanvas.evaluate((canvas) => {
        const extension = canvas.getContext('webgl2').getExtension('WEBGL_lose_context')
        canvas.restoreTestContext = () => extension.restoreContext()
        extension.loseContext()
      })
      await page.waitForSelector('.blockchain-heading[data-ready="false"]')
      await page.waitForTimeout(600)
      await page.screenshot({ path: `${out}/hero-context-lost.png` })
      await originalCanvas.evaluate((canvas) => canvas.restoreTestContext())
      await page.waitForSelector('.blockchain-heading[data-ready="true"]')
      await page.waitForTimeout(600)
      assert((await pixelStats(page, await scene.screenshot())).painted > 800, 'Context recovery rendered blank')
      await page.locator('.hero-download').click()
      await page.waitForTimeout(1800)
      assert(await page.locator('#download').evaluate((el) => Math.abs(el.getBoundingClientRect().top) < 140), 'Download anchor failed')
    }
    if (reduced) {
      await page.waitForTimeout(400)
      assert(first.equals(await scene.screenshot()), `${name}: reduced-motion canvas changed`)
      assert.equal(await page.locator('[data-hero-sequence]').count(), 0)
    }
    if (['mobile', 'small', 'landscape'].includes(name)) {
      for (const [progress, active] of [[0.45, 'stats'], [0.85, 'app']]) {
        await page.evaluate((p) => {
          const section = document.querySelector('[data-hero-sequence]')
          window.scrollTo({ top: section.offsetTop + (section.offsetHeight - innerHeight) * p, behavior: 'instant' })
        }, progress)
        await page.waitForTimeout(1000)
        const bounds = await page.locator(`[data-hero-slide="${active}"] > div`).boundingBox()
        assert(bounds.y >= 67 && bounds.y + bounds.height <= height, `${name}: ${active} slide does not fit`)
        await page.screenshot({ path: `${out}/hero-${name}-${active}.png` })
      }
    }
    assert.deepEqual(errors, [], `${name}: browser errors`)
    console.log(JSON.stringify({ name, pixels, layout, result: 'PASS' }))
  } catch (error) {
    failures.push(`${name}: ${error.message}`)
    await page.screenshot({ path: `${out}/hero-${name}-failure.png` }).catch(() => {})
    console.error(`${name}: ${error.message}`)
  } finally { await context.close() }
}

try {
  for (const [name, width, height, reduced] of [
    ['desktop', 1440, 900], ['wide', 1920, 1080], ['tablet', 768, 1024],
    ['breakpoint', 640, 800], ['mobile', 390, 844], ['small', 320, 740],
    ['landscape', 844, 390], ['reduced', 1440, 900, true], ['mobile-reduced', 390, 844, true],
  ].filter(([name]) => !process.env.HERO_CASES || process.env.HERO_CASES.split(',').includes(name))) await checkViewport(name, width, height, reduced)

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null
      return original.call(this, type, ...args)
    }
  })
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.locator('[role="status"]').waitFor({ state: 'detached', timeout: 10000 })
  const fallback = page.locator('.blockchain-heading-fallback img')
  assert(await fallback.evaluate((img) => img.complete && img.naturalWidth > 0), 'Fallback asset failed to load')
  assert.equal(await page.locator('.blockchain-heading').getAttribute('data-ready'), 'false')
  await page.screenshot({ path: `${out}/hero-no-webgl.png` })
  console.log('WebGL unavailable fallback: PASS')
  await context.close()
  assert.deepEqual(failures, [])
} finally { await browser.close() }
