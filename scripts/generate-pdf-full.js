/**
 * Gera PDF em alta resolução (fotos originais) — arquivo grande (~400MB).
 * Uso local apenas; não commitar no GitHub.
 */
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

  const desktop = path.join(process.env.USERPROFILE || '', 'Desktop');
  const outDir = path.join(desktop, 'Prainha-Rooftop-Cardapio-PDF');
  fs.mkdirSync(outDir, { recursive: true });
  const outPdf = path.join(outDir, 'cardapio-prainha-rooftop-alta-resolucao.pdf');

  const htmlPath = path.resolve(__dirname, '../online/print.html');
  const coverFull = path.resolve(__dirname, '../online/assets/fotos/capa-prainha-rooftop.jpg');

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--allow-file-access-from-files'],
    protocolTimeout: 600000,
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(600000);

  await page.evaluateOnNewDocument(() => {
    window.PRINT_PHOTO_DIR = 'assets/fotos';
  });

  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });

  await page.evaluate((coverSrc) => {
    const cover = document.querySelector('.print-cover__img');
    if (cover) cover.src = coverSrc;
  }, `file:///${coverFull.replace(/\\/g, '/')}`);

  await page.waitForFunction(() => document.querySelectorAll('#menu .item').length >= 140, {
    timeout: 90000,
  });

  console.log('Aguardando carregamento das fotos em alta resolução (60s)...');
  await new Promise((r) => setTimeout(r, 60000));

  const loaded = await page.evaluate(() => ({
    items: document.querySelectorAll('#menu .item').length,
    photos: document.querySelectorAll('.item__photo').length,
    loaded: Array.from(document.querySelectorAll('.item__photo')).filter(
      (img) => img.complete && img.naturalWidth > 0,
    ).length,
  }));
  console.log('Itens no PDF:', loaded);

  await page.pdf({
    path: outPdf,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
  });
  await browser.close();

  const mb = (fs.statSync(outPdf).size / (1024 * 1024)).toFixed(2);
  console.log(`PDF alta resolução (${mb} MB):`, outPdf);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
