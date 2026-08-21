/**
 * Gera miniaturas JPEG para o PDF (evita PDF gigante com fotos IA em resolução cheia).
 * Saída: online/assets/fotos-pdf/{id}.jpg
 */
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets/fotos');
const OUT = path.join(ROOT, 'online/assets/fotos-pdf');
const SIZE = 320;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
  let ok = 0;

  for (const file of files) {
    const srcPath = path.join(SRC, file);
    const outName = file.replace(/\.(png|jpeg)$/i, '.jpg');
    const outPath = path.join(OUT, outName);
    try {
      const img = await Jimp.read(srcPath);
      img.cover(SIZE, SIZE).quality(82);
      await img.writeAsync(outPath);
      ok += 1;
    } catch (e) {
      console.warn('skip', file, e.message);
    }
  }

  console.log(`fotos-pdf: ${ok}/${files.length} em ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
