# QA Report — Prainha Rooftop Cardápio

**Data:** 2026-08-22  
**Gate:** G4 (revisão post-entrega)  
**Status:** ✅ Aprovado com pendências documentadas

## Checklist

| Item | Status | Nota |
|------|--------|------|
| Preços JSON ↔ site | ✅ | UI lê `menu-data.json` via sync |
| Preços JSON ↔ PDF | ✅ | `print.html` usa mesmo JSON |
| 145 itens com `id` único | ✅ | `npm run qa-check` |
| Fotos `assets/fotos/{id}.jpg` | ✅ | `missingCount: 0` |
| Miniaturas PDF `fotos-pdf/` | ✅ | Geradas por `prepare-pdf-images.js` |
| PDF compartilhável (~4 MB) | ✅ | `online/cardapio-prainha-rooftop.pdf` |
| PDF alta resolução (local) | ✅ | `npm run generate-pdf-full` → Desktop |
| Mobile 320–428px | ✅ | Layout responsivo em `styles.css` |
| WhatsApp | ✅ | `(84) 2131-3667` / botão no hero |
| Cores vs PDF oficial | ✅ | Bege `#B8956B`, azul turquesa, branco |
| GitHub Pages | ✅ | https://Felipe-Pqd90599.github.io/prainha-rooftop-cardapio/ |
| `docs/QA-REPORT.md` | ✅ | Este arquivo |
| Google Drive (G5) | ⏳ | Pendente |
| Endereço / horário completo | ⏳ | `restaurant-info.json` |

## Issues encontrados (histórico — corrigidos)

| Severidade | Issue | Correção |
|------------|-------|----------|
| Alta | PDF sem fotos novas (`loading="lazy"`) | `loading="eager"` + gate de contagem |
| Alta | Baião com foto de cuscuz | Nova foto IA + removido mapa PDF errado |
| Alta | Fettuccine / Caicoense incorretos | Descrição + regeneração de imagem |
| Alta | PDF 426 MB no GitHub | `fotos-pdf/` + PDF ~4 MB no repo |
| Média | Paleta errada (imagem ChatGPT) | Tokens do PDF oficial |
| Média | Deploy Pages falhou | Workflow `gh-pages` + ativação manual |
| Baixa | Worklog / handoff incompletos | Corrigido nesta rodada |

## Issues abertas

| Severidade | Issue | Responsável |
|------------|-------|-------------|
| Baixa | Endereço e horário no cardápio | Felipe → Content Architect |
| Baixa | Copy não revisada em todos os drinks | Brand Copywriter (futuro) |
| Baixa | Google Drive estrutura 01–05 | Project Archivist (G5) |

## Comando de verificação

```bash
npm run qa-check
```

Rodar **antes** de `git push` ou publicar PDF.

## Aprovação Gate G4

- **Site e PDF leve:** aprovado para uso e compartilhamento.
- **Gate G5:** aguarda Drive + dados de localização.
