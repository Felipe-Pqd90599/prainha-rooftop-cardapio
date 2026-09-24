/**
 * Gera os dois cardápios em PDF a partir de data/menu-data.json:
 *   - Gastronomia (comidas, sucos e diversos, sobremesas, adicionais)
 *   - Drinks & Bar (autorais, tradicionais, cervejas, doses e litros, vinhos)
 *
 * Tema claro "praia": areia, mar e branco. Capítulos correm em sequência na
 * mesma página para o cardápio não ficar longo demais.
 * Uso: npm run generate-menus
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

/** Medidas em milímetros — a paginação é calculada com estes valores. */
const LAYOUT = {
  pageH: 297,
  padX: 12,
  headerH: 14,
  footerH: 12,
  chapterH: 28,
  headingH: 11,
  featureH: 92,
  gapChapter: 8,
  gapHeading: 7,
  gapFeature: 6,
  grid: {
    3: { cols: 3, gap: 5, rowGap: 5, cardH: 63, photoH: 38 },
    4: { cols: 4, gap: 4.5, rowGap: 4.5, cardH: 49, photoH: 30 },
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
    accentDark: '#8C6E45',
    accentSoft: '#F3E9DA',
    tocTitle: 'O que servimos',
    tocNote:
      'Cozinha aberta todos os dias. Pratos para 2 pessoas trazem o segundo preço indicado. Aponte o QR e veja o cardápio sempre atualizado.',
    useFixedPages: true,
    fixedPagesFile: 'data/gastronomia-pdf-pages.json',
    chapters: [],
  },
  {
    id: 'drinks',
    out: 'cardapio-prainha-rooftop-drinks.pdf',
    kicker: 'Carta de',
    title: 'Drinks & Bar',
    lead: 'O pôr do sol da Prainha servido em taça',
    accent: '#2E9FB8',
    accentDark: '#1F7A90',
    accentSoft: '#E2F2F7',
    tocTitle: 'O que tem no bar',
    tocNote: 'Bar aberto até o fim da noite. Drinks preparados na hora e cervejas sempre geladas.',
    chapters: [
      { cat: 'drinks-autorais', cols: 3, photo: 'caipi-prainha', lead: 'Criações da casa, só daqui', star: true },
      { cat: 'drinks-tradicionais', cols: 3, photo: 'caipifruta', lead: 'Os clássicos que nunca falham' },
      { cat: 'cervejas', cols: 4, photo: 'balde-heineken', lead: 'Geladas, long necks e baldes' },
      { cat: 'doses-litros', cols: 4, photo: 'whisky-12-anos', lead: 'Destilados, doses e litros' },
      { cat: 'vinhos', cols: 3, photo: 'vinho-consultar', lead: 'Consulte os rótulos do dia' },
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

/** Recorta as fotos nos tamanhos usados pelo PDF (card e miniatura de capítulo). */
async function prepareImages(cardIds, chapterIds, qr) {
  const imgDir = path.join(BUILD, 'img');
  fs.mkdirSync(imgDir, { recursive: true });

  for (const id of cardIds) {
    const dest = path.join(imgDir, `card-${id}.jpg`);
    if (fs.existsSync(dest)) continue;
    const img = await Jimp.read(path.join(FOTOS, `${id}.jpg`));
    img.cover(600, 430).quality(74);
    await img.writeAsync(dest);
  }

  for (const id of chapterIds) {
    const dest = path.join(imgDir, `cap-${id}.jpg`);
    if (fs.existsSync(dest)) continue;
    const img = await Jimp.read(path.join(FOTOS, `${id}.jpg`));
    img.cover(560, 370).quality(78);
    await img.writeAsync(dest);
  }

  fs.copyFileSync(path.join(FOTOS, 'capa-prainha-rooftop.jpg'), path.join(imgDir, 'capa.jpg'));
  for (const name of Object.keys(qr)) {
    if (qr[name]) fs.copyFileSync(path.join(QRDIR, name), path.join(imgDir, name));
  }
  console.log(`imagens: ${cardIds.length} cards + ${chapterIds.length} capítulos`);
}

function findItem(menu, id) {
  for (const cat of menu.categories) {
    const item = (cat.items || []).find((i) => i.id === id);
    if (item) return item;
  }
  return null;
}

function loadGastronomiaPages(menu) {
  const raw = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/gastronomia-pdf-pages.json'), 'utf8'),
  );
  return raw.pages.map((page) => ({ ...page }));
}

function resolveBlockIds(menu, catId, block) {
  let ids = block.ids;
  if (ids === 'cat:all') {
    ids = chapterContent(menu, catId).items.map((i) => i.id);
  }
  if (block.exclude?.length) {
    ids = ids.filter((id) => !block.exclude.includes(id));
  }
  return ids;
}

function collectFixedPageCardIds(menu, pages) {
  const ids = new Set();
  for (const page of pages) {
    for (const block of page.blocks) {
      if (block.type === 'combo') {
        ids.add(block.id);
        continue;
      }
      if (!block.ids) continue;
      for (const id of resolveBlockIds(menu, page.cat, block)) ids.add(id);
    }
  }
  return ids;
}

function renderCompactGrid(items, cols, size = 'sm') {
  const sizeClass = size === 'md' ? ' compact-grid--md' : '';
  const rows = items
    .map(
      (item) => `
          <article class="compact-item">
            <img class="compact-item__thumb" src="img/card-${esc(item.id)}.jpg" alt="" />
            <div class="compact-item__text">
              <h3 class="compact-item__name">${esc(item.name)}</h3>
              ${item.description ? `<p class="compact-item__desc">${esc(item.description)}</p>` : ''}
              <p class="compact-item__price">${esc(priceLine(item))}</p>
            </div>
          </article>`,
    )
    .join('');
  return `<div class="compact-grid compact-grid--${cols}${sizeClass}">${rows}</div>`;
}

function renderComboCallout(menu, meta, itemId) {
  const item = findItem(menu, itemId);
  const combo = meta.burgerCombo;
  if (!item || !combo) return '';
  return `
        <aside class="combo-callout">
          <div class="combo-callout__badge">Opcional</div>
          <div class="combo-callout__body">
            <h3 class="combo-callout__title">${esc(combo.label || item.name)}</h3>
            <p class="combo-callout__desc">${esc(combo.description || item.description || '')}</p>
            <p class="combo-callout__price">+ ${esc(money(combo.price ?? item.price))}</p>
          </div>
        </aside>`;
}

function renderFixedPageBody(menu, meta, pageDef, starIds) {
  const html = [];
  let openCols = null;

  const closeGrid = () => {
    if (openCols) {
      html.push('</div>');
      openCols = null;
    }
  };

  for (const block of pageDef.blocks) {
    if (block.type === 'group') {
      closeGrid();
      html.push(`<h4 class="group">${esc(block.name)}</h4>`);
      continue;
    }
    if (block.type === 'combo') {
      closeGrid();
      html.push(renderComboCallout(menu, meta, block.id));
      continue;
    }

    const ids = resolveBlockIds(menu, pageDef.cat, block);
    const items = ids.map((id) => findItem(menu, id)).filter(Boolean);

    if (block.type === 'compact') {
      closeGrid();
      html.push(renderCompactGrid(items, block.cols || 2, block.size || 'sm'));
      continue;
    }

    if (block.type === 'grid') {
      if (block.feature && items.length === 1) {
        closeGrid();
        html.push(renderFeature(items[0]));
        continue;
      }
      const cols = block.cols || 3;
      closeGrid();
      html.push(`<div class="grid grid--${cols}">`);
      openCols = cols;
      for (const item of items) {
        html.push(renderCard(item, starIds.has(item.id) ? 'Mais pedido' : ''));
      }
      closeGrid();
    }
  }

  closeGrid();
  return html.join('');
}

function renderFixedChapterHeader(pageDef, menu, chapterMeta) {
  const { cat, items } = chapterContent(menu, pageDef.cat);
  if (pageDef.continued) {
    return `<p class="chapter__continued">${esc(cat.name)} — continuação</p>`;
  }
  return renderChapter({
    ...pageDef,
    cat,
    items,
    number: chapterMeta.number,
  });
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

/** Monta a sequência de blocos do cardápio inteiro (capítulos emendam na mesma página). */
function buildBlocks(chapters) {
  const blocks = [];
  for (const chapter of chapters) {
    blocks.push({ type: 'chapter', chapter, height: LAYOUT.chapterH, gapBefore: LAYOUT.gapChapter });
    if (chapter.items.length === 1) {
      blocks.push({
        type: 'feature',
        chapter,
        item: chapter.items[0],
        height: LAYOUT.featureH,
        gapBefore: LAYOUT.gapFeature,
      });
      continue;
    }
    const cfg = LAYOUT.grid[chapter.cols];
    for (const group of chapter.groups) {
      if (group.name) {
        blocks.push({ type: 'heading', chapter, name: group.name, height: LAYOUT.headingH, gapBefore: LAYOUT.gapHeading });
      }
      for (let i = 0; i < group.items.length; i += chapter.cols) {
        blocks.push({
          type: 'row',
          chapter,
          cols: chapter.cols,
          items: group.items.slice(i, i + chapter.cols),
          height: cfg.cardH,
          gapBefore: cfg.rowGap,
        });
      }
    }
  }
  return blocks;
}

/** Quebra os blocos em páginas, sem deixar título de capítulo/grupo órfão no pé. */
function paginate(blocks) {
  const usable = LAYOUT.pageH - LAYOUT.headerH - LAYOUT.footerH;
  const pages = [];
  let page = { blocks: [], free: usable };

  blocks.forEach((block, index) => {
    const gap = page.blocks.length ? block.gapBefore : 0;
    let needed = gap + block.height;

    // Cabeçalho precisa levar junto o primeiro bloco de conteúdo.
    if (block.type === 'chapter' || block.type === 'heading') {
      const next = blocks[index + 1];
      if (next) needed += next.gapBefore + next.height;
    }

    if (needed > page.free && page.blocks.length) {
      pages.push(page);
      page = { blocks: [], free: usable };
      page.free -= block.height;
    } else {
      page.free -= gap + block.height;
    }
    page.blocks.push(block);
  });

  pages.push(page);
  return pages;
}

function priceLine(item) {
  if (item.portionOptions?.length) {
    return item.portionOptions.map((o) => `${o.label} ${money(o.price)}`).join(' · ');
  }
  const parts = [money(item.price)];
  if (item.priceSecondary != null) {
    parts.push(`${item.priceSecondaryLabel || '2 pessoas'} ${money(item.priceSecondary)}`);
  }
  return parts.join(' · ');
}

function renderCard(item, badge) {
  return `
          <article class="card">
            <div class="card__media">
              <img src="img/card-${esc(item.id)}.jpg" alt="" />
              ${badge ? `<span class="card__badge">${esc(badge)}</span>` : ''}
            </div>
            <div class="card__body">
              <h3 class="card__name">${esc(item.name)}</h3>
              ${item.description ? `<p class="card__desc">${esc(item.description)}</p>` : ''}
              <p class="card__price">${esc(priceLine(item))}</p>
            </div>
          </article>`;
}

function renderFeature(item) {
  return `
        <article class="feature">
          <div class="feature__media"><img src="img/card-${esc(item.id)}.jpg" alt="" /></div>
          <div class="feature__body">
            <h3 class="feature__name">${esc(item.name)}</h3>
            ${item.description ? `<p class="feature__desc">${esc(item.description)}</p>` : ''}
            <p class="feature__price">${esc(priceLine(item))}</p>
          </div>
        </article>`;
}

function renderChapter(chapter) {
  return `
        <header class="chapter">
          <img class="chapter__photo" src="img/cap-${esc(chapter.photo)}.jpg" alt="" />
          <div class="chapter__text">
            <p class="chapter__num">${pad2(chapter.number)} — ${chapter.items.length} itens</p>
            <h2 class="chapter__title">${esc(chapter.cat.name)}</h2>
            <p class="chapter__lead">${esc(chapter.lead)}</p>
          </div>
        </header>`;
}

/** Junta linhas seguidas de mesmo número de colunas numa única grade. */
function renderPageBlocks(page, starIds) {
  const html = [];
  let open = null;
  for (const block of page.blocks) {
    if (block.type === 'row') {
      if (open !== block.cols) {
        if (open) html.push('</div>');
        html.push(`<div class="grid grid--${block.cols}">`);
        open = block.cols;
      }
      for (const item of block.items) {
        html.push(renderCard(item, starIds.has(item.id) ? 'Mais pedido' : ''));
      }
      continue;
    }
    if (open) {
      html.push('</div>');
      open = null;
    }
    if (block.type === 'chapter') html.push(renderChapter(block.chapter));
    else if (block.type === 'heading') html.push(`<h4 class="group">${esc(block.name)}</h4>`);
    else if (block.type === 'feature') html.push(renderFeature(block.item));
  }
  if (open) html.push('</div>');
  return html.join('');
}

function buildFixedMenuHtml(menuCfg, data, info, qr) {
  const pageDefs = loadGastronomiaPages(data);
  const firstContentPage = 3;
  const catFirstPage = new Map();
  const chaptersToc = [];
  const catSeen = new Set();

  pageDefs.forEach((pageDef, index) => {
    const pageNum = firstContentPage + index;
    if (!catSeen.has(pageDef.cat)) {
      catSeen.add(pageDef.cat);
      const { cat, items } = chapterContent(data, pageDef.cat);
      catFirstPage.set(pageDef.cat, pageNum);
      chaptersToc.push({
        cat,
        items,
        number: chaptersToc.length + 1,
        startPage: pageNum,
        lead: pageDef.lead,
        photo: pageDef.photo,
      });
    }
  });

  const starIds = new Set();
  const mv = pageDefs.find((p) => p.cat === 'mais-vendidos' && p.star);
  if (mv) {
    const first = chapterContent(data, 'mais-vendidos').items[0];
    if (first) starIds.add(first.id);
  }

  const cover = `
    <section class="sheet sheet--cover">
      <img class="cover__photo" src="img/capa.jpg" alt="" />
      <div class="cover__panel">
        <span class="rule"></span>
        <p class="cover__kicker">${esc(menuCfg.kicker)}</p>
        <h1 class="cover__title">${esc(menuCfg.title)}</h1>
        <p class="cover__lead">${esc(menuCfg.lead)}</p>
        <p class="cover__meta">${esc(info.contact.instagram)} &nbsp;·&nbsp; ${esc(info.contact.phone)} &nbsp;·&nbsp; Ponta Negra, Natal/RN</p>
      </div>
    </section>`;

  const toc = `
    <section class="sheet">
      ${pageHeader(menuCfg.title)}
      <div class="sheet__body sheet__body--toc">
        <p class="eyebrow">Sumário</p>
        <h2 class="toc__title">${esc(menuCfg.tocTitle)}</h2>
        <ol class="toc">${chaptersToc
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
          .join('')}</ol>
        <div class="toc__foot">
          <p class="toc__note">${esc(menuCfg.tocNote)}</p>
          ${qr['cardapio.png'] ? `<div class="qr"><img src="img/cardapio.png" alt="" /><span>Cardápio<br />online</span></div>` : ''}
        </div>
      </div>
      ${pageFooter(2)}
    </section>`;

  const chapterMetaByCat = Object.fromEntries(chaptersToc.map((c) => [c.cat.id, c]));

  const content = pageDefs
    .map((pageDef, index) => {
      const chapterMeta = chapterMetaByCat[pageDef.cat] || chaptersToc[0];
      const { cat } = chapterContent(data, pageDef.cat);
      const body =
        renderFixedChapterHeader(pageDef, data, chapterMeta) +
        renderFixedPageBody(data, data.meta, pageDef, starIds);
      return `
    <section class="sheet">
      ${pageHeader(cat.name)}
      <div class="sheet__body sheet__body--fixed">${body}</div>
      ${pageFooter(firstContentPage + index)}
    </section>`;
    })
    .join('');

  const policies = info.policies || {};
  const closing = `
    <section class="sheet sheet--closing">
      <img class="closing__photo" src="img/capa.jpg" alt="" />
      <div class="closing__panel">
        <span class="rule"></span>
        <p class="closing__brand">Prainha</p>
        <p class="closing__sub">Rooftop</p>
        <p class="closing__tagline">${esc(info.description)}</p>
        <div class="closing__qrs">
          ${qr['whatsapp.png'] ? `<div class="qr"><img src="img/whatsapp.png" alt="" /><span>Pedir no<br />WhatsApp</span></div>` : ''}
          ${qr['cardapio.png'] ? `<div class="qr"><img src="img/cardapio.png" alt="" /><span>Cardápio<br />online</span></div>` : ''}
          <p class="closing__contact">${esc(info.contact.instagram)}<br />${esc(info.contact.phone)}</p>
        </div>
        <ul class="closing__policies">
          ${policies.serviceChargeSuggestion ? `<li>${esc(policies.serviceChargeSuggestion)}</li>` : ''}
          ${policies.couvertArtistico ? `<li>${esc(policies.couvertArtistico)}</li>` : ''}
          ${policies.adicionaisNote ? `<li>${esc(policies.adicionaisNote)}</li>` : ''}
        </ul>
        <p class="closing__version">Preços sujeitos a alteração · edição ${esc(data.meta.version.replace('-online', ''))}</p>
      </div>
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

  const contentPages = pageDefs.length;
  return {
    html,
    totalPages: firstContentPage + contentPages,
    chapters: chaptersToc,
    pages: pageDefs,
  };
}

function buildMenuHtml(menuCfg, data, info, qr) {
  if (menuCfg.useFixedPages) return buildFixedMenuHtml(menuCfg, data, info, qr);

  const chapters = menuCfg.chapters.map((chapter, index) => {
    const { cat, items, groups } = chapterContent(data, chapter.cat);
    return { ...chapter, cat, items, groups, number: index + 1 };
  });

  const starIds = new Set(
    chapters.filter((c) => c.star && c.items[0]).map((c) => c.items[0].id),
  );

  const showToc = chapters.length >= 7;
  const firstContentPage = showToc ? 3 : 2;

  const pages = paginate(buildBlocks(chapters));
  for (const chapter of chapters) {
    const index = pages.findIndex((p) => p.blocks.some((b) => b.type === 'chapter' && b.chapter === chapter));
    chapter.startPage = firstContentPage + index;
  }

  const cover = `
    <section class="sheet sheet--cover">
      <img class="cover__photo" src="img/capa.jpg" alt="" />
      <div class="cover__panel">
        <span class="rule"></span>
        <p class="cover__kicker">${esc(menuCfg.kicker)}</p>
        <h1 class="cover__title">${esc(menuCfg.title)}</h1>
        <p class="cover__lead">${esc(menuCfg.lead)}</p>
        <p class="cover__meta">${esc(info.contact.instagram)} &nbsp;·&nbsp; ${esc(info.contact.phone)} &nbsp;·&nbsp; Ponta Negra, Natal/RN</p>
      </div>
    </section>`;

  const toc = showToc
    ? `
    <section class="sheet">
      ${pageHeader(menuCfg.title)}
      <div class="sheet__body sheet__body--toc">
        <p class="eyebrow">Sumário</p>
        <h2 class="toc__title">${esc(menuCfg.tocTitle)}</h2>
        <ol class="toc">${chapters
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
          .join('')}</ol>
        <div class="toc__foot">
          <p class="toc__note">${esc(menuCfg.tocNote)}</p>
          ${qr['cardapio.png'] ? `<div class="qr"><img src="img/cardapio.png" alt="" /><span>Cardápio<br />online</span></div>` : ''}
        </div>
      </div>
      ${pageFooter(2)}
    </section>`
    : '';

  const content = pages
    .map((page, index) => {
      const chapter = (page.blocks.find((b) => b.chapter) || {}).chapter;
      return `
    <section class="sheet">
      ${pageHeader(chapter ? chapter.cat.name : menuCfg.title)}
      <div class="sheet__body">${renderPageBlocks(page, starIds)}</div>
      ${pageFooter(firstContentPage + index)}
    </section>`;
    })
    .join('');

  const policies = info.policies || {};
  const closing = `
    <section class="sheet sheet--closing">
      <img class="closing__photo" src="img/capa.jpg" alt="" />
      <div class="closing__panel">
        <span class="rule"></span>
        <p class="closing__brand">Prainha</p>
        <p class="closing__sub">Rooftop</p>
        <p class="closing__tagline">${esc(info.description)}</p>
        <div class="closing__qrs">
          ${qr['whatsapp.png'] ? `<div class="qr"><img src="img/whatsapp.png" alt="" /><span>Pedir no<br />WhatsApp</span></div>` : ''}
          ${qr['cardapio.png'] ? `<div class="qr"><img src="img/cardapio.png" alt="" /><span>Cardápio<br />online</span></div>` : ''}
          <p class="closing__contact">${esc(info.contact.instagram)}<br />${esc(info.contact.phone)}</p>
        </div>
        <ul class="closing__policies">
          ${policies.serviceChargeSuggestion ? `<li>${esc(policies.serviceChargeSuggestion)}</li>` : ''}
          ${policies.couvertArtistico ? `<li>${esc(policies.couvertArtistico)}</li>` : ''}
          ${policies.adicionaisNote ? `<li>${esc(policies.adicionaisNote)}</li>` : ''}
        </ul>
        <p class="closing__version">Preços sujeitos a alteração · edição ${esc(data.meta.version.replace('-online', ''))}</p>
      </div>
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

  return { html, totalPages: firstContentPage + pages.length, chapters, pages };
}

function pageHeader(label) {
  return `
      <header class="sheet__header">
        <span>Prainha Rooftop</span>
        <span>${esc(label)}</span>
      </header>`;
}

function pageFooter(pageNumber) {
  return `
      <footer class="sheet__footer">
        <span>Ponta Negra · Natal/RN · @prainharooftop</span>
        <span class="sheet__page">${pad2(pageNumber)}</span>
      </footer>`;
}

function css(menuCfg) {
  const g3 = LAYOUT.grid[3];
  const g4 = LAYOUT.grid[4];
  return `
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --sand-bg: #FBF7F0;
      --paper: #FFFFFF;
      --ink: #123742;
      --ink-soft: #5E7279;
      --line: #E9DFCF;
      --sea: #7EC8E3;
      --accent: ${menuCfg.accent};
      --accent-dark: ${menuCfg.accentDark};
      --accent-soft: ${menuCfg.accentSoft};
    }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { background: var(--sand-bg); color: var(--ink); font-family: 'Source Sans 3', 'Segoe UI', sans-serif; }

    .sheet {
      position: relative;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
      background: var(--sand-bg);
      break-after: page;
      page-break-after: always;
    }
    .sheet:last-child { break-after: auto; page-break-after: auto; }
    .sheet::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1.4mm;
      background: linear-gradient(90deg, var(--accent) 0%, var(--sea) 100%);
    }
    .sheet--cover::before, .sheet--closing::before { display: none; }

    .rule { display: block; width: 16mm; height: 0.7mm; background: var(--accent); }

    .sheet__header, .sheet__footer {
      position: absolute;
      left: ${LAYOUT.padX}mm;
      right: ${LAYOUT.padX}mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 6.4pt;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--ink-soft);
    }
    .sheet__header { top: 0; height: ${LAYOUT.headerH}mm; padding: 3mm 0 3.5mm; border-bottom: 0.2mm solid var(--line); }
    .sheet__footer { bottom: 0; height: ${LAYOUT.footerH}mm; padding-top: 3.5mm; border-top: 0.2mm solid var(--line); }
    .sheet__page {
      font-family: Oswald, sans-serif;
      font-size: 9pt;
      letter-spacing: 0.04em;
      color: var(--accent-dark);
    }
    .sheet__body {
      position: absolute;
      left: ${LAYOUT.padX}mm;
      right: ${LAYOUT.padX}mm;
      top: ${LAYOUT.headerH}mm;
      bottom: ${LAYOUT.footerH}mm;
    }

    /* ---------- capa ---------- */
    .sheet--cover { background: var(--sand-bg); }
    .cover__photo {
      position: absolute;
      top: 0; left: 0;
      width: 210mm;
      height: 197mm;
      object-fit: cover;
      object-position: 50% 0%;
    }
    .cover__panel { position: absolute; top: 197mm; left: 0; right: 0; bottom: 0; padding: 14mm 18mm 0; }
    .cover__kicker {
      margin-top: 6mm;
      font-size: 8pt;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      color: var(--accent-dark);
    }
    .cover__title {
      margin-top: 1mm;
      font-family: Oswald, sans-serif;
      font-weight: 600;
      font-size: 38pt;
      line-height: 1.02;
      letter-spacing: 0.01em;
      text-transform: uppercase;
      color: var(--ink);
    }
    .cover__lead { margin-top: 3mm; font-size: 11pt; font-weight: 300; color: #4C6670; }
    .cover__meta {
      position: absolute;
      left: 18mm;
      bottom: 13mm;
      font-size: 7.4pt;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--ink-soft);
    }

    /* ---------- sumário ---------- */
    .sheet__body--toc { display: flex; flex-direction: column; }
    .eyebrow { font-size: 7.4pt; letter-spacing: 0.34em; text-transform: uppercase; color: var(--accent-dark); }
    .toc__title {
      font-family: Oswald, sans-serif;
      font-weight: 600;
      font-size: 26pt;
      text-transform: uppercase;
      letter-spacing: 0.01em;
      margin: 2mm 0 8mm;
    }
    .toc { list-style: none; flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; padding-bottom: 6mm; }
    .toc li { display: flex; align-items: baseline; gap: 3mm; padding-bottom: 3mm; border-bottom: 0.2mm solid var(--line); }
    .toc__num { font-family: Oswald, sans-serif; font-size: 8.4pt; color: var(--accent); width: 8mm; }
    .toc__name { font-family: Oswald, sans-serif; font-weight: 500; font-size: 12pt; text-transform: uppercase; letter-spacing: 0.03em; }
    .toc__dots { flex: 1; border-bottom: 0.2mm dotted #CFC3B0; transform: translateY(-1mm); }
    .toc__count { font-size: 7.2pt; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-soft); }
    .toc__page { font-family: Oswald, sans-serif; font-size: 12pt; color: var(--accent-dark); width: 9mm; text-align: right; }
    .toc__foot { display: flex; align-items: center; gap: 8mm; padding-top: 7mm; border-top: 0.2mm solid var(--line); }
    .toc__note { font-size: 8.6pt; line-height: 1.5; color: var(--ink-soft); font-weight: 300; }

    .qr { display: flex; align-items: center; gap: 3mm; }
    .qr img { width: 22mm; height: 22mm; border: 0.2mm solid var(--line); background: #fff; padding: 1mm; border-radius: 1.2mm; }
    .qr span { font-size: 7pt; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-dark); line-height: 1.5; }

    /* ---------- capítulo ---------- */
    .chapter {
      height: ${LAYOUT.chapterH}mm;
      display: flex;
      align-items: stretch;
      gap: 6mm;
      border-bottom: 0.3mm solid var(--line);
      padding-bottom: 3mm;
    }
    .chapter__photo { width: 44mm; height: 100%; object-fit: cover; border-radius: 2mm; }
    .chapter__text { display: flex; flex-direction: column; justify-content: center; }
    .chapter__num { font-size: 7pt; letter-spacing: 0.26em; text-transform: uppercase; color: var(--accent); }
    .chapter__title {
      font-family: Oswald, sans-serif;
      font-weight: 600;
      font-size: 19pt;
      line-height: 1.08;
      text-transform: uppercase;
      letter-spacing: 0.01em;
      margin-top: 1mm;
    }
    .chapter__lead { margin-top: 1mm; font-size: 8.4pt; font-weight: 300; color: var(--ink-soft); }

    .group {
      height: ${LAYOUT.headingH}mm;
      display: flex;
      align-items: center;
      gap: 3mm;
      font-family: Oswald, sans-serif;
      font-weight: 500;
      font-size: 9pt;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: var(--accent-dark);
    }
    .group::after { content: ''; flex: 1; height: 0.2mm; background: var(--line); }

    /* ---------- grade ---------- */
    .grid { display: grid; width: 100%; }
    .grid--3 { grid-template-columns: repeat(3, 1fr); gap: ${g3.rowGap}mm ${g3.gap}mm; }
    .grid--4 { grid-template-columns: repeat(4, 1fr); gap: ${g4.rowGap}mm ${g4.gap}mm; }

    /* Estes espaçamentos precisam bater com os gapBefore usados na paginação. */
    .sheet__body > .chapter { margin-top: ${LAYOUT.gapChapter}mm; }
    .sheet__body > .group { margin-top: ${LAYOUT.gapHeading}mm; }
    .sheet__body > .grid--3 { margin-top: ${g3.rowGap}mm; }
    .sheet__body > .grid--4 { margin-top: ${g4.rowGap}mm; }
    .sheet__body > .feature { margin-top: ${LAYOUT.gapFeature}mm; }
    .sheet__body > :first-child { margin-top: 0; }

    .card {
      position: relative;
      overflow: hidden;
      background: var(--paper);
      border: 0.2mm solid var(--line);
      border-radius: 2.4mm;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0.5mm 1.4mm rgba(18, 55, 66, 0.05);
    }
    .grid--3 .card { height: ${g3.cardH}mm; }
    .grid--4 .card { height: ${g4.cardH}mm; }
    .card__media { position: relative; overflow: hidden; }
    .grid--3 .card__media { height: ${g3.photoH}mm; }
    .grid--4 .card__media { height: ${g4.photoH}mm; }
    .card__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .card__badge {
      position: absolute;
      top: 2mm;
      left: 2mm;
      padding: 0.8mm 2mm;
      border-radius: 5mm;
      background: var(--accent);
      color: #fff;
      font-family: Oswald, sans-serif;
      font-size: 6pt;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .card__body { flex: 1; padding: 2.4mm 2.8mm 2.2mm; display: flex; flex-direction: column; overflow: hidden; }
    .card__name {
      flex: 0 0 auto;
      font-family: Oswald, sans-serif;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.01em;
      color: var(--ink);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .grid--3 .card__name { font-size: 8.6pt; line-height: 1.14; -webkit-line-clamp: 2; }
    .grid--4 .card__name { font-size: 7.6pt; line-height: 1.12; -webkit-line-clamp: 2; }
    /* desc encolhe para o preço nunca ser empurrado para fora do card */
    .card__desc {
      flex: 1 1 auto;
      min-height: 0;
      margin-top: 0.9mm;
      color: var(--ink-soft);
      font-weight: 300;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .grid--3 .card__desc { font-size: 6.8pt; line-height: 1.3; -webkit-line-clamp: 2; }
    .grid--4 .card__desc { font-size: 6.2pt; line-height: 1.24; -webkit-line-clamp: 1; }
    .card__price {
      flex: 0 0 auto;
      margin-top: auto;
      padding-top: 1.2mm;
      font-family: Oswald, sans-serif;
      color: var(--accent-dark);
      letter-spacing: 0.02em;
    }
    .grid--3 .card__price { font-size: 9pt; }
    .grid--4 .card__price { font-size: 8pt; }

    /* ---------- destaque (capítulo de um item) ---------- */
    .feature {
      display: grid;
      grid-template-columns: 1fr 1fr;
      height: ${LAYOUT.featureH}mm;
      overflow: hidden;
      background: var(--paper);
      border: 0.2mm solid var(--line);
      border-radius: 2.4mm;
      box-shadow: 0 0.5mm 1.4mm rgba(18, 55, 66, 0.05);
    }
    .feature__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .feature__body { padding: 10mm; display: flex; flex-direction: column; justify-content: center; }
    .feature__name { font-family: Oswald, sans-serif; font-weight: 600; font-size: 18pt; text-transform: uppercase; line-height: 1.08; }
    .feature__desc { margin-top: 4mm; font-size: 9pt; line-height: 1.5; color: var(--ink-soft); font-weight: 300; }
    .feature__price { margin-top: 6mm; font-family: Oswald, sans-serif; font-size: 16pt; color: var(--accent-dark); }

    .sheet__body--fixed > :first-child { margin-top: 0; }
    .chapter__continued {
      font-family: Oswald, sans-serif;
      font-size: 11pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--accent-dark);
      margin-bottom: 4mm;
      padding-bottom: 2mm;
      border-bottom: 0.2mm solid var(--line);
    }

    .compact-grid {
      display: grid;
      width: 100%;
      gap: 2.2mm 3mm;
      margin-top: 3mm;
    }
    .compact-grid--2 { grid-template-columns: repeat(2, 1fr); }
    .compact-item {
      display: flex;
      align-items: center;
      gap: 2.5mm;
      padding: 2mm 2.5mm;
      background: var(--paper);
      border: 0.2mm solid var(--line);
      border-radius: 2mm;
      min-height: 16mm;
    }
    .compact-grid--md .compact-item { min-height: 20mm; padding: 2.5mm 3mm; }
    .compact-item__thumb {
      width: 14mm;
      height: 14mm;
      object-fit: cover;
      border-radius: 1.4mm;
      flex-shrink: 0;
    }
    .compact-grid--md .compact-item__thumb { width: 17mm; height: 17mm; }
    .compact-item__text { min-width: 0; flex: 1; }
    .compact-item__name {
      font-family: Oswald, sans-serif;
      font-size: 7.8pt;
      line-height: 1.15;
      text-transform: uppercase;
      color: var(--ink);
    }
    .compact-grid--md .compact-item__name { font-size: 8.6pt; }
    .compact-item__desc {
      margin-top: 0.5mm;
      font-size: 6.2pt;
      line-height: 1.25;
      color: var(--ink-soft);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .compact-item__price {
      margin-top: 0.8mm;
      font-family: Oswald, sans-serif;
      font-size: 8pt;
      color: var(--accent-dark);
    }

    .combo-callout {
      margin-top: 5mm;
      display: flex;
      align-items: stretch;
      gap: 4mm;
      padding: 4mm 5mm;
      border-radius: 2.4mm;
      border: 0.35mm solid var(--accent);
      background: linear-gradient(135deg, var(--accent-soft) 0%, #fff 55%);
      box-shadow: 0 0.8mm 2mm rgba(18, 55, 66, 0.08);
    }
    .combo-callout__badge {
      align-self: flex-start;
      padding: 1mm 2.5mm;
      border-radius: 4mm;
      background: var(--accent);
      color: #fff;
      font-family: Oswald, sans-serif;
      font-size: 6.5pt;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .combo-callout__title {
      font-family: Oswald, sans-serif;
      font-size: 12pt;
      text-transform: uppercase;
      color: var(--ink);
    }
    .combo-callout__desc { margin-top: 1.5mm; font-size: 8pt; color: var(--ink-soft); line-height: 1.4; }
    .combo-callout__price {
      margin-top: 2mm;
      font-family: Oswald, sans-serif;
      font-size: 13pt;
      color: var(--accent-dark);
    }

    /* ---------- página final ---------- */
    .closing__photo { position: absolute; top: 0; left: 0; width: 210mm; height: 108mm; object-fit: cover; object-position: 50% 52%; }
    .closing__panel { position: absolute; top: 108mm; left: 0; right: 0; bottom: 0; padding: 14mm 18mm 0; }
    .closing__brand {
      margin-top: 6mm;
      font-family: Oswald, sans-serif;
      font-weight: 600;
      font-size: 34pt;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .closing__sub {
      font-family: Oswald, sans-serif;
      font-weight: 400;
      font-size: 14pt;
      letter-spacing: 0.5em;
      text-transform: uppercase;
      color: var(--accent-dark);
    }
    .closing__tagline { margin-top: 7mm; font-size: 10.5pt; font-weight: 300; line-height: 1.6; color: #4C6670; max-width: 130mm; }
    .closing__qrs { margin-top: 11mm; display: flex; align-items: center; gap: 12mm; }
    .closing__contact {
      font-family: Oswald, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink);
    }
    .closing__policies { margin-top: 11mm; list-style: none; }
    .closing__policies li {
      font-size: 8pt;
      line-height: 1.7;
      color: var(--ink-soft);
      font-weight: 300;
      padding-left: 4mm;
      position: relative;
    }
    .closing__policies li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 1.6mm;
      width: 1.4mm;
      height: 1.4mm;
      border-radius: 50%;
      background: var(--accent);
    }
    .closing__version {
      position: absolute;
      left: 18mm;
      bottom: 13mm;
      font-size: 7pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #A8B4B9;
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
  const chapterIds = new Set();
  for (const menuCfg of MENUS) {
    if (menuCfg.useFixedPages) {
      const pages = loadGastronomiaPages(data);
      for (const page of pages) chapterIds.add(page.photo);
      for (const id of collectFixedPageCardIds(data, pages)) cardIds.add(id);
    } else {
      for (const chapter of menuCfg.chapters) {
        chapterIds.add(chapter.photo);
        for (const item of chapterContent(data, chapter.cat).items) cardIds.add(item.id);
      }
    }
  }
  await prepareImages([...cardIds], [...chapterIds], qr);

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
      console.log(`  p.${pad2(chapter.startPage)} ${chapter.cat.name} — ${chapter.items.length} itens`);
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
