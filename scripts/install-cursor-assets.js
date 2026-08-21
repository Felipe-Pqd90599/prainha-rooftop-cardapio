const fs = require('fs');
const path = require('path');

const cursorAssets = path.join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Felipe-pagina-pessoal/assets'
);
const dest1 = path.join(__dirname, '../assets/fotos');
const dest2 = path.join(__dirname, '../online/assets/fotos');

if (!fs.existsSync(cursorAssets)) {
  console.error('Cursor assets folder not found:', cursorAssets);
  process.exit(1);
}

fs.mkdirSync(dest1, { recursive: true });
fs.mkdirSync(dest2, { recursive: true });

let n = 0;
for (const name of fs.readdirSync(cursorAssets)) {
  if (!name.endsWith('.jpg') && !name.endsWith('.png')) continue;
  fs.copyFileSync(path.join(cursorAssets, name), path.join(dest1, name));
  fs.copyFileSync(path.join(cursorAssets, name), path.join(dest2, name));
  n++;
}
console.log('installed', n, 'files from cursor assets');
