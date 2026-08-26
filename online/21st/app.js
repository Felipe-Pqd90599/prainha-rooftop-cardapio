/**
 * Prainha Rooftop — Cardápio 21st
 * Dados: ../data/*.json (mesma fonte do cardápio principal)
 * Componentes 21st: Hero #8435, Menu Item Card #7794, Tabs #575, Dialog #378
 */

function formatPrice(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function imageSrc(item) {
  const file = item.image || `${item.id}.jpg`;
  return `../assets/fotos/${file}`;
}

function getBurgerCombo(meta) {
  return meta?.burgerCombo || null;
}

function getBurgerCategory(menu) {
  return menu?.categories?.find((c) => c.id === 'burgers' || c.comboUpgrade);
}

function itemHasComboUpgrade(itemId, menu) {
  if (itemId === 'combo-fritas-refri') return false;
  const combo = getBurgerCombo(menu?.meta);
  const burgers = getBurgerCategory(menu);
  if (!combo || !burgers?.items) return false;
  return burgers.items.some((i) => i.id === itemId);
}

function getCategoryItems(cat, menu) {
  if (cat.itemRefs?.length) {
    return cat.itemRefs.map((id) => findItemById(id)?.item).filter(Boolean);
  }
  return cat.items || [];
}

function getPortionOptions(item) {
  return item.portionOptions?.length ? item.portionOptions : null;
}

function hasMultiplePortions(item) {
  return item.priceSecondary != null || getPortionOptions(item);
}

function getDefaultPortionKey(item) {
  const opts = getPortionOptions(item);
  if (opts) {
    const highlighted = opts.find((o) => o.badge);
    return highlighted?.key || opts[opts.length - 1].key;
  }
  return 'primary';
}

function getPortionOptionLabel(item, portionKey) {
  const opts = getPortionOptions(item);
  if (opts) {
    const opt = opts.find((o) => o.key === portionKey);
    return opt?.label || portionKey;
  }
  return portionKey;
}

function getModalBasePrice(item, portionKey) {
  const opts = getPortionOptions(item);
  if (opts) {
    const opt = opts.find((o) => o.key === portionKey);
    return opt?.price ?? opts[opts.length - 1].price;
  }
  if (portionKey === 'secondary' && item.priceSecondary != null) {
    return item.priceSecondary;
  }
  return item.price;
}

function getModalPrice(item, portionKey, withCombo, meta) {
  let price = getModalBasePrice(item, portionKey);
  const combo = getBurgerCombo(meta);
  if (withCombo && combo) price += combo.price;
  return price;
}

function getPortionLabels(item, category, meta) {
  const primary =
    item.priceLabel ||
    category?.portionLabels?.primary ||
    meta?.priceLabelDefault ||
    '1 pessoa';
  const secondary =
    item.priceSecondaryLabel ||
    category?.portionLabels?.secondary ||
    meta?.priceSecondaryLabelDefault ||
    '2 pessoas';
  return { primary, secondary };
}

function buildWhatsAppLink(info, item, portionKey, meta, withCombo, category) {
  const phone = info.contact?.whatsapp || '558421313667';
  let portionText = '';
  const combo = getBurgerCombo(meta);
  const { primary, secondary } = getPortionLabels(item, category, meta);
  const opts = getPortionOptions(item);

  if (opts) {
    const opt = opts.find((o) => o.key === portionKey);
    if (opt) portionText = ` (${opt.label})`;
  } else if (portionKey === 'secondary' && item.priceSecondary != null) {
    portionText = ` (${secondary})`;
  } else if (item.priceSecondary != null) {
    portionText = ` (${primary})`;
  }

  let comboText = '';
  if (withCombo && combo) {
    comboText = ` + Combo (${combo.description || 'refri lata + batata frita'})`;
  }

  const price = getModalPrice(item, portionKey, withCombo, meta);
  const text = encodeURIComponent(
    `Olá! Quero pedir: ${item.name}${portionText}${comboText} — ${formatPrice(price)}. Vi no cardápio do Prainha Rooftop.`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

function buildWhatsAppLinkGeneral(info) {
  const phone = info.contact?.whatsapp || '558421313667';
  const text = encodeURIComponent(
    'Olá! Vi o cardápio do Prainha Rooftop e gostaria de fazer um pedido.'
  );
  return `https://wa.me/${phone}?text=${text}`;
}

let appState = {
  menu: null,
  info: null,
  modalItem: null,
  modalCategory: null,
  modalPortion: 'primary',
  modalCombo: false,
};

async function loadData() {
  const [menu, info, tokens] = await Promise.all([
    fetch('../data/menu-data.json').then((r) => r.json()),
    fetch('../data/restaurant-info.json').then((r) => r.json()),
    fetch('../data/design-tokens.json').then((r) => r.json()),
  ]);
  return { menu, info, tokens };
}

/** Tema claro 21st — azul/branco Prainha; não usa o tema escuro de design-tokens.json */
const LIGHT_21ST_COLORS = {
  background: 'transparent',
  backgroundHero: 'transparent',
  surface: '#ffffff',
  surfaceElevated: '#f5f9fc',
  primary: '#5BB5C9',
  accent: '#7EC8E3',
  text: '#1e3a4f',
  textMuted: '#5a6b7a',
  price: '#8B7049',
  border: '#c5dce8',
  footerBg: 'rgba(255, 255, 255, 0.92)',
};

function applyTokens(tokens) {
  const c = LIGHT_21ST_COLORS;
  const t = tokens.typography;
  const root = document.documentElement;
  root.style.setProperty('--bg', c.background);
  root.style.setProperty('--hero', c.backgroundHero);
  root.style.setProperty('--surface', c.surface);
  root.style.setProperty('--card', c.surface);
  root.style.setProperty('--surface-elevated', c.surfaceElevated);
  root.style.setProperty('--primary', c.primary);
  root.style.setProperty('--accent', c.accent);
  root.style.setProperty('--ring', c.primary);
  root.style.setProperty('--text', c.text);
  root.style.setProperty('--card-foreground', c.text);
  root.style.setProperty('--text-muted', c.textMuted);
  root.style.setProperty('--muted-foreground', c.textMuted);
  root.style.setProperty('--price', c.price);
  root.style.setProperty('--border', c.border);
  root.style.setProperty('--footer-bg', c.footerBg);
  if (t?.fontDisplay) root.style.setProperty('--font-display', t.fontDisplay);
  if (t?.fontBody) root.style.setProperty('--font-body', t.fontBody);
}

function findItemById(id) {
  if (!appState.menu) return null;
  for (const cat of appState.menu.categories) {
    if (!cat.items) continue;
    const item = cat.items.find((i) => i.id === id);
    if (item) return { item, category: cat };
  }
  return null;
}

function priceOverlayHtml(item, meta, category) {
  const opts = getPortionOptions(item);
  if (opts) {
    return opts
      .map(
        (opt) =>
          `<span class="menu-item-card__price-tag${opt.badge ? ' menu-item-card__price-tag--alt' : ''}">${formatPrice(opt.price)} <small>${opt.label}</small></span>`
      )
      .join('');
  }

  const { primary, secondary } = getPortionLabels(item, category, meta);
  const showPrimaryLabel = item.priceLabel || category?.portionLabels?.primary;
  let html = `<span class="menu-item-card__price-tag">${formatPrice(item.price)}${
    showPrimaryLabel && item.priceSecondary != null ? ` <small>${primary}</small>` : ''
  }</span>`;
  if (item.priceSecondary != null) {
    html += `<span class="menu-item-card__price-tag menu-item-card__price-tag--alt">${formatPrice(item.priceSecondary)} <small>${secondary}</small></span>`;
  }
  return html;
}

const HERO_FLOAT_ITEMS = [
  { id: 'camarao-prainha', className: 'floating-hero__float-img--1', alt: 'Camarão Prainha' },
  { id: 'burger-potiguar', className: 'floating-hero__float-img--2', alt: 'Burger Potiguar' },
  { id: 'taca-camarao-empanado', className: 'floating-hero__float-img--3', alt: 'Taça de Camarão' },
  { id: 'nordestino-na-area', className: 'floating-hero__float-img--4', alt: 'Nordestino na Área' },
];

function renderHero(info) {
  const container = document.getElementById('hero-images');
  container.innerHTML = HERO_FLOAT_ITEMS.map(
    (f) =>
      `<img class="floating-hero__float-img ${f.className}" src="../assets/fotos/${f.id}.jpg" alt="${f.alt}" loading="lazy" onerror="this.remove()" />`
  ).join('');

  const contact = document.getElementById('hero-contact');
  const ig = info.contact?.instagram || '@prainharooftop';
  const phone = info.contact?.phone || '(84) 2131-3667';
  contact.innerHTML = `
    <a href="https://instagram.com/${ig.replace('@', '')}" target="_blank" rel="noopener">${ig}</a>
    · ${phone}
  `;
  document.getElementById('btn-whatsapp').href = buildWhatsAppLinkGeneral(info);

  if (info.tagline) {
    document.getElementById('hero-title').textContent = info.tagline;
  }
}

function renderNav(categories) {
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  const track = document.getElementById('category-tabs-track');

  track.innerHTML = sorted
    .map(
      (cat) =>
        `<a href="#${cat.id}" class="category-tabs__tab" data-cat="${cat.id}">${cat.name}</a>`
    )
    .join('');

  const tabs = track.querySelectorAll('.category-tabs__tab');

  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(tab.dataset.cat);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.cat === entry.target.id));
        }
      });
    },
    { rootMargin: '-30% 0px -55% 0px' }
  );

  sorted.forEach((cat) => {
    const el = document.getElementById(cat.id);
    if (el) observer.observe(el);
  });

  if (tabs.length) tabs[0].classList.add('is-active');
}

