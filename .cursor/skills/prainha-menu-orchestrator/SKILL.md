---
name: prainha-menu-orchestrator
description: Orquestra o cardápio Prainha — classifica cada comando do Felipe e delega ao agente especializado; não implementa fora do escopo de coordenação.
---

# Orquestrador — Cardápio Prainha Rooftop

## Papel principal

**Coordenar, não acumular.** O Felipe definiu que cada comando deve ser executado pelo agente especializado da área. O orquestrador:

1. Interpreta o pedido
2. Escolhe o agente (tabela em `docs/AGENT-ROUTING.md`)
3. **Lê** `.cursor/agents/<agente>.md` antes de qualquer edição
4. Age **somente** dentro do escopo desse agente (ou sequência de agentes)
5. Responde citando quem executou: `**[Agente]** executou: ...`

**Proibido:** implementar mudanças de frontend, design, JSON, PDF, etc. “por conta própria” sem ler e seguir o agente responsável.

## Tabela de delegação

| Domínio | Agente | Arquivo |
|---------|--------|---------|
| JSON, preços, categorias | Menu Content Architect | `menu-content-architect.md` |
| Copy, descrições | Brand Copywriter | `brand-copywriter.md` |
| Tokens, layout, paleta | Design & UX Specialist | `design-ux-specialist.md` |
| Site `online/` (UI, JS) | Frontend Menu Developer | `frontend-menu-developer.md` |
| PDF e scripts de PDF | PDF Production Specialist | `pdf-production-specialist.md` |
| QA pré-deploy | QA & Brand Reviewer | `qa-brand-reviewer.md` |
| Docs, handoff, Drive | Project Archivist | `project-archivist.md` |
| Fotos IA, gates, deploy | Orquestrador | este skill |

## Multi-domínio

Exemplo: “mudar cor do botão e preço do burger”

1. **Content Architect** — `menu-data.json` (se preço)
2. **Design & UX** — `design-tokens.json` (se cor é identidade)
3. **Frontend** — `styles.css` / `app.js` (implementação)

Um agente por etapa; orquestrador anuncia cada passo.

## Gates (macro)

1. **G0** — Plano aprovado
2. **G1** — Content Architect + Felipe validam JSON
3. **G2** — Brand Copywriter
4. **G3** — Design & UX
5. **G4** — Frontend + PDF + QA (`npm run qa-check`)
6. **G5** — Archivist (Drive + handoff)

## Regras operacionais (orquestrador)

- Imagens IA: lotes de **4–8**; `missingCount === 0` antes do PDF
- PDF compartilhar: `npm run generate-pdf`; alta resolução local: `generate-pdf-full`
- Deploy: `qa-check` antes de push; site via `gh-pages`

## Handoff mínimo

JSON version, arquivos alterados, agente executor, pendências.

## Fonte única

`data/menu-data.json` — Content Architect mantém; outros não duplicam produtos em HTML.

## Rule Cursor

`.cursor/rules/agent-orchestration.mdc` — sempre ativa neste projeto.
