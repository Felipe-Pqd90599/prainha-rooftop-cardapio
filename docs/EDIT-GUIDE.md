# Como editar o cardápio (incluindo fotos)

## Trocar uma foto

1. Coloque a nova foto em `assets/fotos/` com o **mesmo nome** do item.
   - Ex.: item `burger-potiguar` → arquivo `burger-potiguar.jpg`
2. Rode:

```bash
npm run sync-online
npm run generate-pdf
```

O site e o PDF atualizam automaticamente.

## Editar preço ou texto

1. Abra `data/menu-data.json`
2. Altere `price`, `name` ou `description`
3. Rode `npm run sync-online` e `npm run generate-pdf`

## Convenção de nomes

| Item no JSON (`id`) | Arquivo de foto |
|---------------------|-----------------|
| `camarao-prainha` | `camarao-prainha.jpg` |
| `caipirinha` | `caipirinha.jpg` |

Mapa PDF → itens: `docs/IMAGES-MAP.md`

## Comandos úteis

```bash
npm run setup-images      # reextrai fotos do PDF (não sobrescreve se já existir)
npm run install-cursor-assets  # copia imagens geradas no workspace
npm run sync-online         # atualiza site
npm run generate-pdf        # PDF leve + copia para online/
npm run generate-pdf-full   # PDF alta resolução na Desktop (local)
npm run qa-check            # valida JSON + fotos antes do push
```

## PDF: duas versões

| Versão | Comando | Uso |
|--------|---------|-----|
| Compartilhar (~4 MB) | `npm run generate-pdf` | Site, WhatsApp, GitHub |
| Alta resolução (~400 MB) | `npm run generate-pdf-full` | Só no seu PC (Desktop) |

O PDF leve usa miniaturas em `online/assets/fotos-pdf/` (geradas automaticamente). O site usa fotos em alta em `online/assets/fotos/`.
