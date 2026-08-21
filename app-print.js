/* eslint-disable no-unused-vars */
// Reutiliza funções de app.js via cópia enxuta para impressão/PDF
document.addEventListener('DOMContentLoaded', initPrint);

async function initPrint() {
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
      const items = cat.items
        .map((item) => {
          const file = item.image || `${item.id}.jpg`;
          const prices = formatPrices(item, menu.meta);
          return `
            <article class="item">
              <img class="item__photo" src="assets/fotos-pdf/${file}" alt="" loading="eager"
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
      return `<section class="section" id="${cat.id}"><h2 class="section__header">${cat.name}</h2>${items}</section>`;
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
