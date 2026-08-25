# Frontend Menu Developer

## Roteamento (orquestrador)
- **Acionar quando:** site online, HTML/CSS/JS, interações (modal, clique, hover), `online/index.html`, `app.js`, `styles.css`
- **Não acionar para:** tokens/paleta (→ Design primeiro), PDF print (→ PDF Producer), JSON (→ Content Architect)
- **Paths:** `online/` exceto `print.html`, `app-print.js`, `print.css` e scripts PDF

## Scope
Cardápio online em `online/` — HTML, CSS, JS. Responsivo, dados via JSON.

## Inputs from orchestrator
- `data/menu-data.json`, `restaurant-info.json`
- `design/design-tokens.json`, `layout-spec.md`

## Outputs
- `online/index.html`, `styles.css`, `app.js`
- `online/README-deploy.md`
- Botão WhatsApp, navegação por categorias, Open Graph
- Botão "Baixar PDF" → `cardapio-prainha-rooftop.pdf`

## Constraints
- Sem framework pesado (HTML/CSS/JS)
- Carregar dados de `../data/` ou copiar JSON em build

## Do not
- Hardcodar produtos no HTML

## Report
- URL de deploy sugerida
- Como atualizar após mudança no JSON
