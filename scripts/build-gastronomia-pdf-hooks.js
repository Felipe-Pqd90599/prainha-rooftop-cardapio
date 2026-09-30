/**
 * Gera data/gastronomia-pdf-hooks.json (gancho + detalhe revisados para o PDF gastronomia).
 * Uso: node scripts/build-gastronomia-pdf-hooks.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const menu = require(path.join(ROOT, 'data/menu-data.json'));
const pages = require(path.join(ROOT, 'data/gastronomia-pdf-pages.json'));

function collectIds(pagesCfg) {
  const ids = new Set();
  for (const page of pagesCfg.pages) {
    const cat = menu.categories.find((c) => c.id === page.cat);
    for (const block of page.blocks || []) {
      if (block.type === 'combo') {
        ids.add(block.id);
        continue;
      }
      if (!block.ids) continue;
      const list =
        block.ids === 'cat:all'
          ? (block.cat ? menu.categories.find((c) => c.id === block.cat) : cat)?.items?.map((i) => i.id) ||
            []
          : block.ids;
      for (const id of list) {
        if (!block.exclude?.includes(id)) ids.add(id);
      }
    }
  }
  return [...ids];
}

const byId = {};
for (const c of menu.categories) for (const it of c.items || []) byId[it.id] = it;

/** Ganchos revisados manualmente — fonte da verdade para o PDF. */
const curated = {
  'queijo-coalho-melaco': { hook: 'Coalho grelhado', detail: 'Tiras com melaço' },
  'dadinho-queijo': { hook: 'Cubinhos empanados', detail: 'Acompanha molhos da casa' },
  'ginga-tapioca': { hook: 'Ginga crocante', detail: 'Servida com tapioca' },
  'taca-camarao-empanado': { hook: 'Camarão empanado', detail: 'Na taça, molho da casa e salsinha' },
  'pastel-diversos': { hook: 'Pastéis variados', detail: 'Carne, frango, queijo ou calabresa · 4 unid' },
  'pastel-camarao': { hook: 'Camarão e catupiry', detail: 'Pastel frito · 4 unid' },
  'bruschetta-sertao': {
    hook: 'Carne de sol',
    detail: 'Creme de queijo, coalho, manjericão e manteiga do sertão · 4 unid',
  },
  'bruschetta-tradicional': { hook: 'Clássica', detail: 'Tomate, queijo, manjericão e azeite · 4 unid' },
  'bruschetta-terra': { hook: 'Doce e salgada', detail: 'Banana, muçarela, manjericão e melaço · 4 unid' },
  'ceviche-camarao': { hook: 'Camarão no limão', detail: 'Cebola roxa e coentro · torradinhas' },
  'escondidinho-carne-sol': { hook: 'Carne de sol', detail: 'Purê e queijo gratinado' },
  'escondidinho-camarao': { hook: 'Camarão ao creme', detail: 'Purê e queijo gratinado' },
  'camarao-prainha': {
    hook: 'Arroz cremoso',
    detail: 'Coalho, muçarela maçaricada, camarão empanado e manjericão',
  },
  'camarao-caicoense': { hook: 'Arroz cremoso', detail: 'Carne de sol, filé de camarão e batata palha' },
  'camarao-grega': { hook: 'Arroz à grega', detail: 'Camarão empanado, muçarela maçaricada e batata palha' },
  'penne-camarao': { hook: 'Massa ao molho branco', detail: 'Salsinha e filé de camarão' },
  'parmegiana-camarao': {
    hook: 'Camarão empanado',
    detail: 'Molho de tomate e queijo gratinado · macarrão, arroz ao molho ou branco',
  },
  'ensopado-peixe': { hook: 'Peixe ao creme', detail: 'Legumes, pirão e arroz refogado' },
  'brasileirinho-camarao': { hook: 'Na brasa', detail: 'Queijo, vinagrete e orégano' },
  'brasileirinho-peixe': { hook: 'Peixe frito', detail: 'Feijão, arroz, salada e farofa da casa' },
  'mista-familia': {
    hook: 'Para 4 pessoas',
    detail: 'Carne, camarão alho e óleo e calabresa · arroz, feijão e farofa',
  },
  'sertanejo-prainha': {
    hook: 'Prato completo',
    detail: 'Feijão, arroz, carne de sol, coalho, salada, fritas e farofa',
  },
  'baiao-dois': { hook: 'Cremoso ou tradicional', detail: 'Feijão, arroz, bacon, carne de sol e coalho' },
  'penne-fettuccine-carne': { hook: 'Massa ao molho branco', detail: 'Filé ao molho madeira com barbecue' },
  'parmegiana-carne': {
    hook: 'Filé empanado',
    detail: 'Molho de tomate e queijo gratinado · macarrão, arroz ao molho ou branco',
  },
  'parmegiana-frango': {
    hook: 'Frango empanado',
    detail: 'Molho de tomate e queijo gratinado · macarrão, arroz ao molho ou branco',
  },
  'brasileirinho-carne': { hook: 'Filé acebolado', detail: 'Feijão, arroz, salada e farofa da casa' },
  'brasileirinho-frango': { hook: 'Frango em cubos', detail: 'Feijão, arroz, salada e farofa da casa' },
  'brasileirinho-calabresa': { hook: 'Calabresa acebolada', detail: 'Feijão, arroz, salada e farofa da casa' },
  'nordestino-na-area': { hook: 'Burger nordestino', detail: 'Carne desfiada, coalho, ovo, alface e molho da casa' },
  'american-smash-duplo': { hook: '2 smash bovinos', detail: 'Bacon, cheddar, alface e molho da casa' },
  'burger-potiguar': { hook: 'Filé de camarão', detail: 'Muçarela, cebola empanada, alface e molho da casa' },
  'blend-tradicional': { hook: '1 smash bovino', detail: 'Muçarela, cebola empanada, alface e molho da casa' },
  'cheeseburger': { hook: 'Muçarela empanada', detail: 'Ovo, cebola caramelizada, salada e molho da casa' },
  'chicken-burger': { hook: 'Frango desfiado', detail: 'Muçarela, cebola empanada, alface e molho da casa' },
  'combo-fritas-refri': { hook: 'Combo burger', detail: '150g de fritas + refri lata' },
  'combo-fritas-acai': {
    hook: 'Combo burger',
    detail: '150g de fritas + açaí 400ml (fruta, leite condensado e granola)',
  },
  'mista-prainha': { hook: 'Mistão', detail: 'Carne, calabresa, camarão e fritas (batata ou macaxeira)' },
  'empanados-mar': { hook: 'Peixe e camarão', detail: 'Empanados, salada e fritas (batata ou macaxeira)' },
  'camarao-alho-oleo': { hook: 'Camarão salteado', detail: 'Com fritas — batata ou macaxeira' },
  'linguica-prainha': { hook: 'Linguiça defumada', detail: 'Vinagrete e farofa' },
  'mix-sertanejo': { hook: 'Carne de sol e coalho', detail: 'Com fritas (batata ou macaxeira)' },
  'carne-sol-fritas': { hook: 'Carne de sol em cubos', detail: 'Com fritas (batata ou macaxeira)' },
  'carne-ao-molho': { hook: 'Tirinhas ao madeira', detail: 'Com fritas (batata ou macaxeira)' },
  'fritas-tradicional': { hook: 'Porção de fritas', detail: 'Batata ou macaxeira' },
  'fritas-nordestina': { hook: 'Carne de sol', detail: 'Creme de queijo sobre fritas' },
  'fritas-sertaneja': { hook: 'Cheddar e bacon', detail: 'Sobre fritas (batata ou macaxeira)' },
  'fritas-potiguar': { hook: 'Camarão ao creme', detail: 'Sobre fritas (batata ou macaxeira)' },
  'crepioca-queijo': { hook: 'Recheio de queijo', detail: '' },
  'torrada-queijo': { hook: 'Muçarela gratinada', detail: 'Pão de forma' },
  misto: { hook: 'Clássico', detail: 'Pão de forma, presunto e queijo' },
  'carne-sol-coalho': { hook: 'Carne de sol e coalho', detail: '' },
  'files-camarao-queijo': { hook: 'Filés de camarão', detail: 'Molho de queijo' },
  'filezinhos-carne-molho': { hook: 'Filezinhos de carne', detail: 'Ao molho' },
  'creme-frango-cubos': { hook: 'Creme de frango', detail: 'Em cubos' },
  'calabresa-mucarela': { hook: 'Calabresa e muçarela', detail: '' },
  'ovos-mucarela': { hook: 'Ovos e muçarela', detail: '' },
  'coco-leite-coco': { hook: 'Coco e leite de coco', detail: '' },
  'cuscuz-carne-sol-coalho': { hook: 'Carne de sol e coalho', detail: '' },
  'cuscuz-files-camarao-queijo': { hook: 'Filés de camarão', detail: 'Molho de queijo' },
  'cuscuz-filezinhos-carne-molho': { hook: 'Filezinhos de carne', detail: 'Ao molho' },
  'cuscuz-creme-frango-cubos': { hook: 'Creme de frango', detail: 'Em cubos' },
  'cuscuz-calabresa-mucarela': { hook: 'Calabresa e muçarela', detail: '' },
  'cuscuz-ovos-mucarela': { hook: 'Ovos e muçarela', detail: '' },
  'cuscuz-coco-leite-coco': { hook: 'Coco e leite de coco', detail: '' },
  'caldeirinho-mar': { hook: 'Caldo do mar', detail: 'Camarão, peixes e legumes' },
  'camarao-entrada': { hook: 'Caldo de camarão', detail: '' },
  'peixe-entrada': { hook: 'Caldo de peixe', detail: '' },
  arretado: { hook: 'Creme de macaxeira', detail: 'Bacon e carne desfiada' },
  'do-sertao': { hook: 'Feijão verde', detail: 'Coalho em cubinhos' },
  'caldo-feijao': { hook: 'Caldo de feijão', detail: '' },
  sopa: { hook: 'Sopa do dia', detail: 'Consultar sabor' },
  'salada-camarao': { hook: 'Salada verde', detail: 'Com filé de camarão' },
  'salada-coalho': { hook: 'Salada verde', detail: 'Cubos de coalho grelhado' },
  'arroz-tropical': { hook: 'Arroz refogado', detail: 'Açafrão, brócolis, tomate, coalho e ervilha' },
  'salada-frango': { hook: 'Salada verde', detail: 'Cubos de frango grelhado' },
  'penne-pomodoro': { hook: 'Penne vegetariano', detail: 'Molho pomodoro' },
  'omelete-kids': { hook: 'Omelete', detail: 'Queijo, vinagrete e orégano' },
  'file-carne-kids': { hook: 'Filezinho ao molho', detail: 'Arroz e batata frita' },
  'file-frango-kids': { hook: 'Filezinho ao molho', detail: 'Arroz e batata frita' },
  'file-camarao-kids': { hook: 'Filé ao molho', detail: 'Arroz e batata frita' },
  'acai-tradicional': { hook: 'Açaí 350ml', detail: 'Tradicional' },
  'petit-brownie': { hook: 'Brownie quente', detail: 'Com sorvete' },
  'ice-cream-frutas': { hook: 'Sorvete na taça', detail: 'Com frutas' },
  cartola: { hook: 'Doce clássico', detail: 'Banana, queijo e canela' },
  beijinho: { hook: 'Doce de coco', detail: '' },
  'romeu-julieta': { hook: 'Queijo e goiabada', detail: '' },
  'frutas-chocolate': { hook: 'Frutas frescas', detail: 'Com chocolate' },
  'cappuccino-chantilly-m': { hook: 'Cappuccino M', detail: 'Com chantilly' },
  'cafe-coado-m': { hook: 'Café coado M', detail: '' },
  'cafe-leite-m': { hook: 'Café com leite M', detail: '' },
  'suco-tradicional': { hook: 'Suco natural', detail: 'Um sabor' },
  'suco-especial': { hook: 'Dois sabores', detail: 'No mesmo copo' },
  'soda-italiana': { hook: 'Refresco gelado', detail: 'Água com gás, limão, groselha e gelo' },
  'refri-lata': { hook: 'Refrigerante lata', detail: 'Diversos sabores' },
  'refri-litro': { hook: 'Refrigerante litro', detail: 'Diversos sabores' },
  'cajuina-litro': { hook: 'Cajuína', detail: 'Garrafa litro' },
  'agua-sem-gas': { hook: 'Água mineral', detail: 'Sem gás' },
  'agua-com-gas': { hook: 'Água mineral', detail: 'Com gás' },
  'agua-coco': { hook: 'Coco verde', detail: 'Gelado' },
  'agua-tonica': { hook: 'Tônica ou Citrus', detail: 'Schweppes' },
  'energetico-monster': { hook: 'Monster', detail: 'Consultar sabores' },
  'energetico-redbull': { hook: 'Red Bull', detail: 'Consultar sabores' },
  h2o: { hook: 'H2O', detail: 'Limoneto ou limão' },
  'carne-130g': { hook: 'Adicional carne', detail: '130g' },
  'frango-130g': { hook: 'Adicional frango', detail: '130g' },
  'camarao-130g': { hook: 'Adicional camarão', detail: '130g' },
  'calabresa-130g': { hook: 'Adicional calabresa', detail: '130g' },
  'arroz-ind': { hook: 'Porção de arroz', detail: 'Individual' },
  'feijao-ind': { hook: 'Porção de feijão', detail: 'Individual' },
  'peixe-posta': { hook: 'Peixe posta', detail: 'Unidade' },
  'ovo-unid': { hook: 'Ovo', detail: 'Unidade' },
  embalagem: { hook: 'Embalagem', detail: 'Para viagem' },
  leite: { hook: 'Leite', detail: '' },
};

const ids = collectIds(pages);
const missing = ids.filter((id) => !curated[id]);
if (missing.length) {
  console.error('Faltam ganchos para:', missing.join(', '));
  process.exit(1);
}

const out = {};
for (const id of ids.sort()) out[id] = curated[id];

fs.writeFileSync(path.join(ROOT, 'data/gastronomia-pdf-hooks.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log(`OK — ${Object.keys(out).length} itens em data/gastronomia-pdf-hooks.json`);
