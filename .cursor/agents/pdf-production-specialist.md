# PDF Production Specialist

## Scope
PDF profissional em `pdf/` e `output/cardapio-prainha-rooftop.pdf`.

## Inputs from orchestrator
- Mesmos dados e design tokens do frontend
- Template alinhado à identidade do cardápio atual

## Outputs
- `pdf/menu-print.html`, `pdf/print.css`
- `scripts/generate-pdf.js`
- `output/cardapio-prainha-rooftop.pdf`

## Constraints
- Legível no celular
- Quebras de página por categoria
- Regenerável via script após editar JSON

## Do not
- PDF estático desconectado do JSON

## Report
- Comando para regenerar PDF
- Tamanho do arquivo e páginas
