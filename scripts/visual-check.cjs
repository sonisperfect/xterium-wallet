/* Headless visual check: hero dot-matrix reveal + features dot assembly */
const puppeteer = require('puppeteer-core')

const EXEC = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = 'http://localhost:7207/'
const OUT = __dirname + '/shots'

async function main() {
  const fs = require('fs')
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await puppeteer.launch({
    executablePath: EXEC,
    headless: 'new',
    args: ['--window-size=1440,900', '--force-device-scale-factor=1'],
    defaultViewport: { width: 1440, height: 900 },
  })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()) })
  page.on('response', (r) => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ': ' + r.url()) })

  await page.goto(BASE, { waitUntil: 'load', timeout: 45000 })
  await page.waitForSelector('#features canvas', { timeout: 15000 })

  // hero: capture during the dot wave and after it settles
  await page.screenshot({ path: OUT + '/hero-t0.png' })
  await new Promise((r) => setTimeout(r, 700))
  await page.screenshot({ path: OUT + '/hero-t700.png' })
  await new Promise((r) => setTimeout(r, 1500))
  await page.screenshot({ path: OUT + '/hero-settled.png' })

  // features: scroll each tile into view so every observer fires, then settle
  await page.evaluate(() => {
    document.querySelector('#features').scrollIntoView({ behavior: 'instant', block: 'start' })
    window.scrollBy(0, 220)
  })
  await new Promise((r) => setTimeout(r, 400))
  await page.screenshot({ path: OUT + '/features-t0.png' })
  await new Promise((r) => setTimeout(r, 500))
  await page.screenshot({ path: OUT + '/features-mid.png' })
  await page.evaluate(() => window.scrollBy(0, 700))
  await new Promise((r) => setTimeout(r, 500))
  await page.evaluate(() => window.scrollBy(0, -700))
  await new Promise((r) => setTimeout(r, 1600))
  await page.screenshot({ path: OUT + '/features-settled.png' })
  await page.evaluate(() => window.scrollBy(0, 700))
  await new Promise((r) => setTimeout(r, 400))
  await page.screenshot({ path: OUT + '/features-row2.png' })

  // chain band
  await page.evaluate(() => window.scrollBy(0, -460))
  await new Promise((r) => setTimeout(r, 900))
  await page.screenshot({ path: OUT + '/chainband.png' })

  // footer with the live dot logo
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await new Promise((r) => setTimeout(r, 800))
  await page.screenshot({ path: OUT + '/footer.png' })

  // nav logo close-up
  await page.evaluate(() => window.scrollTo(0, 0))
  await new Promise((r) => setTimeout(r, 500))
  const nav = await page.$('header nav')
  if (nav) await nav.screenshot({ path: OUT + '/nav-logo.png' })

  // canvas pixel sanity: are the feature canvases non-empty?
  const stats = await page.evaluate(() => {
    const out = []
    document.querySelectorAll('#features canvas').forEach((c, i) => {
      const x = c.getContext('2d')
      const d = x.getImageData(0, 0, c.width, c.height).data
      let painted = 0
      for (let p = 3; p < d.length; p += 4) if (d[p] > 10) painted++
      out.push({ i, w: c.width, h: c.height, painted })
    })
    return out
  })
  console.log('canvas stats:', JSON.stringify(stats))
  console.log('errors:', errors.length ? errors.join('\n') : 'none')
  await browser.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
