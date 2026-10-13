/**
 * Enquadra a tapioca doce no mesmo molde das outras tapiocas (498×424):
 * fundo borrado da referência + foto real do WhatsApp, sem IA.
 * Uso: node scripts/reframe-tapioca-frutas-chocolate.js
 */
const path = require('path');
const Jimp = require('jimp');

const ROOT = path.resolve(__dirname, '..');
const FOTOS = path.join(ROOT, 'assets/fotos');
const SOURCE = path.join(
  ROOT,
  'assets/referencias/originais-usuario/whatsapp-2026-10-06/WhatsApp Image 2026-10-06 at 18.06.51.jpeg',
);
const REFERENCE = path.join(FOTOS, 'carne-sol-coalho.jpg');
const OUT = path.join(FOTOS, 'tapioca-frutas-chocolate.jpg');

const CARD_W = 498;
const CARD_H = 424;
const OUT_W = 1600;
const OUT_H = 1200;

/** Recorte do prato na foto original (1200×1600). */
const DISH_CROP = { x: 75, y: 495, w: 1050, h: 930 };
/** Escala e deslocamento para centralizar a tapioca como nas outras. */
const DISH_MAX_W = 458;
const DISH_MAX_H = 388;
const OFFSET_X = 36;
const OFFSET_Y = 48;

async function main() {
  let bg = await Jimp.read(REFERENCE);
  bg.resize(CARD_W, CARD_H).blur(28).brightness(-0.14);

  let dish = await Jimp.read(SOURCE);
  dish.crop(DISH_CROP.x, DISH_CROP.y, DISH_CROP.w, DISH_CROP.h);
  dish.scaleToFit(DISH_MAX_W, DISH_MAX_H);

  const x = Math.round((CARD_W - dish.bitmap.width) / 2 + OFFSET_X);
  const y = Math.round((CARD_H - dish.bitmap.height) / 2 + OFFSET_Y);
  bg.composite(dish, x, y);

  const full = bg.clone().cover(OUT_W, OUT_H);
  await full.quality(88).writeAsync(OUT);
  console.log('ok', OUT, `${OUT_W}x${OUT_H}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
