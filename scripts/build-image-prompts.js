const fs = require('fs');
const path = require('path');

const STYLE =
  'Professional gourmet food photography for Prainha Rooftop premium beach rooftop restaurant in Natal Brazil. Bright natural sunlight, turquoise coastal ambiance, blue or white ceramic plates, wooden deck blurred background, realistic photograph NOT illustration, appetizing, no text, no watermark, no logo.';

const root = path.join(__dirname, '..');
const menu = JSON.parse(fs.readFileSync(path.join(root, 'data/menu-data.json'), 'utf8'));
const meta = JSON.parse(fs.readFileSync(path.join(root, 'data/images-meta.json'), 'utf8'));

const byId = new Map();
menu.categories.forEach((cat) =>
  cat.items.forEach((item) => byId.set(item.id, { ...item, category: cat.name }))
);

const prompts = meta.missing.map((id) => {
  const item = byId.get(id);
  if (!item) return null;
  const desc = [item.name, item.description, `Category: ${item.category}`]
    .filter(Boolean)
    .join('. ');
  return {
    id,
    filename: `${id}.jpg`,
    prompt: `${STYLE} Dish/drink: ${desc}`,
  };
}).filter(Boolean);

const outPath = path.join(root, 'data/image-generation-prompts.json');
fs.writeFileSync(outPath, JSON.stringify(prompts, null, 2) + '\n');
console.log('prompts', prompts.length, '->', outPath);
