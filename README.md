# Prainha Rooftop — Cardápio

Cardápio online + PDF com **fonte única de dados** em `data/menu-data.json`.

## Links

| | |
|---|---|
| **Site principal (escuro)** | https://Felipe-Pqd90599.github.io/prainha-rooftop-cardapio/ |
| **Site 21st (claro)** | https://Felipe-Pqd90599.github.io/prainha-rooftop-cardapio/21st/ |
| **Repositório** | https://github.com/Felipe-Pqd90599/prainha-rooftop-cardapio |
| **Instagram** | [@prainharooftop](https://instagram.com/prainharooftop) |

## Status do cardápio

_Métricas atualizadas automaticamente em 2026-09-26 20:48._

- **166** itens em **18** categorias
- **166** fotos em `assets/fotos/` (completo)
- PDFs do site: Gastronomia `online/cardapio-prainha-rooftop-gastronomia.pdf` (6.83 MB) · Drinks `online/cardapio-prainha-rooftop-drinks.pdf` (3.14 MB)
- Versão dos dados: `1.1.66-online`

## Estrutura

```
data/menu-data.json     → itens, preços, categorias (fonte principal)
data/restaurant-info.json → nome, contato, links do site
design/design-tokens.json → cores e tipografia
online/                 → site publicado (GitHub Pages)
assets/fotos/           → fotos dos itens ({id}.jpg)
docs/                   → guias, agentes, QA
```

## Comandos

```bash
npm run sync-online        # copia dados/fotos → online/ + atualiza README
npm run qa-check             # valida JSON, fotos e PDF antes do deploy
npm run generate-menus       # gera os 2 cardápios em PDF (gastronomia + drinks)
npm run prepare-pdf-images   # miniaturas para PDF leve
npm run generate-pdf-full    # PDF alta resolução (local)
```

## Publicar no GitHub

1. Commit na branch de trabalho (ex.: `feature/open-design-cardapio`)
2. `git push origin <branch>`
3. Pull Request → merge na `main`
4. O workflow **Deploy GitHub Pages** publica `online/` automaticamente

## Orquestração de agentes

Roteamento por área: `docs/AGENT-ROUTING.md` · índice: `docs/AGENTS-INDEX.md`
