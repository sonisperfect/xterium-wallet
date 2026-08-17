/* Live visual check against the deployed Pages site */
const puppeteer = require('puppeteer-core')

const EXEC = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = 'http://localhost:7211/'
const OUT = __dirname + '/shots-dev'

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

  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 2500))
  await page.screenshot({ path: OUT + '/hero.png' })

  const sections = ['#features', '#security', '#download']
  for (const sel of sections) {
    const ok = await page.evaluate((s) => {
      const el = document.querySelector(s)
      if (!el) return false
      el.scrollIntoView({ behavior: 'instant', block: 'start' })
      return true
    }, sel)
    await new Promise((r) => setTimeout(r, 1200))
    if (ok) await page.screenshot({ path: OUT + '/' + sel.slice(1) + '.png' })
    else errors.push('MISSING SECTION: ' + sel)
  }

  // swap feature image close-up
  const swap = await page.evaluate(() => {
    const img = document.querySelector('img[src*="feature-swaps"]')
    if (!img) return false
    img.scrollIntoView({ behavior: 'instant', block: 'center' })
    return true
  })
  await new Promise((r) => setTimeout(r, 900))
  if (swap) await page.screenshot({ path: OUT + '/swap-feature.png' })

  // footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await new Promise((r) => setTimeout(r, 1000))
  await page.screenshot({ path: OUT + '/footer.png' })

  // social links present?
  const socials = await page.evaluate(() =>
    Array.from(document.querySelectorAll('footer a[href]')).map((a) => a.href).filter((h) => h.startsWith('http'))
  )
  console.log('footer links:', JSON.stringify(socials))
  console.log('errors:', errors.length ? errors.join('\n') : 'none')
  await browser.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
