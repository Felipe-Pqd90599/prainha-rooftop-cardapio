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

stampCacheBusters();
require('./update-readme.js');

function stampCacheBusters() {
  const menuPath = path.join(root, 'data/menu-data.json');
  const menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
  const v = encodeURIComponent(menu.meta?.version || '1');
  const indexPath = path.join(root, 'online/index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html.replace(/href="styles\.css(?:\?v=[^"]*)?"/, `href="styles.css?v=${v}"`);
  html = html.replace(/src="app\.js(?:\?v=[^"]*)?"/, `src="app.js?v=${v}"`);
  fs.writeFileSync(indexPath, html);
  console.log('cache-bust index.html v=', menu.meta?.version);
}
