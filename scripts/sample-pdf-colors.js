const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
  'pdfjs-dist/legacy/build/pdf.worker.js'
);

const pdfPath = path.join(
  __dirname,
  '../assets/referencias/cardapio-2025-atualizado.pdf'
);

function rgbKey(r, g, b) {
  const to255 = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255);
  const rr = to255(r);
  const gg = to255(g);
  const bb = to255(b);
  return `#${rr.toString(16).padStart(2, '0')}${gg
    .toString(16)
    .padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`.toUpperCase();
}

async function main() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const colorCounts = new Map();

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    const { fnArray, argsArray } = ops;

    for (let i = 0; i < fnArray.length; i++) {
      const fn = fnArray[i];
      const args = argsArray[i];
      const name = pdfjsLib.OPS[fn];
      if (!name) continue;

      if (name === 'setFillRGBColor' && args?.length >= 3) {
        const key = rgbKey(args[0], args[1], args[2]);
        colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
      }
      if (name === 'setStrokeRGBColor' && args?.length >= 3) {
        const key = rgbKey(args[0], args[1], args[2]);
        colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
      }
    }
  }

  const sorted = [...colorCounts.entries()].sort((a, b) => b[1] - a[1]);
  console.log(JSON.stringify(sorted.slice(0, 25), null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
