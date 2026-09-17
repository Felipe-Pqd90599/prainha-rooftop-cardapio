/* eslint-disable no-unused-vars */
// Reutiliza funções de app.js via cópia enxuta para impressão/PDF
document.addEventListener('DOMContentLoaded', initPrint);

async function initPrint() {
  const photoDir = window.PRINT_PHOTO_DIR || 'assets/fotos-pdf';
  const [menu, info] = await Promise.all([
    fetch('data/menu-data.json').then((r) => r.json()),
    fetch('data/restaurant-info.json').then((r) => r.json()),
  ]);

  const ig = info.contact?.instagram || '@prainharooftop';
  const phone = info.contact?.phone || '(84) 2131-3667';
  document.getElementById('print-contact').textContent = `${ig} · ${phone}`;

  const main = document.getElementById('menu');
  const sorted = [...menu.categories].sort((a, b) => a.order - b.order);

  main.innerHTML = sorted
    .map((cat) => {
      const allItems = cat.itemRefs?.length
        ? cat.itemRefs
            .map((id) => {
              for (const c of menu.categories) {
                const found = (c.items || []).find((i) => i.id === id);
                if (found) return found;
              }
              return null;
            })
            .filter(Boolean)
        : cat.items || [];
      const byId = Object.fromEntries(allItems.map((item) => [item.id, item]));
      const groups = cat.groups?.length
        ? cat.groups.map((g) => ({
            name: g.name,
            items: (g.itemIds || []).map((id) => byId[id]).filter(Boolean),
          }))
        : [{ name: '', items: allItems }];
      const body = groups
        .map((group) => {
          const items = group.items
            .map((item) => {
              const file = item.image || `${item.id}.jpg`;
              const prices = formatPrices(item, menu.meta);
              return `
            <article class="item">
              <img class="item__photo" src="${photoDir}/${file}" alt="" loading="eager"
                onerror="this.closest('.item').classList.add('item--no-photo'); this.remove();" />
              <div class="item__body">
                <div class="item__row">
                  <span class="item__name">${item.name}</span>
                  <span class="item__price">${prices}</span>
                </div>
                ${item.description ? `<p class="item__desc">${item.description}</p>` : ''}
              </div>
            </article>`;
            })
            .join('');
          const subtitle = group.name ? `<h3 class="section__subtitle">${group.name}</h3>` : '';
          return `${subtitle}${items}`;
        })
        .join('');
      return `<section class="section" id="${cat.id}"><h2 class="section__header">${cat.name}</h2>${body}</section>`;
    })
    .join('');

  const p = info.policies || {};
  document.getElementById('footer').innerHTML = `
    <p><strong>${info.name}</strong></p>
    ${p.serviceChargeSuggestion ? `<p>${p.serviceChargeSuggestion}</p>` : ''}
    ${p.couvertArtistico ? `<p>${p.couvertArtistico}</p>` : ''}
    ${p.adicionaisNote ? `<p><em>${p.adicionaisNote}</em></p>` : ''}
  `;
}

function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPrices(item, meta) {
  const parts = [formatPrice(item.price)];
  if (item.priceSecondary != null) {
    const label = item.priceSecondaryLabel || meta.priceSecondaryLabelDefault || '2 pessoas';
    parts.push(`${formatPrice(item.priceSecondary)} (${label})`);
  }
  return parts.join(' · ');
}
