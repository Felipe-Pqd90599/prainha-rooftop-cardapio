const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const edgePaths = [
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const executablePath = edgePaths.find((p) => fs.existsSync(p));
const pdfPath = path.resolve(
  __dirname,
  '../assets/referencias/cardapio-2025-atualizado.pdf'
);
const outDir = path.resolve(__dirname, '../assets/referencias/pages');

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--allow-file-access-from-files'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 2000 });

  for (let n = 1; n <= 4; n++) {
    await page.goto(`file://${pdfPath}#page=${n}`, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(outDir, `pdf-page-${n}.png`),
      fullPage: false,
    });
    console.log('page', n);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
