const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const menu = JSON.parse(fs.readFileSync(path.join(root, 'data/menu-data.json'), 'utf8'));
const metaPath = path.join(root, 'data/images-meta.json');
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const fotosDir = path.join(root, 'assets/fotos');

const allIds = [];
menu.categories.forEach((c) => {
  if (c.items) c.items.forEach((i) => allIds.push(i.id));
});

const missing = allIds.filter((id) => !fs.existsSync(path.join(fotosDir, `${id}.jpg`)));
meta.missing = missing;
meta.missingCount = missing.length;
meta.lastUpdated = new Date().toISOString().slice(0, 10);

fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
console.log('total items', allIds.length);
console.log('with image', allIds.length - missing.length);
console.log('missing', missing.length);
