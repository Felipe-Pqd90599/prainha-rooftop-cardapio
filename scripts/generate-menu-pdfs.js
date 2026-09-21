/**
 * Gera os dois cardápios em PDF a partir de data/menu-data.json:
 *   - Gastronomia (comidas, sobremesas, adicionais)
 *   - Drinks & Bar (autorais, tradicionais, cervejas, doses, vinhos, sem álcool)
 *
 * Layout A4 paginado à mão (capa cheia, abertura de capítulo com foto, grade de cards).
 * Uso: npm run generate-menus [-- --shots]
 */
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const FOTOS = path.join(ROOT, 'assets/fotos');
const FONTS = path.join(ROOT, 'assets/fontes-pdf');
const QRDIR = path.join(ROOT, 'assets/qr');
const BUILD = path.join(ROOT, 'output/pdf-build');
const OUTPUT = path.join(ROOT, 'output');
const ONLINE = path.join(ROOT, 'online');

const CHROME_PATHS = [
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const FONT_SPECS = [
  { family: 'Oswald', pkg: 'oswald', weights: [400, 500, 600, 700] },
  { family: 'Source Sans 3', pkg: 'source-sans-3', weights: [300, 400, 600, 700] },
];
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/** Medidas da página em milímetros — a paginação é calculada com estes valores. */
const LAYOUT = {
  pageH: 297,
  headerH: 15,
  footerH: 13,
  heroH: 106,
  heroGap: 7,
  headingH: 12,
  grid: {
    2: { cols: 2, gap: 7, rowGap: 6.5, cardH: 82 },
    3: { cols: 3, gap: 6, rowGap: 5.5, cardH: 62 },
  },
};

const MENUS = [
  {
    id: 'gastronomia',
    out: 'cardapio-prainha-rooftop-gastronomia.pdf',
    kicker: 'Cardápio',
    title: 'Gastronomia',
    lead: 'Do mar ao sertão, com vista para o Morro do Careca',
    accent: '#B8956B',
    accentLight: '#E8C98A',
    accentRgb: '184, 149, 107',
    tocTitle: 'O que servimos',
    tocNote:
      'Cozinha aberta todos os dias. Pratos de 2 pessoas marcados com o segundo preço. Peça pelo QR e acompanhe o cardápio sempre atualizado.',
    coverThumbs: ['mista-familia', 'american-smash-duplo', 'taca-camarao-empanado'],
    chapters: [
      { cat: 'mais-vendidos', cols: 2, hero: 'mista-familia', lead: 'Os pratos que mais saem no rooftop', star: true },
      { cat: 'entradas', cols: 2, hero: 'taca-camarao-empanado', lead: 'Para abrir a noite' },
      { cat: 'frutos-do-mar', cols: 2, hero: 'camarao-caicoense', lead: 'O melhor do mar de Ponta Negra' },
      { cat: 'carnes', cols: 2, hero: 'parmegiana-carne', lead: 'Pratos quentes para dividir' },
      { cat: 'burgers', cols: 2, hero: 'american-smash-duplo', lead: 'Blend na chapa e pão macio' },
      { cat: 'petiscos', cols: 2, hero: 'mista-prainha', lead: 'Para acompanhar a cerveja gelada' },
      { cat: 'cuscuz-tapiocas-lanches', cols: 3, hero: 'cuscuz-carne-sol-coalho', lead: 'O Nordeste na chapa' },
      { cat: 'caldos', cols: 2, hero: 'caldeirinho-mar', lead: 'Quentinhos para a brisa do mar' },
      { cat: 'saladas-vegetarianos', cols: 2, hero: 'salada-camarao', lead: 'Leves, frescas e coloridas' },
      { cat: 'infantis', cols: 2, hero: 'file-camarao-kids', lead: 'Porções pensadas para as crianças' },
      { cat: 'sucos-diversos', cols: 3, hero: 'suco-especial', lead: 'Sucos, águas e geladas sem álcool' },
      { cat: 'sobremesas-cafes', cols: 2, hero: 'petit-brownie', lead: 'O doce final com vista para o mar' },
      { cat: 'adicionais', cols: 3, hero: 'carne-130g', lead: 'Complete o seu prato' },
    ],
  },
  {
    id: 'drinks',
    out: 'cardapio-prainha-rooftop-drinks.pdf',
    kicker: 'Carta de',
    title: 'Drinks & Bar',
    lead: 'O pôr do sol da Prainha servido em taça',
    accent: '#5BB5C9',
    accentLight: '#7EC8E3',
    accentRgb: '126, 200, 227',
    tocTitle: 'O que tem no bar',
    tocNote:
      'Bar aberto até o fim da noite. Drinks preparados na hora, cervejas sempre geladas e baldes para a mesa toda.',
    coverThumbs: ['caipi-prainha', 'caipifruta', 'balde-heineken'],
    tocHighlights: [
      { id: 'prainha-blue', label: 'Autorais da casa' },
      { id: 'balde-budweiser', label: 'Baldes para a mesa' },
      { id: 'suco-especial', label: 'Sem álcool' },
    ],
    chapters: [
      { cat: 'drinks-autorais', cols: 2, hero: 'caipi-prainha', lead: 'Criações da casa, só daqui', star: true },
      { cat: 'drinks-tradicionais', cols: 2, hero: 'caipifruta', lead: 'Os clássicos que nunca falham' },
      { cat: 'cervejas', cols: 3, hero: 'balde-heineken', lead: 'Geladas, long necks e baldes' },
      { cat: 'doses-litros', cols: 3, hero: 'whisky-12-anos', lead: 'Destilados, doses e litros' },
      { cat: 'vinhos', cols: 2, hero: 'vinho-consultar', lead: 'Consulte os rótulos do dia' },
      { cat: 'sucos-diversos', cols: 3, hero: 'suco-especial', lead: 'Sem álcool, do jeito que você gosta' },
    ],
  },
];

function esc(value) {
  return String(value == null ? '' : value).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );
}

