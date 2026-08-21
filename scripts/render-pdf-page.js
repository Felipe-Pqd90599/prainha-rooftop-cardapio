const fs = require('fs');
const path = require('path');
const Canvas = require('canvas');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
  'pdfjs-dist/legacy/build/pdf.worker.js'
);

class NodeCanvasFactory {
  create(w, h) {
    const canvas = Canvas.createCanvas(w, h);
    return { canvas, context: canvas.getContext('2d') };
  }
  reset(ctx, w, h) {
    ctx.canvas.width = w;
    ctx.canvas.height = h;
  }
  destroy(ctx) {
    ctx.canvas.width = 0;
    ctx.canvas.height = 0;
  }
}

async function renderPage(pageNum, scale, outName) {
  const pdfPath = path.join(
    __dirname,
    '../assets/referencias/cardapio-2025-atualizado.pdf'
  );
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const factory = new NodeCanvasFactory();
  const canvasAndContext = factory.create(viewport.width, viewport.height);
  await page.render({
    canvasContext: canvasAndContext.context,
    viewport,
    canvasFactory: factory,
  }).promise;
  const out = path.join(__dirname, '../assets/referencias/pages', outName);
  fs.writeFileSync(out, canvasAndContext.canvas.toBuffer('image/png'));
  console.log('ok', out, viewport.width, viewport.height);
  return { width: viewport.width, height: viewport.height, out };
}

async function main() {
  await renderPage(2, 2.5, 'page-2-full.png');
}

main().catch(console.error);
