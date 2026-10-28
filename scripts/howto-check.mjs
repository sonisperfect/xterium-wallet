import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const base = process.env.HERO_URL ?? 'http://127.0.0.1:7212/'
const out = 'scripts/shots-dev'
const parts = [
  ['install', 'Install', 'Install the extension'], ['setup', 'Set up', 'Set up your wallet'],
  ['portfolio', 'Portfolio', 'View your portfolio'], ['connect', 'Connect & sign', 'Connect to a dApp and sign'],
  ['accounts', 'Accounts', 'Use multiple accounts'], ['security', 'Security', 'Security tips'],
]
const footerLinks = ['install', 'setup', 'connect', 'accounts', 'security']
const STEPS = 9
const SHOTS = 16
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })

const url = (path) => new URL(path, base).href
const tabsBottom = (page) => page.locator('.policy-tabs').evaluate((el) => el.getBoundingClientRect().bottom)

// A landed-on section or step sits at the top, its heading clear of the sticky tabs.
async function landedOn(page, id, name) {
  // (a move within the page is smooth: wait for it to settle at the target's scroll margin)
  await page.waitForFunction((target) => {
    const el = document.getElementById(target)
    return el && Math.abs(el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop)) < 4
  }, id, { timeout: 8000 }).catch(() => {})
  const top = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top)
  const heading = await page.locator(`#${id} :is(h2, h3)`).first().evaluate((el) => el.getBoundingClientRect().top)
  assert(top > -2 && top < 110 && heading >= await tabsBottom(page), `${name}: did not land on #${id} (top ${top}, heading ${heading})`)
}