function money(value) {
  return value % 1 === 0 ? `R$ ${value}` : `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

/** A rede da máquina oscila: tenta algumas vezes antes de desistir. */
async function download(url, dest, tries = 4) {
  let lastError;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': CHROME_UA },
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      return true;
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw new Error(`${lastError.message} — ${url}`);
}

/** Último recurso quando o fetch do Node falha: baixa pelo próprio Chrome. */
async function downloadViaBrowser(browser, jobs) {
  const page = await browser.newPage();
  await page.goto('about:blank');
  const files = await page.evaluate(async (list) => {
    const out = [];
    for (const { url, name } of list) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
      out.push({ name, base64: btoa(binary) });
    }
    return out;
  }, jobs);
  await page.close();
  for (const file of files) fs.writeFileSync(path.join(FONTS, file.name), Buffer.from(file.base64, 'base64'));
}

/** Baixa Oswald/Source Sans uma única vez para assets/fontes-pdf (build offline depois). */
async function ensureFonts(browser) {
  const cssPath = path.join(FONTS, 'fontes.css');
  if (fs.existsSync(cssPath)) return true;
  fs.mkdirSync(FONTS, { recursive: true });

  const jobs = [];
  const faces = [];
  for (const spec of FONT_SPECS) {
    for (const weight of spec.weights) {
      const name = `${spec.pkg}-latin-${weight}-normal.woff2`;
      jobs.push({ name, url: `https://cdn.jsdelivr.net/npm/@fontsource/${spec.pkg}/files/${name}` });
      faces.push(
        `@font-face{font-family:'${spec.family}';font-style:normal;font-weight:${weight};font-display:block;src:url('${name}') format('woff2');}`,
      );
    }
  }

  try {
    for (const job of jobs) {
      if (!fs.existsSync(path.join(FONTS, job.name))) await download(job.url, path.join(FONTS, job.name));
    }
  } catch (err) {
    console.warn('fontes: fetch do Node falhou, tentando pelo Chrome —', err.message);
    try {
      await downloadViaBrowser(browser, jobs.filter((j) => !fs.existsSync(path.join(FONTS, j.name))));
    } catch (err2) {
      console.warn('fontes: indisponíveis, usando fallback do sistema —', err2.message);
      return false;
    }
  }

  fs.writeFileSync(cssPath, faces.join('\n') + '\n');
  console.log(`fontes: ${faces.length} arquivos salvos`);
  return true;
}

/** QR do WhatsApp e do cardápio online, cacheados em assets/qr. */
async function ensureQr(info) {
  fs.mkdirSync(QRDIR, { recursive: true });
  const targets = [
    ['whatsapp.png', `https://wa.me/${info.contact.whatsapp}`],
    ['cardapio.png', info.site.githubPages],
  ];
  const ok = {};
  for (const [name, data] of targets) {
    const dest = path.join(QRDIR, name);
    if (!fs.existsSync(dest)) {
      try {
        await download(
          `https://api.qrserver.com/v1/create-qr-code/?size=520x520&margin=8&format=png&data=${encodeURIComponent(data)}`,
          dest,
        );
      } catch (err) {
        console.warn(`qr ${name}: falhou —`, err.message);
      }
    }
    ok[name] = fs.existsSync(dest);
  }
  return ok;
}

/** Recorta as fotos nos tamanhos usados pelo PDF (card e faixa de abertura). */
async function prepareImages(cardIds, heroIds, qr) {
  const imgDir = path.join(BUILD, 'img');
  fs.mkdirSync(imgDir, { recursive: true });

  for (const id of cardIds) {
    const dest = path.join(imgDir, `card-${id}.jpg`);
    if (fs.existsSync(dest)) continue;
    const img = await Jimp.read(path.join(FOTOS, `${id}.jpg`));
    img.cover(720, 470).quality(72);
    await img.writeAsync(dest);
  }

  for (const id of heroIds) {
    const dest = path.join(imgDir, `hero-${id}.jpg`);
    if (fs.existsSync(dest)) continue;
    const img = await Jimp.read(path.join(FOTOS, `${id}.jpg`));
    img.cover(1400, 730).quality(76);
    await img.writeAsync(dest);
  }

  fs.copyFileSync(path.join(FOTOS, 'capa-prainha-rooftop.jpg'), path.join(imgDir, 'capa.jpg'));
  for (const name of Object.keys(qr)) {
    if (qr[name]) fs.copyFileSync(path.join(QRDIR, name), path.join(imgDir, name));
  }
  console.log(`imagens: ${cardIds.length} cards + ${heroIds.length} faixas`);
}

