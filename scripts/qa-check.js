/**
 * Checklist automatizado (Gate G4) — preços, fotos, JSON.
 * Uso: npm run qa-check
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const menu = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/menu-data.json'), 'utf8'));
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/images-meta.json'), 'utf8'));
const fotosDir = path.join(ROOT, 'assets/fotos');
const fotosPdfDir = path.join(ROOT, 'online/assets/fotos-pdf');

let errors = 0;
let warnings = 0;

function err(msg) {
  console.error('ERRO:', msg);
  errors += 1;
}
function warn(msg) {
  console.warn('AVISO:', msg);
  warnings += 1;
}
function ok(msg) {
  console.log('OK:', msg);
}

const items = menu.categories.flatMap((c) => c.items || []);
const ids = new Set();

for (const cat of menu.categories) {
  if (cat.itemRefs?.length) {
    for (const refId of cat.itemRefs) {
      if (!items.find((i) => i.id === refId)) {
        err(`itemRef inválido em ${cat.id}: ${refId}`);
      }
    }
  }
}

for (const item of items) {
  if (ids.has(item.id)) err(`id duplicado: ${item.id}`);
  ids.add(item.id);
  if (item.portionOptions?.length) {
    for (const opt of item.portionOptions) {
      if (typeof opt.price !== 'number') err(`${item.id}: portionOptions price inválido (${opt.key})`);
    }
  } else if (typeof item.price !== 'number') {
    err(`${item.id}: price inválido`);
  }
  const file = item.image || `${item.id}.jpg`;
  const fotoPath = path.join(fotosDir, file);
  if (!fs.existsSync(fotoPath)) err(`foto ausente: assets/fotos/${file} (${item.id})`);
  const pdfThumb = path.join(fotosPdfDir, file);
  if (!fs.existsSync(pdfThumb)) warn(`miniatura PDF ausente: online/assets/fotos-pdf/${file}`);
}

if (meta.missingCount > 0) {
  err(`images-meta: ${meta.missingCount} fotos faltando`);
} else {
  ok(`images-meta: ${items.length} itens, missingCount 0`);
}

ok(`${items.length} itens em ${menu.categories.length} categorias`);

const onlinePdf = path.join(ROOT, 'online/cardapio-prainha-rooftop.pdf');
if (!fs.existsSync(onlinePdf)) warn('online/cardapio-prainha-rooftop.pdf não encontrado — rode npm run generate-pdf');
else {
  const mb = (fs.statSync(onlinePdf).size / (1024 * 1024)).toFixed(2);
  ok(`PDF do site: ${mb} MB`);
}

console.log('---');
console.log(`Resultado: ${errors} erro(s), ${warnings} aviso(s)`);
process.exit(errors > 0 ? 1 : 0);
