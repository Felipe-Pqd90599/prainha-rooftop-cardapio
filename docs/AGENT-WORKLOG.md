# Agent Worklog — Prainha Rooftop Cardápio

Registro de responsabilidades, inputs, outputs e decisões por agente.

---

## Orquestrador

**Fase:** 0 → 1  
**Status:** Em execução

### Recebi
- Aprovação do plano completo (Felipe)
- PDF `cardápio 2025 atualizado.pdf`
- Diretriz: cores iguais ao cardápio atual

### Produzi
- Estrutura `prainha-rooftop-cardapio/`
- `docs/BRIEF.md`
- Coordenação da Fase 1

### Decisões
- Cores: preto + dourado `#C8A95A` + branco (identidade visual confirmada na referência)
- Fonte única: `data/menu-data.json`
- Gate G1 aberto para validação de conteúdo

### Impacto
- Lote 2 de geração IA ([Gerar fotos IA cardápio lote 2](1561a9a3-bea3-46c1-9ca8-2737f50c6683)) falhou por `resource_exhausted`. Continuação em lotes menores pelo orquestrador.
- Status imagens: ver `data/images-meta.json` (`missingCount`)

---

## Menu Content Architect

**Fase:** 1  
**Status:** ✅ Gate G1 aprovado (com edições do Felipe)

### Decisões
- Felipe reorganizou categorias no JSON — mantidas suas alterações

---

## Brand Copywriter

**Fase:** 2  
**Status:** ✅ Concluída

### Produzi
- `docs/COPY-GUIDE.md`
- Descrições adicionadas em pratos principais (frutos do mar, carnes, petiscos)

---

## Design & UX Specialist

**Fase:** 3  
**Status:** ✅ Concluída

### Correção importante
- Removida referência à imagem ChatGPT (`identidade-visual-referencia.png`)
- Cores amostradas do **PDF oficial** via `scripts/screenshot-pdf-pages.js`
- Paleta: branco, bege `#B8956B` (faixas MENU), azul turquesa (hero/mar)

### Produzi
- `design/design-tokens.json` (atualizado)
- `design/layout-spec.md`
- `assets/referencias/pages/pdf-page-*.png` (referência visual)

---

## Frontend Menu Developer

**Fase:** 4A  
**Status:** 🔄 Primeira versão entregue

### Produzi
- `online/index.html`, `styles.css`, `app.js`
- `scripts/sync-online-data.js`

---

## Orquestrador

### Recebi
- G1 aprovado + correção: só PDF como referência visual

### Decisões
- Deletados arquivos incorretos (PNG ChatGPT, PDF drinks extra)

### Recebi
- Texto extraído do PDF (6 páginas)
- Referência visual de drinks

### Produzi
- `data/menu-data.json` — 17 categorias, ~130 itens
- `data/restaurant-info.json`
- `docs/CHANGELOG-content.md`

### Decisões
- Preços duplos (`price` + `priceSecondary`) para pratos 1/2 pessoas e doses/litros
- Descrições incluídas quando legíveis no PDF; algumas omitidas por ambiguidade no OCR

### Pendências
- Confirmar endereço e horário
- Validar se preços duplos são sempre "1 pessoa / 2 pessoas"
- Revisar descrições de pratos principais (frutos do mar, carnes)

### Impacto
- Copywriter e QA dependem deste arquivo

---

## Design & UX Specialist

**Fase:** 0 (parcial)  
**Status:** Tokens iniciais

### Produzi
- `design/design-tokens.json` (cores da identidade atual)

### Pendente
- `design/layout-spec.md` após Gate G1

---

## Template para próximos agentes

```markdown
## [Nome do agente]
**Fase:**  
**Status:**

### Recebi
-

### Produzi
-

### Decisões
-

### Alterações no processo
-

### Pendências
-

### Impacto
-
```
