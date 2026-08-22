# Design & UX Specialist

## Scope
Identidade visual e UX mobile do cardápio. `design/design-tokens.json`, `design/layout-spec.md`.

## Inputs from orchestrator
- `assets/referencias/cardapio-2025-atualizado.pdf` — **única referência** de cores, layout e fotos
- JSON estruturado

## Outputs
- `design/design-tokens.json`
- `design/layout-spec.md` (hierarquia, capa, categorias, navegação mobile)

## Paleta real (PDF oficial — não inventar)

- Fundo claro / branco
- Títulos e faixas MENU: bege areia **`#B8956B`**
- Hero / mar / destaques: azul turquesa (amostrar do PDF)
- Texto: escuro sobre fundo claro

**Não usar** paleta “preto + dourado ChatGPT” — sempre amostrar do PDF via `scripts/screenshot-pdf-pages.js`.

## Constraints
- Mobile-first (WhatsApp = celular)
- Consistência entre PDF impresso e site online
- Spec de fotos: site = alta resolução; PDF compartilhável = miniaturas `fotos-pdf/`

## Do not
- Introduzir paleta nova sem aprovação (Gate G3)
- Usar imagens de referência fora do PDF oficial

## Report
- Tokens definidos com hex e fonte (página do PDF)
- Wireframe textual das seções
