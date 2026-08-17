const puppeteer = require('puppeteer-core')
const fs = require('fs')

async function main() {
  const svg = fs.readFileSync(__dirname + '/xode-icon-pink.svg', 'utf8')
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 512, height: 512 })
  await page.setContent(
    '<body style="margin:0;background:transparent">' +
      svg.replace('<svg ', '<svg width="512" height="512" ') +
      '</body>',
  )
  await page.screenshot({ path: __dirname + '/xode-icon-pink.png', omitBackground: true })
  await browser.close()
  console.log('ok')
}

main().catch((e) => { console.error(e); process.exit(1) })