try {
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: width < 640, hasTouch: width < 640 })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))

    // a direct load doesn't wait on a hero this page doesn't have
    const start = Date.now()
    await page.goto(url('/how-to'), { waitUntil: 'domcontentloaded' })
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 10000 })
    assert(Date.now() - start < 3000, `${name}: preloader held a page with no hero`)
    assert.equal(await page.title(), 'How to Use Xterium — Xterium Wallet')
    assert.equal(await page.locator('h1').innerText(), 'How to use Xterium')

    // every part on the page, in order, each with a tab to it; all the steps under them
    assert.deepEqual(await page.locator('.policy-section h2').allInnerTexts(), parts.map(([, , title]) => title))
    assert.deepEqual(await page.locator('.policy-tabs a').evaluateAll((links) => links.map((a) => [a.getAttribute('href'), a.textContent])),
      parts.map(([id, tab]) => [`#${id}`, tab]))
    assert.equal(await page.locator('.policy-tabs a[aria-current]').getAttribute('href'), '#install')
    assert.deepEqual(await page.locator('.howto-step').evaluateAll((steps) => steps.map((s) => s.id)),
      Array.from({ length: STEPS }, (_, i) => `step-${i + 1}`))
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: horizontal overflow`)
    await page.screenshot({ path: `${out}/howto-${name}.png` })

    // every screenshot loads, numbered in order, and fits the column; the walkthrough video is playable
    assert.equal(await page.locator('.howto-shot').count(), SHOTS)
    for (const shot of await page.locator('.howto-shot img').all()) {
      await shot.scrollIntoViewIfNeeded()
      await shot.evaluate((img) => img.decode())
    }
    const shots = await page.locator('.howto-shot').evaluateAll((figures) => figures.map((figure) => {
      const img = figure.querySelector('img')
      return { caption: figure.querySelector('figcaption').textContent, loaded: img.naturalWidth > 0, width: img.getBoundingClientRect().width }
    }))
    shots.forEach(({ caption, loaded, width: shown }, i) => {
      assert(caption.startsWith(`Image ${i + 1} · `), `${name}: screenshot ${i + 1} captioned "${caption}"`)
      assert(loaded, `${name}: screenshot ${i + 1} did not load`)
      assert(shown <= 341, `${name}: screenshot ${i + 1} is ${shown}px wide`)
    })
    const video = page.locator('.howto-video video')
    await video.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => document.querySelector('.howto-video video').readyState >= 1, null, { timeout: 8000 })
    assert(Math.abs(await video.evaluate((v) => v.duration) - 52.7) < 1, `${name}: walkthrough video is the wrong length`)

    // a tab scrolls to its part, clear of the sticky tabs, and becomes the current one
    await page.locator('.policy-tabs a[href="#connect"]').click()
    await landedOn(page, 'connect', `${name} tab`)
    await page.waitForTimeout(300)
    assert.equal(await page.locator('.policy-tabs a[aria-current]').getAttribute('href'), '#connect', `${name}: tab not marked current`)
    assert(await page.locator('.policy-tabs').evaluate((el) => el.getBoundingClientRect().top) <= 1, `${name}: tabs did not stick`)

    // the tables fit their boxes at every width — no column hidden off to the side
    for (const table of await page.locator('.policy-table-wrap').all()) {
      await table.scrollIntoViewIfNeeded()
      assert(await table.evaluate((box) => box.scrollWidth <= box.clientWidth + 1), `${name}: table hides a column`)
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: table widened the page`)
    await page.screenshot({ path: `${out}/howto-${name}-connect.png` })

    // reading on to the end moves the current tab with you, and keeps it in view in the tab row
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
    await page.waitForTimeout(500)
    const current = page.locator('.policy-tabs a[aria-current]')
    assert.equal(await current.getAttribute('href'), '#security', `${name}: current tab did not follow the reader`)
    const inRow = await current.evaluate((tab) => {
      const row = tab.closest('ul').getBoundingClientRect()
      const box = tab.getBoundingClientRect()
      return box.left >= row.left - 1 && box.right <= row.right + 1
    })
    assert(inRow, `${name}: current tab scrolled out of the tab row`)

    // a link straight to a part, or to a step, lands on it
    await page.goto(url('/how-to#setup'), { waitUntil: 'domcontentloaded' })
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 10000 })
    await landedOn(page, 'setup', `${name} direct #setup`)
    await page.goto(url('/how-to#step-5'), { waitUntil: 'domcontentloaded' })
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 10000 })
    await landedOn(page, 'step-5', `${name} direct #step-5`)

    // from the home page's footer: the How to menu links to each part
    await page.goto(url('/'), { waitUntil: 'networkidle' })
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 10000 })
    const menu = page.getByRole('contentinfo').getByRole('navigation', { name: 'How to' })
    assert.deepEqual(await menu.getByRole('link').evaluateAll((links) => links.map((a) => a.getAttribute('href'))),
      footerLinks.map((id) => `/how-to#${id}`))
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)
    await page.getByRole('contentinfo').screenshot({ path: `${out}/howto-${name}-footer.png` })
    await menu.getByRole('link', { name: 'Connect to a dApp' }).click()
    await page.waitForURL(/\/how-to#connect$/)
    await landedOn(page, 'connect', `${name} footer link`)

    // and the menu works from the guide itself: a smooth move within the page
    await page.getByRole('contentinfo').getByRole('navigation', { name: 'How to' }).getByRole('link', { name: 'Install the extension' }).click()
    await page.waitForURL(/\/how-to#install$/)
    await landedOn(page, 'install', `${name} footer link on the guide`)

    // leaving for another page starts it at the top
    await page.getByRole('link', { name: '← Back to Xterium' }).click()
    await page.waitForURL((current) => current.pathname === '/')
    await page.waitForTimeout(400)
    assert.equal(await page.evaluate(() => window.scrollY), 0, `${name}: home did not open at the top`)

    assert.deepEqual(errors, [], `${name}: browser errors`)
    console.log(`${name}: how-to guide, tabs, screenshots, video, anchors, footer menu, and landing scroll PASS`)
    await context.close()
  }
} finally { await browser.close() }