/** Resolve os itens de uma categoria, respeitando itemRefs e groups. */
function chapterContent(menu, catId) {
  const cat = menu.categories.find((c) => c.id === catId);
  if (!cat) throw new Error(`categoria não encontrada: ${catId}`);
  const items = cat.itemRefs?.length
    ? cat.itemRefs
        .map((id) => menu.categories.flatMap((c) => c.items || []).find((i) => i.id === id))
        .filter(Boolean)
    : cat.items || [];
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  const groups = cat.groups?.length
    ? cat.groups.map((g) => ({ name: g.name, items: g.itemIds.map((id) => byId[id]).filter(Boolean) }))
    : [{ name: '', items }];
  return { cat, items, groups };
}

/** Distribui títulos de grupo e linhas de cards nas páginas, medindo em milímetros. */
function paginate(groups, cfg) {
  const blocks = [];
  for (const group of groups) {
    if (group.name) blocks.push({ type: 'heading', name: group.name });
    for (let i = 0; i < group.items.length; i += cfg.cols) {
      blocks.push({ type: 'row', items: group.items.slice(i, i + cfg.cols) });
    }
  }

  const openerSpace = LAYOUT.pageH - LAYOUT.heroH - LAYOUT.heroGap - LAYOUT.footerH;
  const innerSpace = LAYOUT.pageH - LAYOUT.headerH - LAYOUT.footerH;
  const heightOf = (b) => (b.type === 'heading' ? LAYOUT.headingH : cfg.cardH);

  const pages = [];
  let page = { opener: true, blocks: [], free: openerSpace };
  for (const block of blocks) {
    const needed = heightOf(block) + (page.blocks.length ? cfg.rowGap : 0);
    if (needed > page.free) {
      pages.push(page);
      page = { opener: false, blocks: [], free: innerSpace };
      page.free -= heightOf(block);
    } else {
      page.free -= needed;
    }
    page.blocks.push(block);
  }
  pages.push(page);

  // Título de grupo sozinho no pé da página desce junto com os cards.
  for (let i = 0; i < pages.length - 1; i++) {
    const last = pages[i].blocks[pages[i].blocks.length - 1];
    if (last?.type === 'heading') {
      pages[i].blocks.pop();
      pages[i + 1].blocks.unshift(last);
    }
  }

  // Sem títulos de grupo dá para equilibrar as linhas e evitar a última página quase vazia.
  if (!blocks.some((b) => b.type === 'heading') && pages.length > 1) {
    const rowsPerPage = balanceRows(blocks.length, pages.length, cfg, openerSpace, innerSpace);
    let cursor = 0;
    return rowsPerPage.map((rows, index) => ({
      opener: index === 0,
      blocks: blocks.slice(cursor, (cursor += rows)),
    }));
  }
  return pages;
}

function balanceRows(totalRows, pageCount, cfg, openerSpace, innerSpace) {
  const fits = (space) => Math.floor((space + cfg.rowGap) / (cfg.cardH + cfg.rowGap));
  const capacity = (index) => fits(index === 0 ? openerSpace : innerSpace);
  const counts = new Array(pageCount).fill(0);
  let left = totalRows;
  for (let i = 0; i < pageCount; i += 1) {
    counts[i] = Math.min(capacity(i), Math.ceil(left / (pageCount - i)));
    left -= counts[i];
  }
  for (let i = pageCount - 1; i >= 0 && left > 0; i -= 1) {
    const add = Math.min(capacity(i) - counts[i], left);
    counts[i] += add;
    left -= add;
  }
  return counts;
}

function renderCard(item, cols, badge, wide) {
  const prices = [];
  if (item.portionOptions?.length) {
    // Itens vendidos por tamanho (camarão alho e óleo) mostram todas as porções.
    for (const option of item.portionOptions.slice(0, 3)) {
      prices.push(`<span class="pill pill--second">${esc(option.label)} ${esc(money(option.price))}</span>`);
    }
  } else {
    prices.push(`<span class="pill pill--price">${esc(money(item.price))}</span>`);
    if (item.priceSecondary != null) {
      prices.push(
        `<span class="pill pill--second">${esc(item.priceSecondaryLabel || '2 pessoas')} ${esc(money(item.priceSecondary))}</span>`,
      );
    }
  }
  return `
        <article class="card card--${cols}${wide ? ' card--wide' : ''}">
          <div class="card__media">
            <img src="img/card-${esc(item.id)}.jpg" alt="" />
            ${badge ? `<span class="card__badge">${esc(badge)}</span>` : ''}
            <div class="card__prices">${prices.join('')}</div>
          </div>
          <div class="card__body">
            <h3 class="card__name">${esc(item.name)}</h3>
            ${item.description ? `<p class="card__desc">${esc(item.description)}</p>` : ''}
          </div>
        </article>`;
}

