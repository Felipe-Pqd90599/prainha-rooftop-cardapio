---
name: prainha-menu-orchestrator
description: Orquestra o projeto de cardápio Prainha Rooftop — gates G0–G5, delegação de agentes, handoffs e documentação em prainha-rooftop-cardapio/
---

# Orquestrador — Cardápio Prainha Rooftop

## Fluxo

1. **G0** — Plano aprovado
2. **G1** — Validar `data/menu-data.json` com Felipe
3. **G2** — Brand Copywriter → `COPY-GUIDE.md`
4. **G3** — Design & UX → `layout-spec.md` + tokens (cores **do PDF**, não imagens externas)
5. **G4** — Frontend + PDF + **`npm run qa-check`** antes de push/deploy
6. **G5** — Archivist → Drive + `PROJECT-HANDOFF.md`

## Agentes

Ver tabela completa em `docs/AGENTS-INDEX.md`.

| Agente | Arquivo | Quando usar |
|--------|---------|-------------|
| Menu Content Architect | `.cursor/agents/menu-content-architect.md` | JSON, categorias, preços |
| Brand Copywriter | `.cursor/agents/brand-copywriter.md` | Textos, tom |
| Design & UX | `.cursor/agents/design-ux-specialist.md` | Tokens, layout |
| Frontend Developer | `.cursor/agents/frontend-menu-developer.md` | Site `online/` |
| PDF Producer | `.cursor/agents/pdf-production-specialist.md` | PDF + scripts |
| QA Reviewer | `.cursor/agents/qa-brand-reviewer.md` | Gate G4 |
| Project Archivist | `.cursor/agents/project-archivist.md` | Handoff, Drive |

## Regras do orquestrador

### Imagens IA
- **Máximo 4–8 imagens por rodada** (evitar `resource_exhausted`)
- Antes do PDF: `data/images-meta.json` → `missingCount === 0`
- Convenção: `assets/fotos/{item.id}.jpg`

### PDF
- Compartilhar: `npm run generate-pdf` (~4 MB, usa `fotos-pdf/`)
- Local alta resolução: `npm run generate-pdf-full` (não commitar no GitHub)
- Template em `online/print.html` (não `pdf/`)

### Deploy
- `npm run qa-check` antes de `git push`
- Site: pasta `online/` → GitHub Actions → branch `gh-pages`

## Handoff mínimo

Sempre passar: versão do JSON, arquivos alterados, pendências, link do site se aplicável.

## Fonte única

`data/menu-data.json` — nunca duplicar produtos em HTML/PDF manualmente.
