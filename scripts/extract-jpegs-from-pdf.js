const fs = require('fs');
const path = require('path');

const pdfPath = path.join(
  __dirname,
  '../assets/referencias/cardapio-2025-atualizado.pdf'
);
const outDir = path.join(__dirname, '../assets/referencias/extracted-jpegs');

function extractJpegs(buffer) {
  const images = [];
  let i = 0;
  while (i < buffer.length - 3) {
    if (buffer[i] === 0xff && buffer[i + 1] === 0xd8 && buffer[i + 2] === 0xff) {
      let j = i + 2;
      while (j < buffer.length - 1) {
        if (buffer[j] === 0xff && buffer[j + 1] === 0xd9) {
          j += 2;
          break;
        }
        j++;
      }
      const slice = buffer.slice(i, j);
      if (slice.length > 5000) images.push(slice);
      i = j;
    } else {
      i++;
    }
  }
  return images;
}

function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const buf = fs.readFileSync(pdfPath);
  const images = extractJpegs(buf);
  images.forEach((img, idx) => {
    const out = path.join(outDir, `embedded-${String(idx + 1).padStart(2, '0')}.jpg`);
    fs.writeFileSync(out, img);
    console.log(out, img.length);
  });
  console.log('total', images.length);
}

main();
