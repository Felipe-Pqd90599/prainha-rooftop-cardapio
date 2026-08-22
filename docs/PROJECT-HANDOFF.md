# Project Handoff — Prainha Rooftop Cardápio

**Versão:** 1.0.0  
**Data:** 2026-08-22  
**Cliente / dono:** Felipe  
**Repositório:** https://github.com/Felipe-Pqd90599/prainha-rooftop-cardapio

---

## Links de entrega

| Entrega | URL / caminho |
|---------|----------------|
| **Cardápio online** | https://Felipe-Pqd90599.github.io/prainha-rooftop-cardapio/ |
| **PDF (compartilhar)** | https://Felipe-Pqd90599.github.io/prainha-rooftop-cardapio/cardapio-prainha-rooftop.pdf |
| **PDF alta resolução** | `%USERPROFILE%\Desktop\Prainha-Rooftop-Cardapio-PDF\` (local, `npm run generate-pdf-full`) |
| **Código** | `C:\Users\Felipe\pagina-pessoal\prainha-rooftop-cardapio\` |

---

## Fonte única de dados

- **Menu:** `data/menu-data.json` (145 itens, 17 categorias)
- **Restaurante:** `data/restaurant-info.json`
- **Fotos:** `assets/fotos/{item.id}.jpg`
- **Status fotos:** `data/images-meta.json`

---

## Comandos essenciais

```bash
npm run sync-online          # JSON + fotos → online/
npm run generate-pdf         # PDF leve (~4 MB) + copia para site
npm run generate-pdf-full    # PDF alta resolução na Desktop
npm run qa-check             # checklist antes de publicar
npm run install-assets       # copia imagens geradas no Cursor
npm run update-images-meta   # atualiza missingCount
```

---

## Fluxo de edição (resumo)

1. Editar `data/menu-data.json` ou trocar JPG em `assets/fotos/`
2. `npm run sync-online`
3. `npm run generate-pdf`
4. `npm run qa-check`
5. `git commit` + `git push` (deploy automático via GitHub Actions → `gh-pages`)

Detalhes: `docs/EDIT-GUIDE.md`

---

## Estrutura do PDF (nota)

O template de impressão está em **`online/print.html`** (não em `pdf/`), por decisão de unificar site e PDF no mesmo `online/`. Miniaturas para PDF: `online/assets/fotos-pdf/` (geradas automaticamente).

---

## Gates finais

| Gate | Status |
|------|--------|
| G0 Plano | ✅ |
| G1 JSON | ✅ |
| G2 Copy | ✅ parcial |
| G3 Visual | ✅ |
| G4 Site + PDF + QA | ✅ |
| G5 Drive + handoff Drive | ⏳ |

---

## Pendências para Felipe

- [ ] Endereço completo e horário em `restaurant-info.json`
- [ ] Google Drive (pastas 01–05) — ver `project-archivist.md`
- [ ] Revisar copy de bebidas/drinks se desejar tom mais comercial

---

## Manutenção futura

- **Não** editar produtos direto no HTML — sempre JSON.
- **Não** commitar PDF > 100 MB — usar `generate-pdf` (leve) no repo; `generate-pdf-full` só local.
- Após mudar fotos no PDF oficial de referência, revisar `docs/IMAGES-MAP.md`.

---

## Contato no cardápio

- Tel: (84) 2131-3667  
- Instagram: @prainharooftop  
- WhatsApp: link no site
