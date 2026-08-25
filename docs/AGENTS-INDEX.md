# Índice de agentes — Prainha Rooftop Cardápio

**Total:** 7 agentes especializados + 1 orquestrador (skill)

Este projeto usou definições em `.cursor/agents/*.md` e a skill `.cursor/skills/prainha-menu-orchestrator/`.

---

## Relação agente → função → entregas

| # | Agente | Função no projeto | Entregas principais | Status |
|---|--------|-------------------|---------------------|--------|
| 0 | **Orquestrador** | Gates G0–G5, delegação, correções cruzadas, deploy, imagens IA em lotes | Estrutura do repo, GitHub Pages, scripts de pipeline, `BRIEF.md` | ✅ Feito (+ absorveu QA/deploy/imagens) |
| 1 | **Menu Content Architect** | Estrutura JSON: categorias, preços, ids, lacunas | `menu-data.json`, `restaurant-info.json`, `CHANGELOG-content.md` | ✅ Feito |
| 2 | **Brand Copywriter** | Tom de voz, descrições comerciais | `COPY-GUIDE.md`, descrições no JSON | ⚠️ Parcial (pratos principais) |
| 3 | **Design & UX Specialist** | Paleta, layout mobile, consistência visual | `design-tokens.json`, `layout-spec.md`, screenshots PDF | ✅ Feito (após correção de paleta) |
| 4 | **Frontend Menu Developer** | Site online responsivo, WhatsApp, nav categorias | `online/index.html`, `styles.css`, `app.js`, `sync-online-data.js` | ✅ Feito |
| 5 | **PDF Production Specialist** | PDF regenerável alinhado ao JSON | `print.html`, `generate-pdf.js`, `prepare-pdf-images.js`, PDF no site | ✅ Feito (paths em `online/`) |
| 6 | **QA & Brand Reviewer** | Checklist preço/copy/mobile/PDF antes do deploy | `QA-REPORT.md`, `scripts/qa-check.js` | ✅ Feito (post-entrega) |
| 7 | **Project Archivist** | Worklog, handoff, guias, Drive | `AGENT-WORKLOG.md`, `PROJECT-HANDOFF.md`, `EDIT-GUIDE.md`, `IMAGES-MAP.md` | ⚠️ Drive pendente (G5) |

---

## Como os agentes trabalharam na prática

- **Não** foram 7 execuções isoladas de subagente em sequência rígida.
- O **agente principal do Cursor** atuou como orquestrador e assumiu várias funções quando houve retrabalho (fotos, PDF, GitHub).
- **Subagente** usado para lote grande de fotos IA → falhou (`resource_exhausted`); orquestrador continuou em lotes de 4–8.

---

## Mudanças para os próximos projetos

| Área | Antes | Depois (melhorias aplicadas) |
|------|--------|------------------------------|
| **Delegação** | Composer fazia tudo | **Orquestrador** roteia → agente especializado executa |
| **Regra Cursor** | — | `.cursor/rules/agent-orchestration.mdc` |
| **Roteamento** | — | `docs/AGENT-ROUTING.md` |
| QA | Ad hoc | `npm run qa-check` + `QA-REPORT.md` |
| **PDF** | `lazy` load, sem gate | `eager`, `fotos-pdf/`, gate 145/145 fotos, `generate-pdf-full` local |
| **Design agent** | Prompt “dark + gold” | Alinhado ao PDF: bege `#B8956B`, azul turquesa, branco |
| **PDF agent** | Pasta `pdf/` | Documentado: template em `online/print.html` |
| **Orquestrador** | Lotes grandes de imagem | Máx. 4–8 imagens por rodada; gate `missingCount === 0` antes do PDF |
| **Archivist** | Worklog parcial | `PROJECT-HANDOFF.md` + links públicos |
| **G5** | Não feito | Drive ainda manual; estrutura documentada no handoff |

### Novos agentes?

**Não** — os 7 + orquestrador cobrem o escopo. Melhoria é **processo** (gates, scripts, prompts), não quantidade.

### Possível agente futuro (opcional)

- **Image Production Specialist** — só se houver muitas rodadas de fotos IA (prompts, lotes, `images-meta`), para não sobrecarregar o orquestrador.

---

## Onde ler cada definição

```
.cursor/agents/menu-content-architect.md
.cursor/agents/brand-copywriter.md
.cursor/agents/design-ux-specialist.md
.cursor/agents/frontend-menu-developer.md
.cursor/agents/pdf-production-specialist.md
.cursor/agents/qa-brand-reviewer.md
.cursor/agents/project-archivist.md
.cursor/skills/prainha-menu-orchestrator/SKILL.md
```
