import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const base = process.env.HERO_URL ?? 'http://127.0.0.1:7212/'
const out = 'scripts/shots-dev'
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })

async function inspectLogo(page, png) {
  return page.evaluate(async (encoded) => {
    const image = new Image()
    image.src = `data:image/png;base64,${encoded}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width; canvas.height = image.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let painted = 0, left = canvas.width, right = 0, top = canvas.height, bottom = 0
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4
      if (data[i] > 120 && data[i + 1] < 150 && data[i + 2] > 40) {
        painted++; left = Math.min(left, x); right = Math.max(right, x)
        top = Math.min(top, y); bottom = Math.max(bottom, y)
      }
    }
    return { painted, left, right, top, bottom, width: canvas.width, height: canvas.height }
  }, png.toString('base64'))
}

async function check(name, viewport, { reduced = false, timeout = false, noWebGL = false, failedLogo = false } = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: reduced ? 'reduce' : 'no-preference' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  let releaseHero
  const heroGate = new Promise((resolve) => { releaseHero = resolve })
  if (!noWebGL && !failedLogo) {
    await page.route('**/src/lib/blockchainScene.ts*', async (route) => {
      await heroGate
      await route.continue().catch(() => {})
    })
  }
  if (failedLogo) await page.route('**/logo/xterium-logo.png', (route) => route.abort())
  if (noWebGL) await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return ['webgl', 'webgl2', 'experimental-webgl'].includes(type) ? null : original.call(this, type, ...args)
    }
  })
  try {
    await page.goto(base, { waitUntil: 'domcontentloaded' })
    await page.locator('.preloader').waitFor()
    const start = Date.now()
    if (!noWebGL && !failedLogo && !timeout) {
      if (!reduced) await page.waitForSelector('.preloader-mark[data-rendered="true"]')
      const mark = page.locator('.preloader-mark')
      const first = await mark.screenshot({ path: `${out}/preloader-${name}-mark.png` })
      const pixels = await inspectLogo(page, first)
      assert(pixels.painted > 500, `${name}: blank logo`)
      assert(pixels.left > 2 && pixels.top > 2 && pixels.right < pixels.width - 3 && pixels.bottom < pixels.height - 3, `${name}: clipped logo`)
      await page.waitForTimeout(220)
      const second = await mark.screenshot()
      assert.equal(first.equals(second), reduced, `${name}: incorrect motion preference`)
      const bounds = await page.locator('.preloader-content').boundingBox()
      assert(bounds.y > 0 && bounds.y + bounds.height < viewport.height, `${name}: content exceeds viewport`)
      assert(await page.locator('.preloader-page').evaluate((el) => el.inert), 'Page is interactive under the loader')
      assert.equal(await page.evaluate(() => document.documentElement.style.overflow), 'hidden')
      await page.mouse.wheel(0, 300)
      await page.keyboard.press('Tab')
      assert.equal(await page.evaluate(() => window.scrollY), 0, 'Page scrolled behind the loader')
      assert(await page.evaluate(() => !document.activeElement.closest('.preloader-page')), 'Keyboard entered the covered page')
      await page.screenshot({ path: `${out}/preloader-${name}.png` })
      console.log(JSON.stringify({ name, pixels }))
    }
    if (!timeout) releaseHero()
    if (name === 'desktop') {
      await page.waitForSelector('.preloader[data-ready="true"]')
      await page.waitForTimeout(360)
      await page.screenshot({ path: `${out}/preloader-handoff.png` })
    }
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 5500 })
    assert(Date.now() - start < 6000, `${name}: preloader trapped the visitor`)
    assert.equal(await page.evaluate(() => document.documentElement.style.overflow), '')
    assert.equal(await page.locator('.preloader-page').evaluate((el) => el.inert), false)
    assert.equal(await page.locator('.preloader-mark canvas').count(), 0, 'Preloader canvas was not removed')
    if (timeout) {
      assert.equal(await page.locator('.blockchain-heading').getAttribute('data-ready'), 'false')
      releaseHero()
    }
    await page.waitForTimeout(1300)
    await page.screenshot({ path: `${out}/preloader-${name}-complete.png` })
    assert.equal(await page.locator('.hero-download').evaluate((el) => getComputedStyle(el.parentElement).opacity), '1')
    if (noWebGL) assert.equal(await page.locator('.blockchain-heading').getAttribute('data-ready'), 'false')
    else await page.waitForSelector('.blockchain-heading[data-ready="true"]')
    assert.deepEqual(errors, [], `${name}: browser errors`)
    console.log(`${name}: PASS`)
  } finally { releaseHero(); await context.close() }
}

try {
  await check('desktop', { width: 1440, height: 900 })
  await check('mobile', { width: 390, height: 844 })
  await check('landscape', { width: 844, height: 390 })
  await check('reduced', { width: 390, height: 844 }, { reduced: true })
  await check('timeout', { width: 1440, height: 900 }, { timeout: true })
  await check('no-webgl', { width: 390, height: 844 }, { noWebGL: true })
  await check('failed-logo', { width: 390, height: 844 }, { failedLogo: true })
} finally { await browser.close() }
