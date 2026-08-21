function formatPrice(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatPrices(item, meta) {
  const parts = [formatPrice(item.price)];
  if (item.priceSecondary != null) {
    const label =
      item.priceSecondaryLabel || meta.priceSecondaryLabelDefault || '2 pessoas';
    parts.push(`${formatPrice(item.priceSecondary)} (${label})`);
  }
  return parts.join(' · ');
}

function imageSrc(item) {
  const file = item.image || `${item.id}.jpg`;
  return `assets/fotos/${file}`;
}

function buildWhatsAppLink(info) {
  const phone = info.contact?.whatsapp || '558421313667';
  const text = encodeURIComponent(
    'Olá! Vi o cardápio do Prainha Rooftop e gostaria de fazer um pedido.'
  );
  return `https://wa.me/${phone}?text=${text}`;
}

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
  const root = document.documentElement;
  if (c.background) root.style.setProperty('--bg', c.background);
  if (c.backgroundHero) root.style.setProperty('--hero', c.backgroundHero);
  if (c.categoryHeaderBg) root.style.setProperty('--category-bg', c.categoryHeaderBg);
  if (c.categoryHeaderText) root.style.setProperty('--category-text', c.categoryHeaderText);
  if (c.text) root.style.setProperty('--text', c.text);
  if (c.textMuted) root.style.setProperty('--text-muted', c.textMuted);
  if (c.price) root.style.setProperty('--price', c.price);
  if (c.border) root.style.setProperty('--border', c.border);
  if (c.footerBg) root.style.setProperty('--footer-bg', c.footerBg);
}

function renderHero(info) {
  const bg = document.querySelector('.hero__bg');
  const img = new Image();
  img.onload = () => bg.classList.add('has-photo');
  img.onerror = () => {};
  img.src = 'assets/fotos/capa-prainha-rooftop.jpg';

  const contact = document.getElementById('hero-contact');
  const ig = info.contact?.instagram || '@prainharooftop';
  const phone = info.contact?.phone || '(84) 2131-3667';
  contact.innerHTML = `
    <a href="https://instagram.com/${ig.replace('@', '')}" target="_blank" rel="noopener">${ig}</a>
    · ${phone}
  `;
  document.getElementById('btn-whatsapp').href = buildWhatsAppLink(info);
}

function renderNav(categories) {
  const nav = document.getElementById('category-nav');
  nav.innerHTML = categories
    .map((cat) => `<a href="#${cat.id}" data-cat="${cat.id}">${cat.name}</a>`)
    .join('');

  const links = nav.querySelectorAll('a');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) =>
            l.classList.toggle('is-active', l.dataset.cat === entry.target.id)
          );
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );

  categories.forEach((cat) => {
    const el = document.getElementById(cat.id);
    if (el) observer.observe(el);
  });
}

function renderItem(item, meta) {
  const src = imageSrc(item);
  return `
    <article class="item" data-id="${item.id}">
      <img
        class="item__photo"
        src="${src}"
        alt="${item.name}"
        loading="lazy"
        onerror="this.closest('.item').classList.add('item--no-photo'); this.remove();"
      />
      <div class="item__body">
        <div class="item__row">
          <span class="item__name">${item.name}</span>
          <span class="item__price">${formatPrices(item, meta)}</span>
        </div>
        ${item.description ? `<p class="item__desc">${item.description}</p>` : ''}
      </div>
    </article>`;
}

function renderMenu(menu) {
  const main = document.getElementById('menu');
  const sorted = [...menu.categories].sort((a, b) => a.order - b.order);

  main.innerHTML = sorted
    .map((cat) => {
      const items = cat.items.map((item) => renderItem(item, menu.meta)).join('');
      return `
        <section class="section" id="${cat.id}">
          <h2 class="section__header">${cat.name}</h2>
          ${items}
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

async function init() {
  try {
    const { menu, info, tokens } = await loadData();
    applyTokens(tokens);
    renderHero(info);
    renderNav(menu.categories);
    renderMenu(menu);
    renderFooter(info);
  } catch (err) {
    document.getElementById('menu').innerHTML =
      '<p style="padding:1rem">Erro ao carregar o cardápio. Tente novamente.</p>';
    console.error(err);
  }
}

init();
