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
const outDir = path.join(__dirname, '../assets/referencias/extracted');

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  let count = 0;

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    const { fnArray, argsArray } = ops;

    for (let i = 0; i < fnArray.length; i++) {
      const name = pdfjsLib.OPS[fnArray[i]];
      if (name !== 'paintImageXObject' && name !== 'paintJpegXObject') continue;
      const imgName = argsArray[i][0];
      const img = await page.objs.get(imgName);
      if (!img?.data) continue;
      const w = img.width;
      const h = img.height;
      const out = path.join(outDir, `page${p}-img${count}.raw`);
      fs.writeFileSync(out, Buffer.from(img.data));
      console.log(p, count, w, h, img.kind, out);
      count++;
    }
  }
}

main().catch(console.error);
