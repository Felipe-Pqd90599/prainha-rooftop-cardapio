# Roteamento de comandos — quem faz o quê

**Regra do Felipe (desde 2026-08-25):** cada pedido é executado pelo **agente especializado** correspondente. O **orquestrador** classifica e coordena — não substitui os especialistas editando tudo sozinho.

---

## Fluxo em cada comando

```
Felipe pede algo
    ↓
Orquestrador lê o pedido e escolhe o(s) agente(s)
    ↓
Lê .cursor/agents/<agente>.md
    ↓
Agente especializado edita só seu escopo
    ↓
Resposta indica: "[Nome do agente] executou: ..."
```

Pedidos que misturam áreas (ex.: “mudar cor e o botão”) → **Design** (tokens) depois **Frontend** (CSS/JS), em passos separados e identificados.

---

## Mapa rápido

| Você pede… | Agente responsável |
|------------|-------------------|
| Preço, categoria, item novo no cardápio | **Menu Content Architect** |
| Texto do prato, descrição comercial | **Brand Copywriter** |
| Cores, layout, visual, identidade | **Design & UX Specialist** |
| Site, modal, clique, menu, responsivo | **Frontend Menu Developer** |
| PDF, fotos no PDF, gerar PDF | **PDF Production Specialist** |
| “Está certo?” antes de publicar | **QA & Brand Reviewer** |
| Documentação, handoff, organização | **Project Archivist** |
| Fotos IA, deploy, gates, prioridade | **Orquestrador** |

---

## Arquivos de cada agente

| Agente | Definição |
|--------|-----------|
| Orquestrador | `.cursor/skills/prainha-menu-orchestrator/SKILL.md` |
| Menu Content Architect | `.cursor/agents/menu-content-architect.md` |
| Brand Copywriter | `.cursor/agents/brand-copywriter.md` |
| Design & UX Specialist | `.cursor/agents/design-ux-specialist.md` |
| Frontend Menu Developer | `.cursor/agents/frontend-menu-developer.md` |
| PDF Production Specialist | `.cursor/agents/pdf-production-specialist.md` |
| QA & Brand Reviewer | `.cursor/agents/qa-brand-reviewer.md` |
| Project Archivist | `.cursor/agents/project-archivist.md` |

Índice completo: `docs/AGENTS-INDEX.md`

---

## Ferramentas futuras por agente

Você pode evoluir cada agente com MCPs, scripts ou skills extras. Sugestão de vínculo:

| Agente | Ferramentas naturais |
|--------|----------------------|
| Content Architect | JSON schema, validação de preços |
| Brand Copywriter | guia de tom, lint de copy |
| Design & UX | tokens, screenshots PDF |
| Frontend | browser preview, Live Server |
| PDF Producer | Puppeteer, `generate-pdf` |
| QA | `npm run qa-check` |
| Archivist | Drive, `gh` |
| Orquestrador | git, deploy, Task/subagentes |

Documente novas ferramentas no arquivo do agente correspondente.

---

## Cursor Rule

Regra persistente no projeto: `.cursor/rules/agent-orchestration.mdc` (`alwaysApply: true`).
