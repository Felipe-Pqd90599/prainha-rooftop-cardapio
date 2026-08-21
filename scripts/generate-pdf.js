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
    protocolTimeout: 600000,
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(120000);
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });

  await page.waitForFunction(() => document.querySelectorAll('#menu .item').length >= 140, {
    timeout: 90000,
  });

  // Fotos carregam em paralelo no browser — aguarda sem evaluate longo
  console.log('Aguardando carregamento das fotos (45s)...');
  await new Promise((r) => setTimeout(r, 45000));

  const loaded = await page.evaluate(() => ({
    items: document.querySelectorAll('#menu .item').length,
    photos: document.querySelectorAll('.item__photo').length,
    loaded: Array.from(document.querySelectorAll('.item__photo')).filter(
      (img) => img.complete && img.naturalWidth > 0,
    ).length,
  }));
  console.log('Itens no PDF:', loaded);

  page.setDefaultTimeout(600000);
  await page.pdf({
    path: outPdf,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
  });
  await browser.close();

  const onlinePdf = path.join(path.resolve(__dirname, '../online'), 'cardapio-prainha-rooftop.pdf');
  fs.copyFileSync(outPdf, onlinePdf);
  console.log('PDF copiado para site:', onlinePdf);
  console.log('PDF gerado:', outPdf);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
