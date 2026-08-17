const puppeteer = require('puppeteer-core')
async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
  })
  const page = await browser.newPage()
  await page.goto('http://localhost:7211/', { waitUntil: 'networkidle2', timeout: 45000 })
  for (const sel of ['#how-it-works', '#showcase']) {
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ behavior: 'instant' }), sel)
    await new Promise((r) => setTimeout(r, 1200))
    await page.screenshot({ path: __dirname + '/shots-dev/' + sel.slice(1) + '.png' })
  }
  await browser.close()
}
main().catch((e) => { console.error(e); process.exit(1) })
