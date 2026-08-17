/* Verify footer SNS icon links in the live page */
const puppeteer = require('puppeteer-core')

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
  })
  const page = await browser.newPage()
  await page.goto('http://localhost:7208/', { waitUntil: 'load', timeout: 45000 })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await new Promise((r) => setTimeout(r, 600))
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('footer a[aria-label]')).map((a) => ({
      label: a.getAttribute('aria-label'),
      href: a.href,
      target: a.target,
    })),
  )
  console.log(JSON.stringify(links, null, 2))
  await browser.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
