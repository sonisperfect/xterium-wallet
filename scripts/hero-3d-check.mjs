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
    // the mascot's first frames out of hiding
    window.mascotFrames = []
    function sampleMascot() {
      const body = document.querySelector('.mascot')
      if (body?.dataset.parked === 'false') {
        const bounds = body.getBoundingClientRect()
        window.mascotFrames.push({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2, size: bounds.width })
      }
      if (window.mascotFrames.length < 240) requestAnimationFrame(sampleMascot)
    }
    requestAnimationFrame(sampleMascot)
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
      assert(Math.min(...entranceScales) < 0.95, `${name}: entrance did not start zoomed out`)
      assert(entranceScales.some((scale) => scale > 0.95 && scale < 0.995), `${name}: entrance did not animate through the zoom`)
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

    // the mascot: only in the pinned layout, and only once the page scrolls from the top;
    // live 3D with a mouse and room for it, the logo image elsewhere
    const pinnedLayout = !reduced && height >= 560
    assert.equal(await page.locator('.mascot').count(), pinnedLayout ? 1 : 0, `${name}: mascot in the wrong layout`)
    assert.equal(await page.locator('.hero-mascot-dock').count(), pinnedLayout ? 1 : 0, `${name}: hero dock in the wrong layout`)
    if (pinnedLayout) {
      const state = () => page.evaluate(() => {
        const body = document.querySelector('.mascot')
        const bounds = body.getBoundingClientRect()
        const logo = document.querySelector('[data-mascot-dock="nav"]').getBoundingClientRect()
        // centred on the hero, which a reserved scrollbar gutter can make narrower than the viewport
        const hero = document.querySelector('.hero-slide').getBoundingClientRect()
        return {
          parked: body.dataset.parked, visibility: getComputedStyle(body).visibility,
          x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2, size: bounds.width,
          logo: { x: logo.left + logo.width / 2, y: logo.top + logo.height / 2, size: logo.width },
          heroX: hero.left + hero.width / 2,
        }
      })
      const inLogo = (s) => s.parked === 'true' && s.visibility === 'hidden'
        && Math.hypot(s.x - s.logo.x, s.y - s.logo.y) < 2 && Math.abs(s.size / s.logo.size - 1.2) < 0.05
      // above the fold at rest it's tucked away behind the nav's logo, never shown
      const resting = await state()
      assert(inLogo(resting), `${name}: mascot showing before any scroll: ${JSON.stringify(resting)}`)
      assert.equal(await page.evaluate(() => window.mascotFrames.length), 0, `${name}: mascot showed before scrolling`)

      // scrolling from the top brings it out of the logo, down into the hero
      await page.evaluate(() => window.scrollTo({ top: 12, behavior: 'instant' }))
      await page.waitForTimeout(1600)
      // contexts under 640px emulate touch; the wider ones have a fine pointer
      const live = width >= 1024
      if (live) await page.waitForSelector('.mascot[data-ready="true"]', { timeout: 10000 })
      assert.equal(await page.locator('.mascot canvas').count(), live ? 1 : 0, `${name}: wrong mascot renderer`)
      const mascot = await state()
      const peak = mascot.y - mascot.size * 0.42
      assert(mascot.parked === 'false' && mascot.visibility === 'visible', `${name}: mascot did not come out`)
      assert(Math.abs(mascot.x - mascot.heroX) < 2, `${name}: mascot not centred`)
      assert(mascot.size >= 240 && mascot.y >= height - 1 && peak < height - 120, `${name}: mascot does not rise from the bottom edge`)
      assert(peak > layout.buttonBottom + 12, `${name}: mascot crowds the CTA`)
      // its first frame out is near the start of the logo → hero path — the ease is quick off the mark,
      // and a slow first frame under SwiftShader can land a fifth of the way along
      const frames = await page.evaluate(() => window.mascotFrames)
      const along = frames.length && Math.hypot(frames[0].x - resting.logo.x, frames[0].y - resting.logo.y)
        / Math.hypot(mascot.x - resting.logo.x, mascot.y - resting.logo.y)
      assert(frames.length && along < 0.35 && frames[0].size < mascot.size * 0.4,
        `${name}: mascot did not grow out of the nav logo: ${JSON.stringify({ first: frames[0], logo: resting.logo, along })}`)
      assert(frames.some((frame) => frame.size > resting.logo.size * 3 && frame.size < mascot.size * 0.9), `${name}: mascot did not travel from the logo`)

      // back at the top it tucks into the logo again
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await page.waitForTimeout(1200)
      assert(inLogo(await state()), `${name}: mascot did not tuck back into the logo`)
    }

    if (name === 'desktop') {
      await page.waitForTimeout(350)
      assert(!first.equals(await scene.screenshot()), 'Idle motion is frozen')
      const bounds = await scene.boundingBox()
      await page.mouse.move(bounds.x + bounds.width * 0.9, bounds.y + bounds.height * 0.35)
      await page.waitForTimeout(600)
      await page.screenshot({ path: `${out}/hero-pointer.png` })
      const originalCanvas = await page.locator('.blockchain-heading canvas').elementHandle()
      // the curtains part onto the cream app stage, and the nav flips to ink with them
      for (const [progress, active, tone] of [[0.3, 'app', 'light'], [0.6, 'app', 'light'], [0.05, 'hero', 'dark'], [0, 'hero', 'dark']]) {
        await page.evaluate((p) => {
          const section = document.querySelector('[data-hero-sequence]')
          window.scrollTo({ top: section.offsetTop + (section.offsetHeight - innerHeight) * p, behavior: 'instant' })
        }, progress)
        await page.waitForTimeout(1100)
        assert.equal(await page.locator(`[data-hero-slide="${active}"]`).getAttribute('aria-hidden'), 'false')
        const inactive = await page.locator('[data-hero-slide][aria-hidden="true"]').evaluateAll((elements) => elements.every((el) => el.inert))
        assert(inactive, 'Inactive slide can receive focus')
        assert.equal(await page.locator('header').getAttribute('data-tone'), tone, `Nav tone at ${progress}`)
        await page.screenshot({ path: `${out}/hero-scroll-${active}-${progress}.png` })
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
    // short viewports (landscape phones) flow instead of pinning
    const staged = await page.locator('[data-hero-sequence]').count() > 0
    assert.equal(staged, !reduced && height >= 560, `${name}: wrong layout mode`)
    if (staged) {
      // the heading moment, the second screen, and the last screen
      for (const progress of [0.3, 0.55, 0.91]) {
        await page.evaluate((p) => {
          const section = document.querySelector('[data-hero-sequence]')
          window.scrollTo({ top: section.offsetTop + (section.offsetHeight - innerHeight) * p, behavior: 'instant' })
        }, progress)
        await page.waitForTimeout(1000)
        const fit = await page.evaluate(() => {
          const stage = document.querySelector('[data-hero-slide="app"]')
          const box = (selector) => {
            const bounds = stage.querySelector(selector)?.getBoundingClientRect()
            return bounds && { top: bounds.top, bottom: bounds.bottom, left: bounds.left, right: bounds.right }
          }
          // the glyphs themselves, not the offset shadow copy behind them
          const text = document.createRange()
          text.selectNodeContents(stage.querySelector('.stage-heading .voxel-heading'))
          const glyphs = text.getBoundingClientRect()
          return {
            phone: box('.phone-frame'), card: box('.tour-card[aria-hidden="false"]'), controls: box('.stage-controls'),
            headingOverflow: Math.max(0, -glyphs.left, glyphs.right - innerWidth), headingLines: text.getClientRects().length,
          }
        })
        for (const key of ['phone', 'card', 'controls']) {
          const bounds = fit[key]
          if (!bounds) continue
          assert(bounds.top >= 60 && bounds.bottom <= height && bounds.left >= 0 && bounds.right <= width,
            `${name}: ${key} does not fit at ${progress}: ${JSON.stringify(bounds)}`)
        }
        assert(progress < 0.37 || fit.card, `${name}: no card at ${progress}`)
        // on the phone: on the blank screen, centred between its top edge and the heading's
        // marker (at most 80% of that gap); then over the logo in the app's header — centred
        // at (84.5, 134.5) and 65px across in the 946×2049 screenshots, whose top 80px are
        // cropped — a size up (1.5×) from it
        const perch = await page.evaluate((blank) => {
          const mascot = document.querySelector('.mascot').getBoundingClientRect()
          const stage = document.querySelector('[data-hero-slide="app"]')
          const frame = stage.querySelector('.phone-frame').getBoundingClientRect()
          const shot = stage.querySelector('.app-screenshot').getBoundingClientRect()
          const marker = stage.querySelector('[data-mascot-floor]').getBoundingClientRect()
          const screenTop = shot.top
          const gap = marker.top - screenTop
          const target = blank
            ? { x: frame.left + frame.width / 2, y: screenTop + gap / 2,
              size: Math.min(stage.querySelector('[data-mascot-dock="app"]').offsetWidth, gap * 0.8) }
            : { x: shot.left + shot.width * 84.5 / 946, y: shot.top + shot.height * 54.5 / 1858, size: shot.width * 65 / 946 * 1.2 * 1.5 }
          return {
            dx: mascot.left + mascot.width / 2 - target.x, dy: mascot.top + mascot.height / 2 - target.y,
            size: mascot.width, ratio: mascot.width / target.size,
            inside: mascot.top > screenTop && mascot.bottom < marker.top,
          }
        }, progress < 0.34)
        assert(perch.size <= 130 && Math.abs(perch.dx) < 2 && Math.abs(perch.dy) < 2 && Math.abs(perch.ratio - 1) < 0.05
          && (progress >= 0.34 || perch.inside),
          `${name}: mascot is not in place on the phone at ${progress}: ${JSON.stringify(perch)}`)
        assert(fit.headingOverflow <= 1 && fit.headingLines === 1, `${name}: stage heading overflows or wraps`)
        await page.screenshot({ path: `${out}/hero-${name}-stage-${progress}.png` })
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

  // The 3D mascot's canvas reallocates as it grows and shrinks, which wipes it; it must be
  // redrawn before the browser paints, or it blinks out for a frame each time.
  if (!process.env.HERO_CASES || process.env.HERO_CASES.split(',').includes('desktop')) {
    const blinkContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const blinkPage = await blinkContext.newPage()
    await blinkPage.addInitScript(() => {
      // keep the drawing buffer readable so the check can look at it
      const getContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (type, options) {
        return getContext.call(this, type, type.startsWith('webgl') ? { ...options, preserveDrawingBuffer: true } : options)
      }
      window.mascotResizes = 0
      window.mascotBlinks = []
      const width = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'width')
      Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
        get() { return width.get.call(this) },
        set(value) {
          const watch = this.closest?.('.mascot') && value !== width.get.call(this)
          width.set.call(this, value)
          if (!watch) return
          window.mascotResizes++
          const canvas = this
          // once the resize handler has finished, still ahead of this frame's paint
          queueMicrotask(() => {
            const body = canvas.closest('.mascot')
            if (body.dataset.ready !== 'true') return // not drawn yet: the logo image stands in
            const probe = document.createElement('canvas').getContext('2d')
            probe.canvas.width = probe.canvas.height = 48
            probe.drawImage(canvas, 0, 0, 48, 48)
            if (!probe.getImageData(0, 0, 48, 48).data.some((value, index) => index % 4 === 3 && value > 0)) {
              window.mascotBlinks.push({ to: value, parked: body.dataset.parked })
            }
          })
        },
      })
    })
    await blinkPage.goto(base, { waitUntil: 'networkidle' })
    await blinkPage.locator('[role="status"]').waitFor({ state: 'detached', timeout: 10000 })
    await blinkPage.waitForTimeout(600)
    for (const step of [100, -100]) {
      for (let i = 0; i < 70; i++) { await blinkPage.mouse.wheel(0, step); await blinkPage.waitForTimeout(50) }
    }
    await blinkPage.waitForTimeout(800)
    const { resizes, blinks } = await blinkPage.evaluate(() => ({ resizes: window.mascotResizes, blinks: window.mascotBlinks }))
    assert(resizes > 10, `Mascot never resized (${resizes}); the blink check saw nothing`)
    assert.deepEqual(blinks, [], 'Mascot canvas painted blank after a resize')
    console.log(`Mascot resized ${resizes} times without a blank frame: PASS`)
    await blinkContext.close()
  }

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
