const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const edgePaths = [
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

async function main() {
  const executablePath = edgePaths.find((p) => fs.existsSync(p));
  if (!executablePath) throw new Error('Chrome/Edge não encontrado');

  const htmlPath = path.resolve(__dirname, '../online/print.html');
  const outDir = path.resolve(__dirname, '../output');
  fs.mkdirSync(outDir, { recursive: true });
  const outPdf = path.join(outDir, 'cardapio-prainha-rooftop.pdf');

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--allow-file-access-from-files'],
  });
  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
    waitUntil: 'networkidle0',
    timeout: 120000,
  });
  await page.waitForTimeout(2000);
  await page.pdf({
    path: outPdf,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
  });
  await browser.close();
  console.log('PDF gerado:', outPdf);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
