import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const base = process.env.HERO_URL ?? 'http://127.0.0.1:7212/'
const out = 'scripts/shots-dev'
const policies = [
  ['privacy', 'Privacy Policy'], ['terms', 'Terms of Service'],
  ['cookies', 'Cookie Policy'], ['copyright', 'Copyright Policy'],
]
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })

const url = (path) => new URL(path, base).href
// A landed-on section sits at the top, clear of the sticky tabs.
const sectionTop = (page, id) => page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top)
const tabsBottom = (page) => page.locator('.policy-tabs').evaluate((el) => el.getBoundingClientRect().bottom)

async function landedOn(page, id, name) {
  await page.waitForFunction((target) => {
    const top = document.getElementById(target)?.getBoundingClientRect().top ?? Infinity
    return Math.abs(top - 64) < 40
  }, id, { timeout: 5000 }).catch(() => {})
  const top = await sectionTop(page, id)
  const heading = await page.locator(`#${id}-title`).evaluate((el) => el.getBoundingClientRect().top)
  assert(top > -2 && top < 110 && heading >= await tabsBottom(page), `${name}: did not land on #${id} (section top ${top}, heading ${heading})`)
}

try {
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: width < 640, hasTouch: width < 640 })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))

    // a direct load doesn't wait on a hero this page doesn't have
    const start = Date.now()
    await page.goto(url('/policy'), { waitUntil: 'domcontentloaded' })
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 10000 })
    assert(Date.now() - start < 3000, `${name}: preloader held a page with no hero`)
    assert.equal(await page.title(), 'Legal & Policies — Xterium Wallet')
    assert.equal(await page.locator('h1').innerText(), 'Legal & Policies')

    // all four policies on the page, in order, each with a tab to it
    assert.deepEqual(await page.locator('.policy-section h2').allInnerTexts(), policies.map(([, title]) => title))
    assert.deepEqual(await page.locator('.policy-tabs a').evaluateAll((links) => links.map((a) => a.getAttribute('href'))),
      policies.map(([id]) => `#${id}`))
    assert.equal(await page.locator('.policy-tabs a[aria-current]').getAttribute('href'), '#privacy')
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: horizontal overflow`)
    await page.screenshot({ path: `${out}/policy-${name}.png` })

    // a tab scrolls to its policy, clear of the sticky tabs, and becomes the current one
    await page.locator('.policy-tabs a[href="#terms"]').click()
    await landedOn(page, 'terms', `${name} tab`)
    await page.waitForTimeout(300)
    assert.equal(await page.locator('.policy-tabs a[aria-current]').getAttribute('href'), '#terms', `${name}: tab not marked current`)
    assert(await page.locator('.policy-tabs').evaluate((el) => el.getBoundingClientRect().top) <= 1, `${name}: tabs did not stick`)

    // the licence table fits its box at every width — no column hidden off to the side
    await page.locator('.policy-table-wrap').scrollIntoViewIfNeeded()
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: table widened the page`)
    assert(await page.locator('.policy-table-wrap').evaluate((box) => box.scrollWidth <= box.clientWidth + 1), `${name}: table hides a column`)
    // reading further down moves the current tab with you, and keeps it in view in the tab row
    await page.waitForTimeout(500)
    const current = page.locator('.policy-tabs a[aria-current]')
    assert.equal(await current.getAttribute('href'), '#copyright', `${name}: current tab did not follow the reader`)
    const inRow = await current.evaluate((tab) => {
      const row = tab.closest('ul').getBoundingClientRect()
      const box = tab.getBoundingClientRect()
      return box.left >= row.left - 1 && box.right <= row.right + 1
    })
    assert(inRow, `${name}: current tab scrolled out of the tab row`)
    await page.screenshot({ path: `${out}/policy-${name}-copyright.png` })

    // a link straight to a policy lands on it
    await page.goto(url('/policy#cookies'), { waitUntil: 'domcontentloaded' })
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 10000 })
    await landedOn(page, 'cookies', `${name} direct #cookies`)

    // the old address redirects to the privacy policy on the new page
    for (const old of ['/privacy', '/privacy-policy']) {
      await page.goto(url(old), { waitUntil: 'domcontentloaded' })
      await page.locator('.preloader').waitFor({ state: 'detached', timeout: 10000 })
      await page.waitForURL(/\/policy#privacy$/)
      await landedOn(page, 'privacy', `${name} ${old}`)
    }

    // from the home page's footer: each policy link opens its section
    await page.goto(url('/'), { waitUntil: 'networkidle' })
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 10000 })
    const legal = page.getByRole('navigation', { name: 'Legal' })
    assert.deepEqual(await legal.getByRole('link').evaluateAll((links) => links.map((a) => a.getAttribute('href'))),
      policies.map(([id]) => `/policy#${id}`))
    await legal.getByRole('link', { name: 'Copyright Policy' }).click()
    await page.waitForURL(/\/policy#copyright$/)
    await landedOn(page, 'copyright', `${name} footer link`)

    // and back: the footer's home-page links work from here too
    await page.getByRole('contentinfo').getByRole('link', { name: 'Download' }).click()
    await page.waitForURL((current) => current.pathname === '/' && current.hash === '#download')
    // (the home page may not have rendered on the first poll)
    await page.waitForFunction(() => Math.abs(document.getElementById('download')?.getBoundingClientRect().top ?? Infinity) < 80, null, { timeout: 8000 })

    // leaving for another page starts it at the top
    await page.getByRole('navigation', { name: 'Legal' }).getByRole('link', { name: 'Terms of Service' }).click()
    await page.waitForURL(/\/policy#terms$/)
    await page.getByRole('link', { name: '← Back to Xterium' }).click()
    await page.waitForURL((current) => current.pathname === '/')
    await page.waitForTimeout(400)
    assert.equal(await page.evaluate(() => window.scrollY), 0, `${name}: home did not open at the top`)

    assert.deepEqual(errors, [], `${name}: browser errors`)
    console.log(`${name}: one-page policies, tabs, anchors, redirects, footer links, and landing scroll PASS`)
    await context.close()
  }
} finally { await browser.close() }
