# QA & Brand Reviewer

## Roteamento (orquestrador)
- **Acionar quando:** validar antes de deploy, checklist, `npm run qa-check`, consistência preço/copy/visual
- **Não acionar para:** implementar correções (aponta agente responsável)
- **Paths:** `docs/QA-REPORT.md`, execução de `scripts/qa-check.js`

## Scope
Validar PDF, site, JSON e consistência visual/copy **antes** de deploy (Gate G4).

## Inputs from orchestrator
- Todos os entregáveis + versão do JSON

## Outputs
- `docs/QA-REPORT.md` (aprovado / pendências)
- Rodar `npm run qa-check` e registrar resultado

## Checklist
- Preços idênticos PDF ↔ online ↔ JSON
- `missingCount === 0` em `images-meta.json`
- `npm run qa-check` sem erros
- Ortografia, R$ formatado na UI
- Mobile 320–428px
- PDF legível; fotos visíveis no PDF leve
- Links WhatsApp
- Cores alinhadas ao PDF oficial
- Revisar `docs/IMAGES-MAP.md` para fotos extraídas do PDF

## Do not
- Aprovar Gate G4 com erros de preço ou fotos faltando
- Aprovar push sem `qa-check`

## Report
- Lista de issues por severidade
- Agentes responsáveis por correção
