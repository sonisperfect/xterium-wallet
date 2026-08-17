/* Verify the dot-matrix fade: sample canvas alpha distribution over time */
const puppeteer = require('puppeteer-core')

async function sample(page) {
  return page.evaluate(() => {
    const c = document.querySelector('#top canvas[role="img"]')
    const x = c.getContext('2d')
    const d = x.getImageData(0, 0, c.width, c.height).data
    let lit = 0, dim = 0, mid = 0
    for (let p = 3; p < d.length; p += 4) {
      const a = d[p]
      if (a > 200) lit++
      else if (a > 60) mid++
      else if (a > 12) dim++
    }
    return { lit, mid, dim }
  })
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
  })
  const page = await browser.newPage()
  await page.goto('http://localhost:7211/', { waitUntil: 'networkidle2', timeout: 45000 })
  await new Promise((r) => setTimeout(r, 4000)) // reveal wave finished
  const s1 = await sample(page)
  await page.screenshot({ path: __dirname + '/shots-dev/dotfade-t1.png' })
  await new Promise((r) => setTimeout(r, 5000))
  const s2 = await sample(page)
  await page.screenshot({ path: __dirname + '/shots-dev/dotfade-t2.png' })
  await new Promise((r) => setTimeout(r, 6000))
  const s3 = await sample(page)
  await page.screenshot({ path: __dirname + '/shots-dev/dotfade-t3.png' })
  console.log('t=4s :', JSON.stringify(s1))
  console.log('t=9s :', JSON.stringify(s2))
  console.log('t=15s:', JSON.stringify(s3))
  await browser.close()
}
main().catch((e) => { console.error(e); process.exit(1) })