function renderMenuItemCard(item, meta, options = {}) {
  const category = options.category;
  const src = imageSrc(item);
  const hasPortions = hasMultiplePortions(item);
  const { primary, secondary } = getPortionLabels(item, category, meta);
  const showCombo = options.showComboOffer && getBurgerCombo(meta);
  const combo = getBurgerCombo(meta);

  let hint = '';
  if (hasPortions || showCombo) {
    const hints = [];
    if (hasPortions) {
      const opts = getPortionOptions(item);
      hints.push(opts ? 'tamanho' : `${primary.toLowerCase()} ou ${secondary.toLowerCase()}`);
    }
    if (showCombo) hints.push('combo');
    hint = `<span class="menu-item-card__hint">Toque para escolher ${hints.join(' e ')}</span>`;
  }

  const comboOffer =
    showCombo && combo
      ? `<p class="menu-item-card__desc">+ Combo ${formatPrice(combo.price)} · ${combo.description}</p>`
      : '';

  return `
    <article
      class="menu-item-card"
      data-id="${item.id}"
      role="button"
      tabindex="0"
      aria-label="Ver ${item.name}"
    >
      <div class="menu-item-card__media">
        <img
          class="menu-item-card__photo"
          src="${src}"
          alt=""
          loading="lazy"
          onerror="this.closest('.menu-item-card').classList.add('menu-item-card--no-photo'); this.remove();"
        />
        <div class="menu-item-card__gradient" aria-hidden="true"></div>
        <div class="menu-item-card__price-overlay">${priceOverlayHtml(item, meta, category)}</div>
        <span class="menu-item-card__action" aria-hidden="true">Ver</span>
      </div>
      <div class="menu-item-card__body">
        <h3 class="menu-item-card__name">${item.name}</h3>
        ${item.description ? `<p class="menu-item-card__desc">${item.description}</p>` : ''}
        ${comboOffer}
        ${hint}
      </div>
    </article>`;
}

