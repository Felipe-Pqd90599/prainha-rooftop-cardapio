const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = [
  ['data/menu-data.json', 'online/data/menu-data.json'],
  ['data/restaurant-info.json', 'online/data/restaurant-info.json'],
  ['design/design-tokens.json', 'online/data/design-tokens.json'],
  ['data/images-meta.json', 'online/data/images-meta.json'],
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    fs.copyFileSync(path.join(src, name), path.join(dest, name));
  }
  console.log('copied dir', path.basename(src));
}

for (const [src, dest] of files) {
  fs.mkdirSync(path.dirname(path.join(root, dest)), { recursive: true });
  fs.copyFileSync(path.join(root, src), path.join(root, dest));
  console.log('copied', dest);
}

copyDir(path.join(root, 'assets/fotos'), path.join(root, 'online/assets/fotos'));

require('./update-readme.js');
