/**
 * Gera README.md com links e métricas do cardápio atual.
 * Rodado automaticamente por npm run sync-online.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const readmePath = path.join(ROOT, 'README.md');

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

function countMenuItems(menu) {
  const items = [];
  for (const cat of menu.categories) {
    if (cat.items) items.push(...cat.items);
  }
  return items;
}

function pdfSizeMb(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return null;
  return (fs.statSync(full).size / (1024 * 1024)).toFixed(2);
}

function buildReadme(ctx) {
  return `# Prainha Rooftop — Cardápio

Cardápio online + PDF com **fonte única de dados** em \`data/menu-data.json\`.

## Links

| | |
|---|---|
| **Site (GitHub Pages)** | ${ctx.siteUrl} |
| **Repositório** | ${ctx.repoUrl} |
| **Instagram** | [${ctx.instagram}](https://instagram.com/${ctx.instagramHandle}) |

## Status do cardápio

_Métricas atualizadas automaticamente em ${ctx.updatedAt}._

- **${ctx.itemCount}** itens em **${ctx.categoryCount}** categorias
- **${ctx.photoCount}** fotos em \`assets/fotos/\` (${ctx.missingCount === 0 ? 'completo' : `${ctx.missingCount} faltando`})
- PDF do site: ${ctx.pdfSite}
- Versão dos dados: \`${ctx.menuVersion}\`

## Estrutura

\`\`\`
data/menu-data.json     → itens, preços, categorias (fonte principal)
data/restaurant-info.json → nome, contato, links do site
design/design-tokens.json → cores e tipografia
online/                 → site publicado (GitHub Pages)
assets/fotos/           → fotos dos itens ({id}.jpg)
docs/                   → guias, agentes, QA
\`\`\`

## Comandos

\`\`\`bash
npm run sync-online        # copia dados/fotos → online/ + atualiza README
npm run qa-check             # valida JSON, fotos e PDF antes do deploy
npm run prepare-pdf-images   # miniaturas para PDF leve
npm run generate-pdf         # gera PDF do site (~4 MB)
npm run generate-pdf-full    # PDF alta resolução (local)
\`\`\`

## Publicar no GitHub

1. Commit na branch de trabalho (ex.: \`feature/open-design-cardapio\`)
2. \`git push origin <branch>\`
3. Pull Request → merge na \`main\`
4. O workflow **Deploy GitHub Pages** publica \`online/\` automaticamente

## Orquestração de agentes

Roteamento por área: \`docs/AGENT-ROUTING.md\` · índice: \`docs/AGENTS-INDEX.md\`
`;
}

function main() {
  const menu = readJson('data/menu-data.json');
  const info = readJson('data/restaurant-info.json');
  const meta = readJson('data/images-meta.json');
  const items = countMenuItems(menu);

  const site = info.site || {};
  const siteUrl = site.githubPages || 'https://Felipe-Pqd90599.github.io/prainha-rooftop-cardapio/';
  const repoUrl =
    site.repo || 'https://github.com/Felipe-Pqd90599/prainha-rooftop-cardapio';
  const instagram = info.contact?.instagram || '@prainharooftop';
  const instagramHandle = instagram.replace('@', '');

  const pdfMb = pdfSizeMb('online/cardapio-prainha-rooftop.pdf');
  const pdfSite = pdfMb ? `\`online/cardapio-prainha-rooftop.pdf\` (${pdfMb} MB)` : 'não gerado — rode `npm run generate-pdf`';

  const ctx = {
    siteUrl,
    repoUrl,
    instagram,
    instagramHandle,
    itemCount: items.length,
    categoryCount: menu.categories.length,
    photoCount: items.length - (meta.missingCount || 0),
    missingCount: meta.missingCount || 0,
    menuVersion: menu.meta?.version || '—',
    pdfSite,
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  };

  const content = buildReadme(ctx);
  const prev = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : '';
  fs.writeFileSync(readmePath, content);
  if (prev !== content) {
    console.log('README.md atualizado');
  } else {
    console.log('README.md já estava em dia');
  }
}

main();
