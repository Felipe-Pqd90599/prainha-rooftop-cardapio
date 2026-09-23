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
  return `assets/fotos/${file}?v=${assetVersion()}`;
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
    return cat.itemRefs
      .map((id) => findItemById(id)?.item)
      .filter(Boolean);
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
        const cards = (group.itemIds || [])
          .map((id) => byId[id])
          .filter(Boolean)
          .map(renderOne)
          .join('');
        if (!cards) return '';
        return `
          <div class="section__group">
            <h3 class="section__subtitle">${group.name}</h3>
            <div class="section__grid">${cards}</div>
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
    fetch('data/menu-data.json').then((r) => r.json()),
    fetch('data/restaurant-info.json').then((r) => r.json()),
    fetch('data/design-tokens.json').then((r) => r.json()),
  ]);
  return { menu, info, tokens };
}

function applyTokens(tokens) {
  const c = tokens.colors;
  const t = tokens.typography;
  const root = document.documentElement;
  if (c.background) root.style.setProperty('--bg', c.background);
  if (c.backgroundHero) root.style.setProperty('--hero', c.backgroundHero);
  if (c.surface) root.style.setProperty('--surface', c.surface);
  if (c.surfaceElevated) root.style.setProperty('--surface-elevated', c.surfaceElevated);
  if (c.categoryHeaderBg) root.style.setProperty('--category-bg', c.categoryHeaderBg);
  if (c.categoryHeaderText) root.style.setProperty('--category-text', c.categoryHeaderText);
  if (c.primary) root.style.setProperty('--primary', c.primary);
  if (c.accent || c.primary) root.style.setProperty('--accent', c.accent || c.primary);
  if (c.accentSky) root.style.setProperty('--accent-sky', c.accentSky);
  if (c.accentSea) root.style.setProperty('--accent-sea', c.accentSea);
  if (c.text) root.style.setProperty('--text', c.text);
  if (c.textMuted) root.style.setProperty('--text-muted', c.textMuted);
  if (c.price) root.style.setProperty('--price', c.price);
  if (c.border) root.style.setProperty('--border', c.border);
  if (c.footerBg) root.style.setProperty('--footer-bg', c.footerBg);
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
          `<span class="item__price-tag${opt.badge ? ' item__price-tag--alt' : ''}">${formatPrice(opt.price)} <small>${opt.label}</small></span>`
      )
      .join('');
  }

  const { primary, secondary } = getPortionLabels(item, category, meta);
  const showPrimaryLabel = item.priceLabel || category?.portionLabels?.primary;
  let html = `<span class="item__price-tag">${formatPrice(item.price)}${
    showPrimaryLabel && item.priceSecondary != null ? ` <small>${primary}</small>` : ''
  }</span>`;
  if (item.priceSecondary != null) {
    html += `<span class="item__price-tag item__price-tag--alt">${formatPrice(item.priceSecondary)} <small>${secondary}</small></span>`;
  }
  return html;
}

function renderHero(info) {
  const bg = document.querySelector('.hero__bg');
  const img = new Image();
  img.onload = () => bg.classList.add('has-photo');
  img.onerror = () => {};
  img.src = `assets/fotos/capa-prainha-rooftop.jpg?v=${assetVersion()}`;

  const contact = document.getElementById('hero-contact');
  const ig = info.contact?.instagram || '@prainharooftop';
  const phone = info.contact?.phone || '(84) 2131-3667';
  contact.innerHTML = `
    <a href="https://instagram.com/${ig.replace('@', '')}" target="_blank" rel="noopener">${ig}</a>
    · ${phone}
  `;
  document.getElementById('btn-whatsapp').href = buildWhatsAppLinkGeneral(info);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isDesktopSidebarNav() {
  return window.matchMedia('(min-width: 1024px)').matches;
}

function getHorizontalCategoryNav() {
  return document.getElementById('category-nav');
}

function measureCategoryScrollOffset() {
  const nav = getHorizontalCategoryNav();
  const useHorizontal = nav && !isDesktopSidebarNav();
  const offsetPx = useHorizontal ? Math.ceil(nav.getBoundingClientRect().height + 10) : 16;
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

function syncActiveNavLink(catId) {
  const horizontal = document.querySelector(`#category-nav a[data-cat="${catId}"]`);
  if (horizontal && !isDesktopSidebarNav()) {
    horizontal.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }

  const sidebarLink = document.querySelector(`.menu-sidebar__nav a[data-cat="${catId}"]`);
  if (sidebarLink) {
    sidebarLink.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'nearest',
    });
  }
}

function setupCategorySectionSpy(sorted, allLinks) {
  const sections = sorted.map((cat) => document.getElementById(cat.id)).filter(Boolean);
  if (!sections.length) return;

  let activeId = sections[0].id;
  let frame = 0;

  const setActive = (catId) => {
    if (!catId || catId === activeId) return;
    activeId = catId;
    allLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.cat === catId));
    syncActiveNavLink(catId);
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

  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  allLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.cat === activeId));
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    measureCategoryScrollOffset();
    update();
  });
  update();
}

