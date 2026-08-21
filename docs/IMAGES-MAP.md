# Mapa de imagens — Prainha Rooftop

## Convenção (substituição futura)

```
assets/fotos/{item.id}.jpg  →  item no JSON  →  online + PDF
```

**Para trocar uma foto:** substitua o arquivo mantendo o **mesmo nome**.  
Ex.: troque `burger-potiguar.jpg` pela foto real → atualiza online e PDF automaticamente.

Depois rode:

```bash
npm run sync-online
npm run generate-pdf
```

## Imagens do PDF original (página 2)

| Arquivo final | Item | Origem PDF |
|---------------|------|------------|
| `ginga-tapioca.jpg` | Ginga com Tapioca | embedded-02 |
| `salada-camarao.jpg` | Salada com Filé de Camarão | embedded-03 |
| `camarao-prainha.jpg` | Camarão do Prainha | embedded-04 |
| `linguica-prainha.jpg` | Linguiça do Prainha | embedded-05 |
| `caipifruta.jpg` | Caipifruta | embedded-06 |
| `files-camarao-queijo.jpg` | Filés de Camarão com Molho de Queijo | embedded-07 |
| `carne-sol-coalho.jpg` | Carne de Sol Desfiada com Coalho | embedded-08 |
| `baiao-dois.jpg` | Baião de Dois | embedded-09 |
| `parmegiana-carne.jpg` | Parmegiana de Carne | embedded-10 |
| `taca-camarao-empanado.jpg` | Taça de Camarão Empanado | embedded-11 |
| `mix-sertanejo.jpg` | Mix Sertanejo | embedded-12 |
| `parmegiana-frango.jpg` | Parmegiana de Frango | embedded-13 |
| `ensopado-peixe.jpg` | Ensopado de Peixe | embedded-14 |
| `caipi-prainha.jpg` | Caipi do Prainha | embedded-15 |
| `burger-potiguar.jpg` | Burger Potiguar | embedded-16 |
| `capa-prainha-rooftop.jpg` | Capa / hero | embedded-01 |

## Demais itens

Gerados por IA com estilo uniforme (fotografia gastronômica, luz natural, rooftop praia).  
Lista completa em `data/images-meta.json` → campo `missing`.
