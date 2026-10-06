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

// The stats stage's progress runs from its top entering the viewport to its end reaching the bottom.
async function scrollToStage(page, progress) {
  await page.evaluate((p) => {
    const stage = document.querySelector('[data-stage="stats"]')
    const top = stage.getBoundingClientRect().top + scrollY
    scrollTo({ top: top - innerHeight + stage.offsetHeight * p, behavior: 'instant' })
  }, progress)
}

async function values(page) {
  return page.locator('#stats p.font-display').allTextContents()
}

async function verifyEntrance(page, name) {
  const frames = await page.evaluate(() => new Promise((resolve) => {
    const stage = document.querySelector('[data-stage="stats"]')
    const cards = [...stage.querySelectorAll('.stat-card')]
    const samples = []
    const start = performance.now()
    const top = stage.getBoundingClientRect().top + scrollY
    scrollTo({ top: top - innerHeight + stage.offsetHeight * 0.97, behavior: 'instant' })
    function sample(now) {
      samples.push({
        cards: cards.map((card) => Number(getComputedStyle(card).opacity)),
        counts: cards.map((card) => parseFloat(card.querySelector('p.font-display').textContent)),
      })
      if (now - start < 2600) requestAnimationFrame(sample)
      else resolve(samples)
    }
    requestAnimationFrame(sample)
  }))
  for (const [index, end] of [[0, 12], [1, 3], [3, 100]]) {
    assert(frames.some((frame) => frame.cards[index] > 0.6 && frame.counts[index] > 0 && frame.counts[index] < end), `${name}: counter ${index} did not count while visible`)
    assert(frames.every((frame) => frame.cards[index] > 0.3 || frame.counts[index] === 0), `${name}: counter ${index} ran before its card arrived`)
  }
  assert(frames.every((frame) => frame.counts[2] === 0), `${name}: zero statistic changed`)
  assert(frames.some((frame) => frame.cards[0] > frame.cards[3] + 0.2), `${name}: staggered card rise missing`)
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
      assert.equal(await page.locator('[data-stage="stats"]').count(), 0, 'Reduced motion still pins the stats')
      assert.deepEqual(await values(page), finalValues)
      await page.locator('#stats').scrollIntoViewIfNeeded()
      await page.waitForTimeout(400)
      assert.deepEqual(await values(page), finalValues)
      await page.screenshot({ path: `${out}/stats-${name}.png` })
    } else {
      assert.deepEqual(await values(page), initialValues, `${name}: counters ran before the stage`)
      await verifyEntrance(page, `${name}-first`)
      // fully formed cards sit inside the viewport, below the nav
      const bounds = await page.locator('#stats .stat-card').evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().toJSON()))
      assert(bounds.every((box) => box.top >= 60 && box.bottom <= height && box.left >= 0 && box.right <= width), `${name}: a card does not fit`)
      await scrollToStage(page, 0.2)
      await page.waitForTimeout(900)
      assert.deepEqual(await values(page), initialValues, `${name}: counters did not reset while hidden`)
      await verifyEntrance(page, `${name}-reverse`)
      await scrollToStage(page, 0.1)
      await page.waitForTimeout(800)
      await scrollToStage(page, 0.97)
      await page.waitForTimeout(350)
      await scrollToStage(page, 0.1)
      await page.waitForTimeout(1500)
      assert.deepEqual(await values(page), initialValues, `${name}: interrupted counting kept running`)
    }
    assert.deepEqual(errors, [], `${name}: browser errors`)
    console.log(`${name}: card-gated counting, staggered rise, replay, and motion preference PASS`)
    await context.close()
  }
} finally { await browser.close() }
