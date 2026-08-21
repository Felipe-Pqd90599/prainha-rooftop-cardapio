const fs = require('fs');
const path = require('path');
const map = require('../data/pdf-image-map');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'assets/referencias/extracted-jpegs');
const fotosDir = path.join(root, 'assets/fotos');
const onlineFotos = path.join(root, 'online/assets/fotos');

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  console.log('copied', path.basename(dest));
}

function main() {
  ensureDir(fotosDir);
  ensureDir(onlineFotos);

  if (map._hero) {
    copyFile(
      path.join(srcDir, map._hero.src),
      path.join(fotosDir, map._hero.dest)
    );
    copyFile(
      path.join(srcDir, map._hero.src),
      path.join(onlineFotos, map._hero.dest)
    );
  }

  const menu = JSON.parse(
    fs.readFileSync(path.join(root, 'data/menu-data.json'), 'utf8')
  );
  const allIds = new Set();
  menu.categories.forEach((cat) =>
    cat.items.forEach((item) => {
      allIds.add(item.id);
      item.image = `${item.id}.jpg`;
    })
  );

  const fromPdf = new Set();
  const imageMeta = { fromPdf: {}, generated: [] };

  map.mappings.forEach(({ src, itemId, note }) => {
    const srcPath = path.join(srcDir, src);
    if (!fs.existsSync(srcPath)) {
      console.warn('missing', src);
      return;
    }
    const filename = `${itemId}.jpg`;
    copyFile(srcPath, path.join(fotosDir, filename));
    copyFile(srcPath, path.join(onlineFotos, filename));
    fromPdf[itemId] = { source: src, note };
    fs.writeFileSync(
      path.join(root, 'data/menu-data.json'),
      JSON.stringify(menu, null, 2) + '\n'
    );
  });

  map.mappings.forEach((m) => fromPdf[m.itemId] = { source: m.src, note: m.note });

  const missing = [...allIds].filter(
    (id) => !fs.existsSync(path.join(fotosDir, `${id}.jpg`))
  );

  fs.writeFileSync(
    path.join(root, 'data/images-meta.json'),
    JSON.stringify(
      {
        convention: 'assets/fotos/{item.id}.jpg — substituir arquivo mantém id',
        fromPdf: fromPdf,
        missingCount: missing.length,
        missing,
      },
      null,
      2
    ) + '\n'
  );

  console.log('missing images:', missing.length);
  missing.forEach((id) => console.log(' -', id));
}

main();
