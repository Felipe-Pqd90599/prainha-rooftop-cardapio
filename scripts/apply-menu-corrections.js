/**
 * Aplica correções de conteúdo solicitadas (imagens via generate separado).
 */
const fs = require('fs');
const path = require('path');

const menuPath = path.join(__dirname, '../data/menu-data.json');
const m = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

function findItem(id) {
  for (const cat of m.categories) {
    const item = cat.items?.find((i) => i.id === id);
    if (item) return { cat, item };
  }
  return null;
}

// —— Mistão Família → Carnes ——
const petiscos = m.categories.find((c) => c.id === 'petiscos');
const carnes = m.categories.find((c) => c.id === 'carnes');
const famIdx = petiscos?.items?.findIndex((i) => i.id === 'mista-familia');
if (famIdx >= 0) {
  const fam = petiscos.items.splice(famIdx, 1)[0];
  fam.price = 159;
  fam.name = 'Mistão Família (4 pessoas)';
  fam.description = 'Acompanha arroz, feijão e farofa da casa';
  if (!carnes.items.some((i) => i.id === 'mista-familia')) {
    carnes.items.unshift(fam);
  }
}

const prainha = findItem('mista-prainha');
if (prainha) {
  prainha.item.price = 139;
}

// —— Camarão alho e óleo — porções ——
const alho = findItem('camarao-alho-oleo');
if (alho) {
  alho.item.name = 'Camarão Alho e Óleo';
  alho.item.description = 'Camarão salteado com fritas — escolha o tamanho';
  delete alho.item.price;
  delete alho.item.priceSecondary;
  alho.item.portionOptions = [
    { key: '300g', label: '300g', price: 48 },
    { key: '500g', label: '500g', price: 72 },
    { key: '1kg', label: '1kg', price: 129, badge: 'Melhor valor' },
  ];
}

// —— Cuscuz + Tapiocas — recheios em par ——
const cuscuzCat = m.categories.find((c) => c.id === 'cuscuz-tapiocas-lanches');
if (cuscuzCat) {
  const pairs = [
    {
      tapiocaId: 'carne-sol-coalho',
      cuscuzId: 'cuscuz-carne-sol-coalho',
      tName: 'Tapioca de Carne de Sol com Coalho',
      cName: 'Cuscuz de Carne de Sol com Coalho',
      price: 26,
    },
    {
      tapiocaId: 'filezinhos-carne-molho',
      cuscuzId: 'cuscuz-filezinhos-carne-molho',
      tName: 'Tapioca de Filezinhos de Carne ao Molho',
      cName: 'Cuscuz de Filezinhos de Carne ao Molho',
      price: 26,
    },
    {
      tapiocaId: 'creme-frango-cubos',
      cuscuzId: 'cuscuz-creme-frango-cubos',
      tName: 'Tapioca de Creme de Frango em Cubos',
      cName: 'Cuscuz de Creme de Frango em Cubos',
      price: 24,
    },
    {
      tapiocaId: 'calabresa-mucarela',
      cuscuzId: 'cuscuz-calabresa-mucarela',
      tName: 'Tapioca de Calabresa com Muçarela',
      cName: 'Cuscuz de Calabresa com Muçarela',
      price: 24,
    },
    {
      tapiocaId: 'files-camarao-queijo',
      cuscuzId: 'cuscuz-files-camarao-queijo',
      tName: 'Tapioca de Filés de Camarão com Queijo',
      cName: 'Cuscuz de Filés de Camarão com Queijo',
      price: 28,
    },
    {
      tapiocaId: 'ovos-mucarela',
      cuscuzId: 'cuscuz-ovos-mucarela',
      tName: 'Tapioca de Ovos e Muçarela',
      cName: 'Cuscuz de Ovos e Muçarela',
      price: 22,
    },
    {
      tapiocaId: 'coco-leite-coco',
      cuscuzId: 'cuscuz-coco-leite-coco',
      tName: 'Tapioca de Coco Ralado e Leite de Coco',
      cName: 'Cuscuz de Coco Ralado e Leite de Coco',
      price: 22,
    },
  ];

  const lanches = cuscuzCat.items.filter((i) =>
    ['crepioca-queijo', 'torrada-queijo', 'misto'].includes(i.id)
  );

  const newFillings = [];
  for (const p of pairs) {
    const existing = cuscuzCat.items.find((i) => i.id === p.tapiocaId);
    const tapioca = {
      id: p.tapiocaId,
      name: p.tName,
      price: p.price,
      image: `${p.tapiocaId}.jpg`,
    };
  const cuscuz = {
      id: p.cuscuzId,
      name: p.cName,
      price: p.price,
      image: `${p.cuscuzId}.jpg`,
    };
    newFillings.push(tapioca, cuscuz);
  }

  cuscuzCat.items = [...lanches, ...newFillings];
}

fs.writeFileSync(menuPath, JSON.stringify(m, null, 2) + '\n');
console.log('menu-data.json atualizado');
