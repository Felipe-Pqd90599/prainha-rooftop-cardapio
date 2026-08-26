# Project Handoff — Prainha Rooftop Cardápio

**Versão:** 1.1.0-online  
**Data:** 2026-08-26  
**Cliente / dono:** Felipe  
**Repositório:** https://github.com/Felipe-Pqd90599/prainha-rooftop-cardapio

---

## Links de entrega

| Entrega | URL / caminho |
|---------|----------------|
| **Cardápio online (escuro)** | https://Felipe-Pqd90599.github.io/prainha-rooftop-cardapio/ |
| **Cardápio online (21st / claro)** | https://Felipe-Pqd90599.github.io/prainha-rooftop-cardapio/21st/ |
| **PDF (compartilhar)** | https://Felipe-Pqd90599.github.io/prainha-rooftop-cardapio/cardapio-prainha-rooftop.pdf |
| **PDF alta resolução** | `%USERPROFILE%\Desktop\Prainha-Rooftop-Cardapio-PDF\` (local, `npm run generate-pdf-full`) |
| **Código** | `C:\Users\Felipe\pagina-pessoal\prainha-rooftop-cardapio\` |

---

## Fonte única de dados

- **Menu:** `data/menu-data.json` (153 itens, 18 categorias)
- **Restaurante:** `data/restaurant-info.json`
- **Fotos:** `assets/fotos/{item.id}.jpg`
- **Status fotos:** `data/images-meta.json`

---

## Comandos essenciais

```bash
npm run sync-online          # JSON + fotos → online/ + README
npm run generate-pdf         # PDF leve (~4 MB) + copia para site
npm run generate-pdf-full    # PDF alta resolução na Desktop
npm run qa-check             # checklist antes de publicar
npm run update-images-meta   # atualiza missingCount
```

---

## Fluxo de edição (resumo)

1. Editar `data/menu-data.json` ou trocar JPG em `assets/fotos/`
2. `npm run sync-online`
3. `npm run generate-pdf` (opcional)
4. `npm run qa-check`
5. `git commit` + `git push origin main` (deploy automático → `gh-pages`)

Detalhes: `docs/EDIT-GUIDE.md`

---

## Estrutura do PDF (nota)

O template de impressão está em **`online/print.html`**. Miniaturas: `online/assets/fotos-pdf/` (geradas por `prepare-pdf-images`).

---

## Gates finais

| Gate | Status |
|------|--------|
| G0 Plano | ✅ |
| G1 JSON | ✅ |
| G2 Copy | ✅ parcial |
| G3 Visual | ✅ |
| G4 Site + PDF + QA | ✅ |
| G5 Drive | ❌ Cancelado (Felipe — entrega via GitHub apenas) |

---

## Pendências opcionais para Felipe

- [ ] Endereço completo e horário em `restaurant-info.json`
- [ ] Revisar copy de bebidas/drinks se desejar tom mais comercial

---

## Manutenção futura

- **Não** editar produtos direto no HTML — sempre JSON.
- **Não** commitar PDF > 100 MB — usar `generate-pdf` no repo; `generate-pdf-full` só local.
- Branch de trabalho mergeada em `main`; deploy via `gh-pages` (root).

---

## Contato no cardápio

- Tel: (84) 2131-3667  
- Instagram: @prainharooftop  
- WhatsApp: link no site