/** Capítulo de um item só (vinhos) vira um card grande, em vez de um card perdido na página. */
function renderFeature(item) {
  const prices = [money(item.price)];
  if (item.priceSecondary != null) prices.push(`${item.priceSecondaryLabel || '2 pessoas'} ${money(item.priceSecondary)}`);
  return `
        <article class="feature">
          <div class="feature__media"><img src="img/card-${esc(item.id)}.jpg" alt="" /></div>
          <div class="feature__body">
            <h3 class="feature__name">${esc(item.name)}</h3>
            ${item.description ? `<p class="feature__desc">${esc(item.description)}</p>` : ''}
            <p class="feature__price">${esc(prices.join(' · '))}</p>
          </div>
        </article>`;
}

function renderBlocks(blocks, cfg, starFirst, wideLast) {
  let first = starFirst;
  return blocks
    .map((block, index) => {
      if (block.type === 'heading') {
        return `<h4 class="group">${esc(block.name)}</h4>`;
      }
      // Item sozinho na última linha ocupa a largura toda, em vez de deixar um buraco.
      const wide = wideLast && index === blocks.length - 1 && block.items.length === 1 && cfg.cols === 2;
      return block.items
        .map((item) => {
          const badge = first ? 'Mais pedido' : '';
          first = false;
          return renderCard(item, cfg.cols, badge, wide);
        })
        .join('');
    })
    .join('');
}

function renderFooter(pageNumber, menu) {
  return `
      <footer class="sheet__footer">
        <span>Prainha Rooftop · Ponta Negra, Natal/RN</span>
        <span class="sheet__page">${pad2(pageNumber)}</span>
      </footer>`;
}

