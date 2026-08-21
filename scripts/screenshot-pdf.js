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
if (!executablePath) {
  console.error('Chrome/Edge not found');
  process.exit(1);
}

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
  await page.setViewport({ width: 1200, height: 1600 });
  await page.goto(`file://${pdfPath}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({
    path: path.join(outDir, 'pdf-view.png'),
    fullPage: true,
  });
  await browser.close();
  console.log('saved pdf-view.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