function renderMenu(menu) {
  const main = document.getElementById('menu');
  const sorted = [...menu.categories].sort((a, b) => a.order - b.order);
  const burgers = getBurgerCategory(menu);

  main.innerHTML = sorted
    .map((cat) => {
      const categoryItems = getCategoryItems(cat, menu);
      const isBurgersTab = cat.id === 'burgers';
      const items = categoryItems
        .map((item) =>
          renderMenuItemCard(item, menu.meta, {
            category: cat,
            showComboOffer:
              isBurgersTab &&
              item.id !== 'combo-fritas-refri' &&
              burgers?.items?.some((i) => i.id === item.id),
          })
        )
        .join('');
      const count = categoryItems.length;
      const featuredClass = cat.id === 'mais-vendidos' ? ' section--featured' : '';
      return `
        <section class="section${featuredClass}" id="${cat.id}">
          <header class="section__header">
            <h2 class="section__title">${cat.name}</h2>
            <span class="section__count">${count} itens</span>
          </header>
          <div class="section__grid">${items}</div>
        </section>`;
    })
    .join('');
}

function renderFooter(info) {
  const footer = document.getElementById('footer');
  const p = info.policies || {};
  footer.innerHTML = `
    <p><strong>${info.name}</strong> — ${info.tagline || ''}</p>
    <p>${info.contact?.instagram || ''} · ${info.contact?.phone || ''}</p>
    ${p.serviceChargeSuggestion ? `<p>${p.serviceChargeSuggestion}</p>` : ''}
    ${p.couvertArtistico ? `<p>${p.couvertArtistico}</p>` : ''}
    ${p.adicionaisNote ? `<p><em>${p.adicionaisNote}</em></p>` : ''}
  `;
}

