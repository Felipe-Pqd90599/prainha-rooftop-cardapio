/**
 * Remove a logo branca sobreposta do céu em capa-prainha-rooftop.jpg
 * (uso pontual; não roda no build).
 */
const path = require('path');
const Jimp = require('jimp');

const capaPath = path.join(__dirname, '../assets/fotos/capa-prainha-rooftop.jpg');

function rgba(img, x, y) {
  return Jimp.intToRGBA(img.getPixelColor(x, y));
}

function isLogoPixel(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum > 168 && max - min < 48 && max > 155;
}

function blend(a, b, t) {
  return {
    r: Math.round(a.r * (1 - t) + b.r * t),
    g: Math.round(a.g * (1 - t) + b.g * t),
    b: Math.round(a.b * (1 - t) + b.b * t),
  };
}

function skyColor(img, x, y, box) {
  const w = img.bitmap.width;
  const t = (x - box.x0) / (box.x1 - box.x0);
  const leftX = 28 + (y % 23);
  const rightX = w - 29 - (y % 19);
  let c = blend(rgba(img, leftX, y), rgba(img, rightX, y), Math.min(1, Math.max(0, t)));
  const yRef = Math.max(8, box.y0 - 18 - Math.floor((y - box.y0) * 0.22));
  const refX = Math.min(w - 1, Math.max(0, x));
  const cref = rgba(img, refX, yRef);
  if (!isLogoPixel(cref.r, cref.g, cref.b)) {
    c = blend(c, cref, 0.28);
  }
  const n = ((x * 13 + y * 29) % 9) - 4;
  return {
    r: Math.min(255, Math.max(0, c.r + n)),
    g: Math.min(255, Math.max(0, c.g + n)),
    b: Math.min(255, Math.max(0, c.b + n)),
  };
}

async function main() {
  const img = await Jimp.read(capaPath);
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const box = { x0: 100, x1: w - 100, y0: 60, y1: Math.round(h * 0.44) };
  const mask = new Uint8Array(w * h);

  for (let y = box.y0; y <= box.y1; y++) {
    for (let x = box.x0; x <= box.x1; x++) {
      const { r, g, b } = rgba(img, x, y);
      if (isLogoPixel(r, g, b)) mask[y * w + x] = 1;
    }
  }

  for (let pass = 0; pass < 4; pass++) {
    const next = new Uint8Array(mask);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        if (!mask[y * w + x]) continue;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            next[(y + dy) * w + (x + dx)] = 1;
          }
        }
      }
    }
    mask.set(next);
  }

  const pad = 20;
  function featherWeight(x, y) {
    if (!mask[y * w + x]) return 0;
    let minD = pad + 1;
    for (let dy = -pad; dy <= pad; dy++) {
      for (let dx = -pad; dx <= pad; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
          minD = 0;
          continue;
        }
        if (!mask[ny * w + nx]) {
          const d = Math.hypot(dx, dy);
          if (d < minD) minD = d;
        }
      }
    }
    if (minD > pad) return 1;
    return Math.min(1, minD / pad);
  }

  for (let y = box.y0; y <= box.y1; y++) {
    for (let x = box.x0; x <= box.x1; x++) {
      const fw = featherWeight(x, y);
      if (fw < 0.04) continue;
      const sky = skyColor(img, x, y, box);
      const orig = rgba(img, x, y);
      const c = blend(orig, sky, Math.min(1, fw * 1.05));
      img.setPixelColor(Jimp.rgbaToInt(c.r, c.g, c.b, 255), x, y);
    }
  }

  await img.quality(92).writeAsync(capaPath);
  console.log('updated', capaPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
