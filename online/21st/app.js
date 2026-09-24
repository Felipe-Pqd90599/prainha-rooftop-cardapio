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

function assetVersion() {
  return encodeURIComponent(appState.menu?.meta?.version || '1');
}

function imageSrc(item) {
  const file = item.image || `${item.id}.jpg`;
  return `../assets/fotos/${file}?v=${assetVersion()}`;
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

function renderCategoryGrids(cat, menu, itemRenderer) {
  const burgers = getBurgerCategory(menu);
  const isBurgersTab = cat.id === 'burgers';
  const renderOne = (item) =>
    itemRenderer(item, menu.meta, {
      category: cat,
      showComboOffer:
        isBurgersTab &&
        item.id !== 'combo-fritas-refri' &&
        burgers?.items?.some((i) => i.id === item.id),
    });

  const allItems = getCategoryItems(cat, menu);
  if (cat.groups?.length) {
    const byId = Object.fromEntries(allItems.map((item) => [item.id, item]));
    return cat.groups
      .map((group) => {
        const ids = group.itemIds || [];
        const featuredSet = new Set(group.featuredIds || []);
        const featured = (group.featuredIds || []).map((id) => byId[id]).filter(Boolean);
        const compact = ids
          .filter((id) => !featuredSet.has(id))
          .map((id) => byId[id])
          .filter(Boolean);
        if (!featured.length && !compact.length) return '';

        let grids = '';
        if (featured.length) {
          grids += `<div class="section__grid">${featured.map(renderOne).join('')}</div>`;
        }
        if (compact.length) {
          grids += `<div class="section__grid section__group-compact">${compact.map(renderOne).join('')}</div>`;
        }
        return `
          <div class="section__group">
            <h3 class="section__subtitle">${group.name}</h3>
            ${grids}
          </div>`;
      })
      .join('');
  }

  return `<div class="section__grid">${allItems.map(renderOne).join('')}</div>`;
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

const HERO_INSTAGRAM_ICON = `<svg class="hero-contact__ig-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="hero-ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fdf497"/>
      <stop offset="25%" stop-color="#fd5949"/>
      <stop offset="50%" stop-color="#d6249f"/>
      <stop offset="100%" stop-color="#285aeb"/>
    </linearGradient>
  </defs>
  <rect width="24" height="24" rx="7" fill="url(#hero-ig-gradient)"/>
  <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" stroke-width="1.75"/>
  <circle cx="17.25" cy="6.75" r="1.15" fill="#fff"/>
</svg>`;

const HERO_PHONE_ICON = `<svg class="hero-contact__phone-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z"/>
</svg>`;

function heroPhoneTelHref(info) {
  const wa = String(info.contact?.whatsapp || '').replace(/\D/g, '');
  if (wa) return `tel:+${wa.startsWith('55') ? wa : `55${wa}`}`;
  const digits = String(info.contact?.phone || '').replace(/\D/g, '');
  return digits ? `tel:+55${digits}` : 'tel:+558421313667';
}

function renderHeroContactMarkup(info) {
  const igRaw = info.contact?.instagram || '@prainharooftop';
  const igHandle = igRaw.startsWith('@') ? igRaw : `@${igRaw}`;
  const igUser = igRaw.replace('@', '');
  const phone = info.contact?.phone || '(84) 2131-3667';
  const telHref = heroPhoneTelHref(info);
  return `
    <div class="hero-contact__group" role="group" aria-label="Contato">
      <a class="hero-contact__chip" href="https://instagram.com/${igUser}" target="_blank" rel="noopener noreferrer" aria-label="Seguir no Instagram ${igHandle}">
        ${HERO_INSTAGRAM_ICON}
        <span class="hero-contact__chip-text">${igHandle}</span>
      </a>
      <a class="hero-contact__chip" href="${telHref}" aria-label="Ligar para ${phone}">
        ${HERO_PHONE_ICON}
        <span class="hero-contact__chip-text">${phone}</span>
      </a>
    </div>
  `;
}

function renderHero(info) {
  const container = document.getElementById('hero-images');
  container.innerHTML = HERO_FLOAT_ITEMS.map(
    (f) =>
      `<img class="floating-hero__float-img ${f.className}" src="../assets/fotos/${f.id}.jpg?v=${assetVersion()}" alt="${f.alt}" loading="lazy" onerror="this.remove()" />`
  ).join('');

  const contact = document.getElementById('hero-contact');
  contact.innerHTML = renderHeroContactMarkup(info);
  document.getElementById('btn-whatsapp').href = buildWhatsAppLinkGeneral(info);

  if (info.tagline) {
    document.getElementById('hero-title').textContent = info.tagline;
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getCategoryTabsBar() {
  return document.querySelector('.category-tabs');
}

function measureCategoryScrollOffset() {
  const bar = getCategoryTabsBar();
  const offsetPx = bar ? Math.ceil(bar.getBoundingClientRect().height + 10) : 72;
  document.documentElement.style.setProperty('--scroll-offset', `${offsetPx}px`);
  return offsetPx;
}

function scrollToCategory(catId) {
  const section = document.getElementById(catId);
  if (!section) return;

  const offset = measureCategoryScrollOffset();
  const top = section.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });

  const hash = `#${catId}`;
  if (history.replaceState) {
    history.replaceState(null, '', hash);
  } else {
    location.hash = catId;
  }
}

function setupCategorySectionSpy(sorted, tabs) {
  const sections = sorted.map((cat) => document.getElementById(cat.id)).filter(Boolean);
  if (!sections.length) return;

  let activeId = sections[0].id;
  let frame = 0;

  const setActive = (catId) => {
    if (!catId || catId === activeId) return;
    activeId = catId;
    tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.cat === catId));
    const tab = document.querySelector(`.category-tabs__tab[data-cat="${catId}"]`);
    tab?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  };

  const update = () => {
    frame = 0;
    if (document.body.classList.contains('modal-open')) return;

    const marker = measureCategoryScrollOffset() + 16;
    let current = sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= marker) {
        current = section.id;
      }
    }
    setActive(current);
  };

  tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.cat === activeId));
  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener('resize', () => {
    measureCategoryScrollOffset();
    update();
  });
  update();
}