function buildMenuHtml(menuCfg, data, info, qr) {
  const chapters = menuCfg.chapters.map((chapter, index) => {
    const { cat, items, groups } = chapterContent(data, chapter.cat);
    const cfg = LAYOUT.grid[chapter.cols];
    return { ...chapter, cat, items, groups, cfg, number: index + 1 };
  });

  // Capa = 1, sumário = 2, capítulos a partir da 3.
  let cursor = 3;
  for (const chapter of chapters) {
    chapter.pages = paginate(chapter.groups, chapter.cfg);
    chapter.startPage = cursor;
    cursor += chapter.pages.length;
  }
  const closingPage = cursor;

  const coverThumbs = menuCfg.coverThumbs
    .map((id) => `<img src="img/card-${esc(id)}.jpg" alt="" />`)
    .join('');

  const cover = `
    <section class="sheet sheet--cover">
      <img class="bleed" src="img/capa.jpg" alt="" />
      <div class="cover__veil"></div>
      <div class="cover__thumbs">${coverThumbs}</div>
      <div class="cover__block">
        <span class="hairline"></span>
        <p class="cover__kicker">${esc(menuCfg.kicker)}</p>
        <h1 class="cover__title">${esc(menuCfg.title)}</h1>
        <p class="cover__lead">${esc(menuCfg.lead)}</p>
        <p class="cover__meta">${esc(info.contact.instagram)} &nbsp;·&nbsp; ${esc(info.contact.phone)} &nbsp;·&nbsp; Ponta Negra, Natal/RN</p>
      </div>
    </section>`;

  const tocRows = chapters
    .map(
      (chapter) => `
          <li>
            <span class="toc__num">${pad2(chapter.number)}</span>
            <span class="toc__name">${esc(chapter.cat.name)}</span>
            <span class="toc__dots"></span>
            <span class="toc__count">${chapter.items.length} itens</span>
            <span class="toc__page">${pad2(chapter.startPage)}</span>
          </li>`,
    )
    .join('');

  const highlights = menuCfg.tocHighlights?.length
    ? `<div class="toc__highlights">${menuCfg.tocHighlights
        .map(
          (h) => `
          <figure>
            <img src="img/card-${esc(h.id)}.jpg" alt="" />
            <figcaption>${esc(h.label)}</figcaption>
          </figure>`,
        )
        .join('')}</div>`
    : '';

  const toc = `
    <section class="sheet">
      <header class="sheet__header">
        <span>Prainha Rooftop</span>
        <span>${esc(menuCfg.title)}</span>
      </header>
      <div class="sheet__body sheet__body--toc">
        <p class="eyebrow">Sumário</p>
        <h2 class="toc__title">${esc(menuCfg.tocTitle)}</h2>
        <ol class="toc${highlights ? ' toc--tight' : ''}">${tocRows}</ol>
        ${highlights}
        <div class="toc__foot">
          <p class="toc__note">${esc(menuCfg.tocNote)}</p>
          ${
            qr['cardapio.png']
              ? `<div class="qr qr--small">
                   <img src="img/cardapio.png" alt="" />
                   <span>Cardápio<br />online</span>
                 </div>`
              : ''
          }
        </div>
      </div>
      ${renderFooter(2, menuCfg)}
    </section>`;

  const content = chapters
    .map((chapter) =>
      chapter.pages
        .map((page, pageIndex) => {
          const pageNumber = chapter.startPage + pageIndex;
          const grid =
            chapter.items.length === 1
              ? renderFeature(chapter.items[0])
              : `<div class="grid grid--${chapter.cols}">${renderBlocks(
                  page.blocks,
                  chapter.cfg,
                  chapter.star && pageIndex === 0,
                  pageIndex === chapter.pages.length - 1,
                )}</div>`;

          if (page.opener) {
            return `
    <section class="sheet">
      <div class="hero">
        <img class="bleed" src="img/hero-${esc(chapter.hero)}.jpg" alt="" />
        <div class="hero__veil"></div>
        <div class="hero__text">
          <span class="hero__num">${pad2(chapter.number)}</span>
          <div>
            <h2 class="hero__title">${esc(chapter.cat.name)}</h2>
            <p class="hero__lead">${esc(chapter.lead)} · ${chapter.items.length} itens</p>
          </div>
        </div>
      </div>
      <div class="sheet__body sheet__body--opener">${grid}</div>
      ${renderFooter(pageNumber, menuCfg)}
    </section>`;
          }

          return `
    <section class="sheet">
      <header class="sheet__header">
        <span>Prainha Rooftop</span>
        <span>${esc(chapter.cat.name)}</span>
      </header>
      <div class="sheet__body">${grid}</div>
      ${renderFooter(pageNumber, menuCfg)}
    </section>`;
        })
        .join(''),
    )
    .join('');

  const policies = info.policies || {};
  const closing = `
    <section class="sheet sheet--closing">
      <img class="bleed" src="img/capa.jpg" alt="" />
      <div class="closing__veil"></div>
      <div class="closing__block">
        <span class="hairline"></span>
        <p class="closing__brand">Prainha</p>
        <p class="closing__sub">Rooftop</p>
        <p class="closing__tagline">${esc(info.description)}</p>
        <p class="closing__menu">${esc(menuCfg.kicker)} ${esc(menuCfg.title)}</p>
        <div class="closing__qrs">
          ${
            qr['whatsapp.png']
              ? `<div class="qr"><img src="img/whatsapp.png" alt="" /><span>Pedir no<br />WhatsApp</span></div>`
              : ''
          }
          ${
            qr['cardapio.png']
              ? `<div class="qr"><img src="img/cardapio.png" alt="" /><span>Cardápio<br />online</span></div>`
              : ''
          }
        </div>
        <p class="closing__contact">${esc(info.contact.instagram)} &nbsp;·&nbsp; ${esc(info.contact.phone)}</p>
        <ul class="closing__policies">
          ${policies.serviceChargeSuggestion ? `<li>${esc(policies.serviceChargeSuggestion)}</li>` : ''}
          ${policies.couvertArtistico ? `<li>${esc(policies.couvertArtistico)}</li>` : ''}
          ${policies.adicionaisNote ? `<li>${esc(policies.adicionaisNote)}</li>` : ''}
        </ul>
      </div>
      <p class="closing__version">Preços sujeitos a alteração · edição ${esc(data.meta.version.replace('-online', ''))}</p>
    </section>`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${esc(info.name)} — ${esc(menuCfg.title)}</title>
    <link rel="stylesheet" href="fontes/fontes.css" />
    <style>${css(menuCfg)}</style>
  </head>
  <body>${cover}${toc}${content}${closing}
  </body>
</html>`;

  return { html, totalPages: closingPage, chapters };
}

function css(menuCfg) {
  const g2 = LAYOUT.grid[2];
  const g3 = LAYOUT.grid[3];
  return `
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --ink: #0B0F11;
      --surface: #161F23;
      --line: #2B383E;
      --white: #F6F7F5;
      --muted: #94A4AA;
      --accent: ${menuCfg.accent};
      --accent-light: ${menuCfg.accentLight};
      --accent-rgb: ${menuCfg.accentRgb};
    }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { background: var(--ink); color: var(--white); font-family: 'Source Sans 3', 'Segoe UI', sans-serif; }

    .sheet {
      position: relative;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
      background: var(--ink);
      break-after: page;
      page-break-after: always;
    }
    .sheet:last-child { break-after: auto; page-break-after: auto; }
    .sheet::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(120% 55% at 50% -12%, rgba(var(--accent-rgb), 0.10), transparent 62%),
        radial-gradient(90% 45% at 112% 112%, rgba(var(--accent-rgb), 0.08), transparent 60%);
    }
    .sheet--cover::before, .sheet--closing::before { display: none; }

    .bleed { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .hairline { display: block; width: 18mm; height: 0.6mm; background: var(--accent); }

    .sheet__header, .sheet__footer {
      position: absolute;
      left: 13mm;
      right: 13mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 6.6pt;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .sheet__header { top: 0; height: ${LAYOUT.headerH}mm; padding-bottom: 4mm; border-bottom: 0.25mm solid var(--line); }
    .sheet__footer { bottom: 0; height: ${LAYOUT.footerH}mm; padding-top: 4mm; border-top: 0.25mm solid var(--line); }
    .sheet__page {
      font-family: Oswald, sans-serif;
      font-size: 9pt;
      letter-spacing: 0.06em;
      color: var(--accent-light);
    }
    .sheet__body {
      position: absolute;
      left: 13mm;
      right: 13mm;
      top: ${LAYOUT.headerH}mm;
      bottom: ${LAYOUT.footerH}mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .sheet__body--opener { top: ${LAYOUT.heroH + LAYOUT.heroGap}mm; }
    .sheet__body--toc { justify-content: flex-start; }

    /* ---------- capa ---------- */
    .cover__veil {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg,
        rgba(11,15,17,0) 26%,
        rgba(11,15,17,0.45) 44%,
        rgba(11,15,17,0.93) 63%,
        var(--ink) 78%);
    }
    .cover__thumbs {
      position: absolute;
      left: 16mm; right: 16mm; top: 168mm;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4mm;
    }
    .cover__thumbs img {
      width: 100%;
      height: 34mm;
      object-fit: cover;
      border-radius: 1.5mm;
      border: 0.3mm solid rgba(var(--accent-rgb), 0.55);
    }
    .cover__block { position: absolute; left: 16mm; right: 16mm; top: 210mm; }
    .cover__kicker {
      margin-top: 5mm;
      font-size: 8pt;
      letter-spacing: 0.42em;
      text-transform: uppercase;
      color: var(--accent-light);
    }
    .cover__title {
      font-family: Oswald, sans-serif;
      font-weight: 700;
      font-size: 41pt;
      line-height: 1.02;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      margin-top: 1mm;
    }
    .cover__lead { margin-top: 3mm; font-size: 11pt; font-weight: 300; color: #D6DEE1; }
    .cover__meta {
      position: absolute;
      left: 0;
      top: 56mm;
      font-size: 7.6pt;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--muted);
    }

    /* ---------- sumário ---------- */
    .eyebrow {
      font-size: 7.4pt;
      letter-spacing: 0.34em;
      text-transform: uppercase;
      color: var(--accent-light);
    }
    .toc__title {
      font-family: Oswald, sans-serif;
      font-weight: 600;
      font-size: 27pt;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      margin: 2mm 0 9mm;
    }
    .toc {
      list-style: none;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      padding-bottom: 6mm;
    }
    .toc--tight { flex: 0 0 auto; padding-bottom: 0; }
    .toc--tight li + li { margin-top: 6mm; }
    .toc li {
      display: flex;
      align-items: baseline;
      gap: 3mm;
      padding-bottom: 3.4mm;
      border-bottom: 0.25mm solid var(--line);
    }
    .toc__highlights {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 6mm;
    }
    .toc__highlights figure { flex: 1; }
    .toc__highlights img {
      width: 100%;
      height: 42mm;
      object-fit: cover;
      border-radius: 1.8mm;
      border: 0.25mm solid var(--line);
    }
    .toc__highlights figcaption {
      margin-top: 2.6mm;
      font-size: 7pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--accent-light);
    }
    .toc__num { font-family: Oswald, sans-serif; font-size: 8.4pt; color: var(--accent); width: 8mm; }
    .toc__name {
      font-family: Oswald, sans-serif;
      font-weight: 500;
      font-size: 12pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .toc__dots { flex: 1; border-bottom: 0.25mm dotted #3A4A51; transform: translateY(-1mm); }
    .toc__count { font-size: 7.4pt; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
    .toc__page { font-family: Oswald, sans-serif; font-size: 12pt; color: var(--accent-light); width: 9mm; text-align: right; }
    .toc__foot {
      display: flex;
      align-items: center;
      gap: 8mm;
      padding-top: 7mm;
      border-top: 0.25mm solid var(--line);
    }
    .toc__note { font-size: 8.6pt; line-height: 1.5; color: var(--muted); font-weight: 300; }

    .qr { display: flex; align-items: center; gap: 3mm; }
    .qr img { width: 24mm; height: 24mm; border-radius: 1.2mm; background: #fff; padding: 1mm; }
    .qr span {
      font-size: 7.2pt;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent-light);
      line-height: 1.5;
    }
    .qr--small img { width: 21mm; height: 21mm; }

    /* ---------- abertura de capítulo ---------- */
    .hero { position: absolute; top: 0; left: 0; right: 0; height: ${LAYOUT.heroH}mm; overflow: hidden; }
    .hero__veil {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(11,15,17,0.15) 30%, rgba(11,15,17,0.82) 78%, var(--ink) 100%);
    }
    .hero__text {
      position: absolute;
      left: 13mm; right: 13mm; bottom: 8mm;
      display: flex;
      align-items: flex-end;
      gap: 5mm;
    }
    .hero__num {
      font-family: Oswald, sans-serif;
      font-weight: 700;
      font-size: 30pt;
      line-height: 0.8;
      color: transparent;
      -webkit-text-stroke: 0.35mm var(--accent);
    }
    .hero__title {
      font-family: Oswald, sans-serif;
      font-weight: 700;
      font-size: 26pt;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .hero__lead {
      margin-top: 1.6mm;
      font-size: 8.4pt;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--accent-light);
    }

    /* ---------- grade ---------- */
    .grid { display: grid; width: 100%; }
    .grid--2 { grid-template-columns: repeat(2, 1fr); gap: ${g2.rowGap}mm ${g2.gap}mm; }
    .grid--3 { grid-template-columns: repeat(3, 1fr); gap: ${g3.rowGap}mm ${g3.gap}mm; }
    .group {
      grid-column: 1 / -1;
      height: ${LAYOUT.headingH}mm;
      display: flex;
      align-items: center;
      gap: 3mm;
      font-family: Oswald, sans-serif;
      font-weight: 500;
      font-size: 9.6pt;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      color: var(--accent-light);
    }
    .group::after { content: ''; flex: 1; height: 0.25mm; background: var(--line); }

    .card {
      position: relative;
      overflow: hidden;
      background: var(--surface);
      border: 0.25mm solid var(--line);
      border-radius: 2.4mm;
      display: flex;
      flex-direction: column;
    }
    .card--2 { height: ${g2.cardH}mm; }
    .card--3 { height: ${g3.cardH}mm; }
    .card__media { position: relative; overflow: hidden; }
    .card--2 .card__media { height: 55mm; }
    .card--3 .card__media { height: 38mm; }
    .card__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .card__media::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(11,15,17,0) 55%, rgba(11,15,17,0.72) 100%);
    }
    .card__prices {
      position: absolute;
      left: 3mm;
      bottom: 2.6mm;
      display: flex;
      align-items: center;
      gap: 1.6mm;
      z-index: 2;
    }
    .pill {
      display: inline-block;
      border-radius: 6mm;
      background: rgba(11,15,17,0.86);
      border: 0.25mm solid rgba(var(--accent-rgb), 0.6);
      font-family: Oswald, sans-serif;
      color: var(--accent-light);
    }
    .card--2 .pill--price { padding: 0.9mm 2.6mm; font-size: 10pt; }
    .card--3 .pill--price { padding: 0.7mm 2.2mm; font-size: 8.6pt; }
    .pill--second {
      font-family: 'Source Sans 3', sans-serif;
      font-size: 6.4pt;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #C9D5D9;
      border-color: rgba(255,255,255,0.18);
    }
    .card--2 .pill--second { padding: 1mm 2.2mm; }
    .card--3 .pill--second { padding: 0.8mm 1.8mm; font-size: 5.8pt; }
    .card__badge {
      position: absolute;
      top: 3mm;
      left: 3mm;
      z-index: 2;
      padding: 1mm 2.4mm;
      border-radius: 6mm;
      background: var(--accent);
      color: #10161A;
      font-family: Oswald, sans-serif;
      font-size: 6.8pt;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .card__body {
      flex: 1;
      padding: 3mm 3.4mm;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .card__name {
      font-family: Oswald, sans-serif;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      color: var(--white);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card--2 .card__name { font-size: 10pt; line-height: 1.12; -webkit-line-clamp: 2; }
    .card--3 .card__name { font-size: 8.2pt; line-height: 1.12; -webkit-line-clamp: 2; }
    .card__desc {
      margin-top: 1.4mm;
      color: var(--muted);
      font-weight: 300;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card--2 .card__desc { font-size: 7.6pt; line-height: 1.32; -webkit-line-clamp: 3; }
    .card--3 .card__desc { font-size: 6.6pt; line-height: 1.28; -webkit-line-clamp: 2; }

    .card--wide { grid-column: 1 / -1; flex-direction: row; }
    .card--wide .card__media { width: 52%; height: 100%; }
    .card--wide .card__body { width: 48%; padding: 6mm 7mm; }
    .card--wide .card__name { font-size: 13pt; line-height: 1.1; }
    .card--wide .card__desc { font-size: 8.4pt; line-height: 1.45; -webkit-line-clamp: 4; margin-top: 2.5mm; }

    /* ---------- card destaque (capítulo de um item) ---------- */
    .feature {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      height: 112mm;
      overflow: hidden;
      background: var(--surface);
      border: 0.25mm solid var(--line);
      border-radius: 2.4mm;
    }
    .feature__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .feature__body { padding: 12mm 10mm; display: flex; flex-direction: column; justify-content: center; }
    .feature__name {
      font-family: Oswald, sans-serif;
      font-weight: 600;
      font-size: 21pt;
      line-height: 1.05;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .feature__desc { margin-top: 5mm; font-size: 9.6pt; line-height: 1.55; color: var(--muted); font-weight: 300; }
    .feature__price {
      margin-top: 9mm;
      font-family: Oswald, sans-serif;
      font-size: 19pt;
      color: var(--accent-light);
    }

    /* ---------- página final ---------- */
    .closing__veil {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(11,15,17,0.90) 0%, rgba(11,15,17,0.95) 45%, rgba(11,15,17,0.985) 100%);
    }
    .closing__block {
      position: absolute;
      left: 20mm;
      right: 20mm;
      top: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .closing__menu {
      margin-top: 3mm;
      font-size: 7.6pt;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: var(--accent);
    }
    .closing__brand {
      font-family: Oswald, sans-serif;
      font-weight: 700;
      font-size: 40pt;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 6mm;
    }
    .closing__sub {
      font-family: Oswald, sans-serif;
      font-weight: 400;
      font-size: 16pt;
      letter-spacing: 0.52em;
      text-transform: uppercase;
      color: var(--accent-light);
    }
    .closing__tagline { margin-top: 9mm; font-size: 11pt; font-weight: 300; line-height: 1.6; color: #D6DEE1; max-width: 120mm; }
    .closing__qrs { margin-top: 13mm; display: flex; gap: 16mm; }
    .closing__contact {
      margin-top: 14mm;
      font-family: Oswald, sans-serif;
      font-size: 12pt;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent-light);
    }
    .closing__policies { margin-top: 6mm; list-style: none; }
    .closing__policies li {
      font-size: 8pt;
      line-height: 1.7;
      color: var(--muted);
      font-weight: 300;
      padding-left: 4mm;
      position: relative;
    }
    .closing__policies li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 1.7mm;
      width: 1.6mm;
      height: 1.6mm;
      border-radius: 50%;
      background: var(--accent);
    }
    .closing__version {
      position: absolute;
      left: 20mm;
      bottom: 16mm;
      font-size: 7pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #6D7C82;
    }
  `;
}

async function renderPdf(browser, htmlPath, outPath, expectedPages) {
  const page = await browser.newPage();
  page.setDefaultTimeout(180000);
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'load', timeout: 180000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    await Promise.all(
      images.map((img) =>
        img.complete ? null : new Promise((res) => { img.onload = res; img.onerror = res; }),
      ),
    );
  });
  const broken = await page.evaluate(
    () => Array.from(document.images).filter((i) => !i.naturalWidth).map((i) => i.src),
  );
  if (broken.length) throw new Error(`imagens não carregadas: ${broken.slice(0, 5).join(', ')}`);

  await page.pdf({
    path: outPath,
    width: '210mm',
    height: '297mm',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
    pageRanges: `1-${expectedPages}`,
  });
  await page.close();
}

async function countPdfPages(file) {
  const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(file)), useSystemFonts: true })
    .promise;
  const pages = doc.numPages;
  await doc.destroy();
  return pages;
}

async function main() {
  const executablePath = CHROME_PATHS.find((p) => fs.existsSync(p));
  if (!executablePath) throw new Error('Chrome/Edge não encontrado');

  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/menu-data.json'), 'utf8'));
  const info = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/restaurant-info.json'), 'utf8'));

  fs.mkdirSync(BUILD, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--allow-file-access-from-files', '--font-render-hinting=none'],
    protocolTimeout: 600000,
  });

  const hasFonts = await ensureFonts(browser);
  if (hasFonts) {
    const dest = path.join(BUILD, 'fontes');
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(FONTS)) fs.copyFileSync(path.join(FONTS, file), path.join(dest, file));
  }
  const qr = await ensureQr(info);

  const cardIds = new Set();
  const heroIds = new Set();
  for (const menuCfg of MENUS) {
    for (const id of menuCfg.coverThumbs) cardIds.add(id);
    for (const highlight of menuCfg.tocHighlights || []) cardIds.add(highlight.id);
    for (const chapter of menuCfg.chapters) {
      heroIds.add(chapter.hero);
      for (const item of chapterContent(data, chapter.cat).items) cardIds.add(item.id);
    }
  }
  await prepareImages([...cardIds], [...heroIds], qr);

  for (const menuCfg of MENUS) {
    const { html, totalPages, chapters } = buildMenuHtml(menuCfg, data, info, qr);
    const htmlPath = path.join(BUILD, `${menuCfg.id}.html`);
    fs.writeFileSync(htmlPath, html);

    const outPath = path.join(OUTPUT, menuCfg.out);
    await renderPdf(browser, htmlPath, outPath, totalPages);
    const pages = await countPdfPages(outPath);
    const mb = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(1);
    fs.copyFileSync(outPath, path.join(ONLINE, menuCfg.out));

    console.log(`\n${menuCfg.title}: ${pages} páginas (previsto ${totalPages}) · ${mb} MB`);
    for (const chapter of chapters) {
      console.log(`  p.${pad2(chapter.startPage)} ${chapter.cat.name} — ${chapter.items.length} itens, ${chapter.pages.length} pág.`);
    }
    if (pages !== totalPages) console.warn('  atenção: contagem de páginas diferente do previsto');
  }

  await browser.close();
  console.log('\nPDFs em output/ e online/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