function bindCategoryNavigation(sorted) {
  const allLinks = document.querySelectorAll('#category-nav a, .menu-sidebar__nav a');
  allLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToCategory(link.dataset.cat);
    });
  });

  measureCategoryScrollOffset();
  setupCategorySectionSpy(sorted, allLinks);

  const hashId = location.hash.replace(/^#/, '');
  if (hashId && document.getElementById(hashId)) {
    requestAnimationFrame(() => scrollToCategory(hashId));
  }
}

function setupStickyNavEnhancements() {
  const nav = getHorizontalCategoryNav();
  if (!nav) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    nav.classList.toggle('is-stuck', window.scrollY > 48);
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!frame) frame = requestAnimationFrame(update);
    },
    { passive: true },
  );
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

  window.addEventListener(
    'scroll',
    () => {
      if (!frame) frame = requestAnimationFrame(update);
    },
    { passive: true },
  );
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
  const linksHtml = sorted
    .map((cat) => `<a href="#${cat.id}" data-cat="${cat.id}">${cat.name}</a>`)
    .join('');

  document.getElementById('category-nav').innerHTML = linksHtml;

  const sidebar = document.getElementById('menu-sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <p class="menu-sidebar__title">Comidas &amp; drinks</p>
      <nav class="menu-sidebar__nav" aria-label="Categorias">${linksHtml}</nav>
    `;
  }

  bindCategoryNavigation(sorted);
  setupStickyNavEnhancements();
  setupBackToTop();
}

function renderItem(item, meta, options = {}) {
  const category = options.category;
  const src = imageSrc(item);
  const hasPortions = hasMultiplePortions(item);
  const { primary, secondary } = getPortionLabels(item, category, meta);
  const showCombo = options.showComboOffer && getBurgerCombo(meta);
  const combo = getBurgerCombo(meta);
  const isComboCard = item.id === 'combo-fritas-refri';

  let tapHint = '';
  if (hasPortions || showCombo) {
    const hints = [];
    if (hasPortions) {
      const opts = getPortionOptions(item);
      hints.push(opts ? 'tamanho' : `${primary.toLowerCase()} ou ${secondary.toLowerCase()}`);
    }
    if (showCombo) hints.push('combo');
    tapHint = `<span class="item__tap-hint">Toque para escolher ${hints.join(' e ')}</span>`;
  }

  const comboOffer = showCombo
    ? `<p class="item__combo-offer">+ Combo ${formatPrice(combo.price)} · ${combo.description}</p>`
    : '';

  return `
    <article
      class="item${hasPortions ? ' item--has-portions' : ''}${showCombo ? ' item--has-combo' : ''}${isComboCard ? ' item--combo-card' : ''}"
      data-id="${item.id}"
      role="button"
      tabindex="0"
      aria-label="Ver ${item.name}"
    >
      <div class="item__media">
        <img
          class="item__photo"
          src="${src}"
          alt=""
          loading="lazy"
          onerror="this.closest('.item').classList.add('item--no-photo'); this.remove();"
        />
        <div class="item__price-overlay">${priceOverlayHtml(item, meta, category)}</div>
        ${tapHint}
      </div>
      <div class="item__body">
        <span class="item__name">${item.name}</span>
        ${item.description ? `<p class="item__desc">${item.description}</p>` : ''}
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
          ${renderCategoryGrids(cat, menu, renderItem)}
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
      <p class="item-modal__portions-label">Escolha o tamanho:</p>
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
      <p class="item-modal__portions-label">Escolha a opção:</p>
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
    <p class="item-modal__portions-label">${label}:</p>
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

  const total = getModalPrice(
    item,
    appState.modalPortion,
    appState.modalCombo,
    meta
  );
  const combo = getBurgerCombo(meta);
  const category = appState.modalCategory;
  const { primary, secondary } = getPortionLabels(item, category, meta);

  let detail = '';
  const opts = getPortionOptions(item);
  if (opts) {
    detail = getPortionOptionLabel(item, appState.modalPortion);
  } else if (item.priceSecondary != null) {
    detail =
      appState.modalPortion === 'secondary' ? secondary : primary;
  }

  if (appState.modalCombo && combo) {
    detail = detail ? `${detail} · combo` : 'com combo';
  }

  overlay.innerHTML = `<span class="item__price-tag">${formatPrice(total)}${detail ? ` <small>${detail}</small>` : ''}</span>`;
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
  document.getElementById('modal-desc').textContent = item.description || '';
  document.getElementById('modal-desc').hidden = !item.description;

  renderModalPortions(item, meta);
  renderModalCombo(item, meta);
  updateModalPriceOverlay(item, meta);
  updateModalWhatsApp();

  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  document.getElementById('item-modal').querySelector('.item-modal__close').focus();
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
    const card = e.target.closest('.item[data-id]');
    if (!card) return;
    openItemModal(card.dataset.id);
  });

  document.getElementById('menu').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.item[data-id]');
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
      '<p style="padding:1rem;color:#a3a3a3">Erro ao carregar o cardápio. Tente novamente.</p>';
    console.error(err);
  }
}

init();
