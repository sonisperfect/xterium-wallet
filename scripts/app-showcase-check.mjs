import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const base = process.env.HERO_URL ?? 'http://127.0.0.1:7212/'
const out = 'scripts/shots-dev'
const screens = ['portfolio', 'tokens', 'send', 'staking', 'governance']
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })

async function scrollToScreen(page, index) {
  await page.evaluate((i) => {
    const sequence = document.querySelector('.showcase-sequence')
    const top = sequence.getBoundingClientRect().top + scrollY
    window.scrollTo({ top: top + (sequence.offsetHeight - innerHeight) * ((i + 0.5) / 5), behavior: 'instant' })
  }, index)
}

async function verifyScreen(page, index, name) {
  await page.waitForFunction((screen) => {
    return document.querySelector('#showcase img[aria-hidden="false"]')?.getAttribute('src') === `/assets/app/${screen}.jpg`
  }, screens[index])
  await page.waitForTimeout(500)
  const image = page.locator('#showcase img[aria-hidden="false"]')
  assert.equal(await image.count(), 1)
  assert.equal(await image.getAttribute('src'), `/assets/app/${screens[index]}.jpg`)
  assert(await image.evaluate((img) => img.complete && img.naturalWidth === 946 && img.naturalHeight === 2049))
  const slide = page.locator('#showcase [aria-roledescription="slide"]')
  assert((await slide.getAttribute('aria-label')).endsWith(`${index + 1} of 5`))
  assert.equal(await page.getByRole('button', { name: 'Next app screen' }).getAttribute('aria-controls'), await slide.getAttribute('id'))
  assert.equal(await page.locator('#showcase [role="tablist"], #showcase [role="tab"]').count(), 0, 'Duplicate app tabs remain')
  const imageBounds = await image.boundingBox()
  const bounds = await page.locator('.app-screenshot').boundingBox()
  const scale = imageBounds.width / 946
  assert(Math.abs(imageBounds.width / imageBounds.height - 946 / 2049) < 0.002, 'Screenshot was stretched')
  assert(Math.abs(bounds.height - 1858 * scale) < 1, 'App viewport has the wrong crop')
  assert(Math.abs(bounds.y - imageBounds.y - 80 * scale) < 1, 'Android status bar is not cropped')
  assert(Math.abs(imageBounds.y + imageBounds.height - bounds.y - bounds.height - 111 * scale) < 1, 'Android navigation is not cropped')
  assert.equal(await page.locator('.app-screenshot a, a.app-screenshot, .showcase-fullsize').count(), 0)
  assert(bounds.x >= 0 && bounds.x + bounds.width <= (await page.viewportSize()).width, 'Screenshot exceeds page width')
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow')
  await page.screenshot({ path: `${out}/app-${name}-${screens[index]}.png` })
}

try {
  for (const [name, width, height, reduced] of [
    ['desktop', 1440, 900, false], ['mobile', 390, 844, false],
    ['small', 320, 740, false], ['tablet', 768, 1024, false],
    ['landscape', 844, 390, false], ['reduced', 1440, 900, true],
  ]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('response', (response) => {
      if (response.url().includes('/assets/app/') && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
    })
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.locator('.preloader').waitFor({ state: 'detached' })
    const pinned = await page.locator('.showcase-sequence').count() > 0
    if (pinned) await scrollToScreen(page, 0)
    else await page.locator('.showcase-image-panel').evaluate((el) => {
      window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 90, behavior: 'instant' })
    })
    await page.waitForFunction(() => [...document.querySelectorAll('#showcase img')].every((img) => img.complete && img.naturalWidth > 0))
    for (let index = 0; index < screens.length; index++) {
      if (pinned) await scrollToScreen(page, index)
      else if (index > 0) await page.getByRole('button', { name: 'Next app screen' }).click()
      await verifyScreen(page, index, name)
      if (pinned) {
        const image = await page.locator('.app-screenshot').boundingBox()
        assert(image.y > 66 && image.y + image.height < height - 24, 'Pinned image does not fit below the nav')
      }
    }
    if (pinned) {
      await scrollToScreen(page, 0)
      await verifyScreen(page, 0, `${name}-reverse`)
      await page.getByRole('button', { name: 'Previous app screen' }).click()
      await verifyScreen(page, 4, `${name}-previous-wrap`)
    }
    await page.getByRole('button', { name: 'Next app screen' }).click()
    await verifyScreen(page, 0, `${name}-next-wrap`)
    await page.getByRole('button', { name: 'Previous app screen' }).focus()
    await page.keyboard.press('Enter')
    await verifyScreen(page, 4, `${name}-keyboard-previous`)
    await page.keyboard.press('Tab')
    await page.keyboard.press('Space')
    await verifyScreen(page, 0, `${name}-keyboard-next`)
    assert.deepEqual(errors, [])
    console.log(`${name}: all five screenshots, navigation, system-bar crops, and assets PASS`)
    await context.close()
  }
} finally { await browser.close() }
