# Deploy — Cardápio online

## URL publicada

https://Felipe-Pqd90599.github.io/prainha-rooftop-cardapio/

## Como o deploy funciona

1. Push na branch `main` dispara `.github/workflows/pages.yml`
2. Workflow publica a pasta `online/` na branch `gh-pages`
3. GitHub Pages serve o conteúdo (config: branch `gh-pages`, root)

## Atualizar o site após editar o cardápio

```bash
npm run sync-online
npm run generate-pdf    # opcional: atualiza PDF no site
npm run qa-check
git add -A
git commit -m "Atualiza cardápio"
git push origin main
```

Aguarde 1–2 minutos e recarregue o link.

## Repositório

https://github.com/Felipe-Pqd90599/prainha-rooftop-cardapio

## Primeira configuração (já feita)

- Repositório público separado de `pagina-pessoal`
- Settings → Pages → Deploy from branch → `gh-pages` / root

## PDF no site

O arquivo `online/cardapio-prainha-rooftop.pdf` é copiado automaticamente por `npm run generate-pdf`. Link no botão "Baixar PDF" do hero.
