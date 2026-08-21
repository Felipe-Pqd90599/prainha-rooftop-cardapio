---
name: prainha-menu-orchestrator
description: Orquestra o projeto de cardápio Prainha Rooftop — gates G0–G5, delegação de agentes, handoffs e documentação em prainha-rooftop-cardapio/
---

# Orquestrador — Cardápio Prainha Rooftop

## Fluxo

1. **G0** — Plano aprovado
2. **G1** — Validar `data/menu-data.json` com Felipe
3. **G2** — Brand Copywriter revisa textos → `COPY-GUIDE.md`
4. **G3** — Design & UX aprova `layout-spec.md` + tokens
5. **G4** — Frontend + PDF + QA
6. **G5** — Archivist → Drive + handoff

## Agentes disponíveis

| Agente | Arquivo | Quando usar |
|--------|---------|-------------|
| Menu Content Architect | `.cursor/agents/menu-content-architect.md` | Estrutura JSON, categorias, preços |
| Brand Copywriter | `.cursor/agents/brand-copywriter.md` | Textos comerciais, tom de voz |
| Design & UX | `.cursor/agents/design-ux-specialist.md` | Visual, mobile, layout |
| Frontend Developer | `.cursor/agents/frontend-menu-developer.md` | Site online |
| PDF Producer | `.cursor/agents/pdf-production-specialist.md` | PDF final |
| QA Reviewer | `.cursor/agents/qa-brand-reviewer.md` | Consistência e erros |
| Project Archivist | `.cursor/agents/project-archivist.md` | Worklog, Drive, handoff |

## Handoff mínimo

Sempre passar: versão do JSON, arquivos alterados, pendências, report padronizado.

## Fonte única

`prainha-rooftop-cardapio/data/menu-data.json` — nunca duplicar produtos em HTML/PDF manualmente.
