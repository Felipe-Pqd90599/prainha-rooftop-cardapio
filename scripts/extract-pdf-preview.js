const fs = require('fs');
const path = require('path');
const Canvas = require('canvas');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
  'pdfjs-dist/legacy/build/pdf.worker.js'
);

const pdfPath = path.join(
  __dirname,
  '../assets/referencias/cardapio-2025-atualizado.pdf'
);
const outDir = path.join(__dirname, '../assets/referencias/pages');

class NodeCanvasFactory {
  create(width, height) {
    const canvas = Canvas.createCanvas(width, height);
    const context = canvas.getContext('2d');
    return { canvas, context };
  }

  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  for (let pageNum = 1; pageNum <= Math.min(doc.numPages, 3); pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvasFactory = new NodeCanvasFactory();
    const canvasAndContext = canvasFactory.create(
      viewport.width,
      viewport.height
    );
    await page.render({
      canvasContext: canvasAndContext.context,
      viewport,
      canvasFactory,
    }).promise;
    const out = path.join(outDir, `page-${pageNum}.png`);
    fs.writeFileSync(out, canvasAndContext.canvas.toBuffer('image/png'));
    console.log('saved', out);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
