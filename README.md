# Prainha Rooftop — Cardápio

Cardápio online + PDF com **fonte única de dados** em `data/menu-data.json`.

## Links

| | |
|---|---|
| **Site (GitHub Pages)** | https://Felipe-Pqd90599.github.io/prainha-rooftop-cardapio/ |
| **Repositório** | https://github.com/Felipe-Pqd90599/prainha-rooftop-cardapio |
| **Instagram** | [@prainharooftop](https://instagram.com/prainharooftop) |

## Status do cardápio

_Métricas atualizadas automaticamente em 2026-08-25 23:50._

- **153** itens em **18** categorias
- **153** fotos em `assets/fotos/` (completo)
- PDF do site: `online/cardapio-prainha-rooftop.pdf` (4.02 MB)
- Versão dos dados: `1.0.0-g1`

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
npm run prepare-pdf-images   # miniaturas para PDF leve
npm run generate-pdf         # gera PDF do site (~4 MB)
npm run generate-pdf-full    # PDF alta resolução (local)
```

## Publicar no GitHub

1. Commit na branch de trabalho (ex.: `feature/open-design-cardapio`)
2. `git push origin <branch>`
3. Pull Request → merge na `main`
4. O workflow **Deploy GitHub Pages** publica `online/` automaticamente

## Orquestração de agentes

Roteamento por área: `docs/AGENT-ROUTING.md` · índice: `docs/AGENTS-INDEX.md`