function renderModalPortions(item, meta) {
  const container = document.getElementById('modal-portions');
  const category = appState.modalCategory;
  const { primary, secondary } = getPortionLabels(item, category, meta);
  const opts = getPortionOptions(item);
  const defaultKey = getDefaultPortionKey(item);

  if (!opts && item.priceSecondary == null) {
    container.innerHTML = '';
    return;
  }

  if (opts) {
    container.innerHTML = `
      <p class="item-dialog__portions-label">Escolha o tamanho:</p>
      <div class="portion-picker">
        ${opts
          .map(
            (opt) => `
          <button type="button" class="portion-picker__btn${opt.key === defaultKey ? ' is-selected' : ''}" data-portion="${opt.key}">
            <span class="portion-picker__name">${opt.label}</span>
            <span class="portion-picker__price">${formatPrice(opt.price)}</span>
            ${opt.badge ? `<span class="portion-picker__badge">${opt.badge}</span>` : ''}
          </button>`
          )
          .join('')}
      </div>`;
  } else {
    container.innerHTML = `
      <p class="item-dialog__portions-label">Escolha a opção:</p>
      <div class="portion-picker">
        <button type="button" class="portion-picker__btn is-selected" data-portion="primary">
          <span class="portion-picker__name">${primary}</span>
          <span class="portion-picker__price">${formatPrice(item.price)}</span>
        </button>
        <button type="button" class="portion-picker__btn" data-portion="secondary">
          <span class="portion-picker__name">${secondary}</span>
          <span class="portion-picker__price">${formatPrice(item.priceSecondary)}</span>
        </button>
      </div>`;
  }

  container.querySelectorAll('.portion-picker__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      appState.modalPortion = btn.dataset.portion;
      container.querySelectorAll('.portion-picker__btn').forEach((b) =>
        b.classList.toggle('is-selected', b === btn)
      );
      updateModalWhatsApp();
      updateModalPriceOverlay(item, meta);
    });
  });
}

function renderModalCombo(item, meta) {
  const container = document.getElementById('modal-combo');
  const combo = getBurgerCombo(meta);
  const show = itemHasComboUpgrade(item.id, appState.menu);

  if (!show || !combo) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  const label = combo.label || 'Transformar em Combo';

  container.innerHTML = `
    <p class="item-dialog__portions-label">${label}:</p>
    <div class="portion-picker combo-picker">
      <button type="button" class="portion-picker__btn is-selected" data-combo="false">
        <span class="portion-picker__name">Só o burger</span>
        <span class="portion-picker__price">${formatPrice(getModalBasePrice(item, appState.modalPortion))}</span>
      </button>
      <button type="button" class="portion-picker__btn" data-combo="true">
        <span class="portion-picker__name">Com combo</span>
        <span class="portion-picker__price">+ ${formatPrice(combo.price)}</span>
        <span class="portion-picker__detail">${combo.description}</span>
      </button>
    </div>`;

  container.querySelectorAll('.portion-picker__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      appState.modalCombo = btn.dataset.combo === 'true';
      container.querySelectorAll('.portion-picker__btn').forEach((b) =>
        b.classList.toggle('is-selected', b === btn)
      );
      updateModalWhatsApp();
      updateModalPriceOverlay(item, meta);
    });
  });
}

