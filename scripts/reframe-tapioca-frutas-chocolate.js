/**
 * Recorta a foto original (WhatsApp) no mesmo 4:3 das outras tapiocas,
 * com a tapioca no centro do quadro. Sem IA e sem colagem.
 * Uso: node scripts/reframe-tapioca-frutas-chocolate.js
 */
const path = require('path');
const Jimp = require('jimp');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(
  ROOT,
  'assets/referencias/originais-usuario/whatsapp-2026-10-06/WhatsApp Image 2026-10-06 at 18.06.51.jpeg',
);
const OUT = path.join(ROOT, 'assets/fotos/tapioca-frutas-chocolate.jpg');

const OUT_W = 1600;
const OUT_H = 1200;

/**
 * Original 1200×1600. Tapioca ~x 40–850, y 500–980.
 * Recorte 4:3 centrado nela, no mesmo peso visual de carne-sol / filezinhos.
 */
const CROP = { x: 0, y: 400, w: 1040, h: 780 };

async function main() {
  let img = await Jimp.read(SOURCE);
  img.crop(CROP.x, CROP.y, CROP.w, CROP.h);
  img.cover(OUT_W, OUT_H);
  await img.quality(88).writeAsync(OUT);
  console.log('ok', OUT, `${OUT_W}x${OUT_H}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
