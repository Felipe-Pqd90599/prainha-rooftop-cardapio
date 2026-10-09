const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const pageIndex = Number(process.argv[2] || 9) - 1;
const outName = process.argv[3] || 'preview-tapiocas-pdf-teste.png';

const CHROME_PATHS = [
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

async function main() {
  const executablePath = CHROME_PATHS.find((p) => fs.existsSync(p));
  if (!executablePath) throw new Error('Chrome/Edge não encontrado');

  const htmlPath = path.join(ROOT, 'output/pdf-build/gastronomia.html');
  const outPath = path.join(ROOT, 'assets/referencias/pages', outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--allow-file-access-from-files'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
    waitUntil: 'networkidle0',
    timeout: 180000,
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const sheets = await page.$$('.sheet');
  if (pageIndex < 0 || pageIndex >= sheets.length) {
    throw new Error(`Página ${pageIndex + 1} inválida (${sheets.length} folhas)`);
  }
  await sheets[pageIndex].screenshot({ path: outPath, type: 'png' });
  await browser.close();
  console.log('saved', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