function updateModalPriceOverlay(item, meta) {
  const overlay = document.getElementById('modal-price-overlay');
  if (!overlay) return;

  const total = getModalPrice(item, appState.modalPortion, appState.modalCombo, meta);
  const combo = getBurgerCombo(meta);
  const category = appState.modalCategory;
  const { primary, secondary } = getPortionLabels(item, category, meta);

  let detail = '';
  const opts = getPortionOptions(item);
  if (opts) {
    detail = getPortionOptionLabel(item, appState.modalPortion);
  } else if (item.priceSecondary != null) {
    detail = appState.modalPortion === 'secondary' ? secondary : primary;
  }

  if (appState.modalCombo && combo) {
    detail = detail ? `${detail} · combo` : 'com combo';
  }

  overlay.innerHTML = `<span class="menu-item-card__price-tag">${formatPrice(total)}${detail ? ` <small>${detail}</small>` : ''}</span>`;
}

function updateModalWhatsApp() {
  const { modalItem: item, modalCategory, info, modalPortion, modalCombo, menu } = appState;
  if (!item || !info) return;
  const wa = document.getElementById('modal-wa');
  wa.href = buildWhatsAppLink(info, item, modalPortion, menu.meta, modalCombo, modalCategory);
}

function openItemModal(itemId) {
  const found = findItemById(itemId);
  if (!found) return;

  const { item, category } = found;
  const meta = appState.menu.meta;
  appState.modalItem = item;
  appState.modalCategory = category;
  appState.modalPortion = getDefaultPortionKey(item);
  appState.modalCombo = false;

  const modal = document.getElementById('item-modal');
  const img = document.getElementById('modal-img');
  img.src = imageSrc(item);
  img.alt = item.name;
  document.getElementById('modal-title').textContent = item.name;
  const desc = document.getElementById('modal-desc');
  desc.textContent = item.description || '';
  desc.hidden = !item.description;

  renderModalPortions(item, meta);
  renderModalCombo(item, meta);
  updateModalPriceOverlay(item, meta);
  updateModalWhatsApp();

  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  modal.querySelector('.item-dialog__close').focus();
}

function closeItemModal() {
  const modal = document.getElementById('item-modal');
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  appState.modalItem = null;
  appState.modalCategory = null;
  appState.modalCombo = false;
}

function bindItemInteractions() {
  document.getElementById('menu').addEventListener('click', (e) => {
    const card = e.target.closest('.menu-item-card[data-id]');
    if (!card) return;
    openItemModal(card.dataset.id);
  });

  document.getElementById('menu').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.menu-item-card[data-id]');
    if (!card) return;
    e.preventDefault();
    openItemModal(card.dataset.id);
  });

  document.querySelectorAll('[data-modal-close]').forEach((el) => {
    el.addEventListener('click', closeItemModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('item-modal').hidden) {
      closeItemModal();
    }
  });
}

async function init() {
  try {
    const { menu, info, tokens } = await loadData();
    appState.menu = menu;
    appState.info = info;
    applyTokens(tokens);
    renderHero(info);
    renderNav(menu.categories);
    renderMenu(menu);
    renderFooter(info);
    bindItemInteractions();
  } catch (err) {
    document.getElementById('menu').innerHTML =
      '<p style="padding:1rem;color:#5a6b7a">Erro ao carregar o cardápio. Tente novamente.</p>';
    console.error(err);
  }
}

init();
