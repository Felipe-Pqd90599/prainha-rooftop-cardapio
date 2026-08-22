# PDF Production Specialist

## Scope
PDF profissional regenerável a partir do JSON. Template em **`online/`** (unificado com o pipeline do site).

## Inputs from orchestrator
- `data/menu-data.json`, `restaurant-info.json`
- `design/design-tokens.json`
- Miniaturas: `online/assets/fotos-pdf/` (geradas por `scripts/prepare-pdf-images.js`)

## Outputs
- `online/print.html`, `online/print.css`, `online/app-print.js`
- `scripts/generate-pdf.js`, `scripts/prepare-pdf-images.js`, `scripts/generate-pdf-full.js`
- `output/cardapio-prainha-rooftop.pdf` (local, gitignored)
- `online/cardapio-prainha-rooftop.pdf` (deploy no site, ~4 MB)

## Constraints
- `loading="eager"` em todas as `<img>` do print (nunca `lazy`)
- Gate antes de `page.pdf()`: **145/145** fotos carregadas (`naturalWidth > 0`)
- PDF > 100 MB: usar `fotos-pdf/` no repo; alta resolução só com `generate-pdf-full` local
- Regenerar: `npm run generate-pdf`

## Do not
- PDF estático desconectado do JSON
- Commitar PDF com fotos full-res no GitHub

## Report
- Comando de regeneração
- Contagem fotos carregadas / tamanho do arquivo
