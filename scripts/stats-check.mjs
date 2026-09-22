import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const base = process.env.HERO_URL ?? 'http://127.0.0.1:7212/'
const out = 'scripts/shots-dev'
const finalValues = ['12', '3', '0', '100%']
const initialValues = ['0', '0', '0', '0%']
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })

async function scrollToStep(page, progress) {
  await page.evaluate((p) => {
    const sequence = document.querySelector('[data-hero-sequence]')
    scrollTo({ top: sequence.offsetTop + (sequence.offsetHeight - innerHeight) * p, behavior: 'instant' })
  }, progress)
}

async function values(page, selector = '[data-hero-slide="stats"]') {
  return page.locator(`${selector} p.font-display`).allTextContents()
}

async function verifyEntrance(page, name) {
  const frames = await page.evaluate(() => new Promise((resolve) => {
    const sequence = document.querySelector('[data-hero-sequence]')
    const stats = document.querySelector('[data-hero-slide="stats"]')
    const columns = [...stats.querySelectorAll('.grid > div')]
    const samples = []
    const start = performance.now()
    scrollTo({ top: sequence.offsetTop + (sequence.offsetHeight - innerHeight) * 0.45, behavior: 'instant' })
    function sample(now) {
      samples.push({
        opacity: Number(getComputedStyle(stats).opacity),
        columns: columns.map((column) => Number(getComputedStyle(column).opacity)),
        counts: [...stats.querySelectorAll('p.font-display')].map((p) => parseFloat(p.textContent)),
      })
      if (now - start < 2200) requestAnimationFrame(sample)
      else resolve(samples)
    }
    requestAnimationFrame(sample)
  }))
  for (const [index, end] of [[0, 12], [1, 3], [3, 100]]) {
    assert(frames.some((frame) => frame.opacity >= 0.65 && frame.columns[index] > 0.3 && frame.counts[index] > 0 && frame.counts[index] < end), `${name}: counter ${index} did not count while visible`)
  }
  assert(frames.every((frame) => frame.counts[2] === 0), `${name}: zero statistic changed`)
  assert(frames.some((frame) => frame.columns[0] > frame.columns[3] + 0.2), `${name}: staggered column reveal missing`)
  assert.deepEqual(await values(page), finalValues)
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: horizontal overflow`)
  await page.screenshot({ path: `${out}/stats-${name}.png` })
}

try {
  for (const [name, width, height, reduced] of [
    ['desktop', 1440, 900, false], ['mobile', 390, 844, false], ['reduced', 390, 844, true],
  ]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.locator('.preloader').waitFor({ state: 'detached' })
    await page.waitForTimeout(1600)
    if (reduced) {
      assert.deepEqual(await values(page, '#stats'), finalValues)
      await page.locator('#stats').scrollIntoViewIfNeeded()
      await page.waitForTimeout(400)
      assert.deepEqual(await values(page, '#stats'), finalValues)
      await page.screenshot({ path: `${out}/stats-${name}.png` })
    } else {
      assert.deepEqual(await values(page), initialValues, `${name}: counters ran behind the hero`)
      await verifyEntrance(page, `${name}-first`)
      await scrollToStep(page, 0.85)
      await page.waitForTimeout(800)
      assert.deepEqual(await values(page), initialValues, `${name}: counters did not reset while hidden`)
      await verifyEntrance(page, `${name}-reverse`)
      await scrollToStep(page, 0)
      await page.waitForTimeout(800)
      await scrollToStep(page, 0.45)
      await page.waitForTimeout(350)
      await scrollToStep(page, 0.85)
      await page.waitForTimeout(1500)
      assert.deepEqual(await values(page), initialValues, `${name}: interrupted counting kept running`)
    }
    assert.deepEqual(errors, [], `${name}: browser errors`)
    console.log(`${name}: visibility-gated counting, reveal, replay, and motion preference PASS`)
    await context.close()
  }
} finally { await browser.close() }