function setupStickyTabsEnhancements() {
  const bar = getCategoryTabsBar();
  if (!bar) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    bar.classList.toggle('is-stuck', window.scrollY > 48);
  };
  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(update);
  }, { passive: true });
  update();
}

function setupBackToTop() {
  const button = document.getElementById('back-to-top');
  const hero = document.getElementById('topo');
  if (!button) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    const threshold = hero ? hero.offsetHeight * 0.45 : 280;
    const visible = window.scrollY > threshold;
    button.classList.toggle('is-visible', visible);
    button.setAttribute('aria-hidden', visible ? 'false' : 'true');
    button.tabIndex = visible ? 0 : -1;
  };

  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(update);
  }, { passive: true });
  update();

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
    if (history.replaceState) {
      history.replaceState(null, '', `${location.pathname}${location.search}`);
    }
  });
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
      scrollToCategory(tab.dataset.cat);
    });
  });

  measureCategoryScrollOffset();
  setupCategorySectionSpy(sorted, tabs);
  setupStickyTabsEnhancements();
  setupBackToTop();

  const hashId = location.hash.replace(/^#/, '');
  if (hashId && document.getElementById(hashId)) {
    requestAnimationFrame(() => scrollToCategory(hashId));
  }
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
    hint = `<span class="menu-item-card__tap-hint">Toque para escolher ${hints.join(' e ')}</span>`;
  }

  const comboOffer =
    showCombo && combo
      ? `<p class="menu-item-card__combo-offer">+ Combo ${formatPrice(combo.price)} · ${combo.description}</p>`
      : '';

  return `
    <article
      class="menu-item-card${hasPortions ? ' menu-item-card--has-portions' : ''}${showCombo ? ' menu-item-card--has-combo' : ''}"
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
        <div class="menu-item-card__price-overlay">${priceOverlayHtml(item, meta, category)}</div>
        ${hint}
      </div>
      <div class="menu-item-card__body">
        <h3 class="menu-item-card__name">${item.name}</h3>
        ${item.description ? `<p class="menu-item-card__desc">${item.description}</p>` : ''}
        ${comboOffer}
      </div>
    </article>`;
}

function renderMenu(menu) {
  const main = document.getElementById('menu');
  const sorted = [...menu.categories].sort((a, b) => a.order - b.order);

  main.innerHTML = sorted
    .map((cat) => {
      const count = getCategoryItems(cat, menu).length;
      const featuredClass = cat.id === 'mais-vendidos' ? ' section--featured' : '';
      const compactClass = cat.layout === 'compact' ? ' section--compact' : '';
      const note = cat.note ? `<p class="section__note">${cat.note}</p>` : '';
      return `
        <section class="section${featuredClass}${compactClass}" id="${cat.id}">
          <header class="section__header">
            <h2 class="section__title">${cat.name}</h2>
            <span class="section__count">${count} itens</span>
          </header>
          ${note}
          ${renderCategoryGrids(cat, menu, renderMenuItemCard)}
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
    const pickerClass =
      opts.length > 2 ? 'portion-picker portion-picker--multi' : 'portion-picker';
    container.innerHTML = `
      <p class="item-dialog__portions-label">Escolha o tamanho:</p>
      <div class="${pickerClass}">
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
    renderMenu(menu);
    renderNav(menu.categories);
    renderFooter(info);
    bindItemInteractions();
  } catch (err) {
    document.getElementById('menu').innerHTML =
      '<p style="padding:1rem;color:#5a6b7a">Erro ao carregar o cardápio. Tente novamente.</p>';
    console.error(err);
  }
}

init();
