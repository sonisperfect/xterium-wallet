/* Interactive check: mouse-reactive dot field + headline pulse wave */
const puppeteer = require('puppeteer-core')

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
  })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
  await page.goto('http://localhost:7211/', { waitUntil: 'networkidle2', timeout: 45000 })
  await new Promise((r) => setTimeout(r, 3500))

  // move cursor over the hero's left-center (dot field area)
  await page.mouse.move(400, 420, { steps: 12 })
  await new Promise((r) => setTimeout(r, 900))
  await page.screenshot({ path: __dirname + '/shots-dev/stim-mouse.png' })

  // catch a pulse wave crossing the headline (waves fire every ~4-9s)
  await page.mouse.move(-50, -50)
  for (let i = 0; i < 5; i++) {
    await new Promise((r) => setTimeout(r, 1400))
    await page.screenshot({ path: `${__dirname}/shots-dev/wave-${i}.png` })
  }
  console.log('errors:', errors.length ? errors.join('\n') : 'none')
  await browser.close()
}
main().catch((e) => { console.error(e); process.exit(1) })
