# Prainha Rooftop — Cardápio

Projeto de cardápio PDF + online com fonte única de dados editável.

## Estrutura

```
data/           → menu-data.json (edite aqui)
design/         → cores e layout
online/         → site (após Fase 4)
pdf/            → template impressão
output/         → PDF final
docs/           → brief, worklog, guias
assets/         → fotos e referências
```

## Site no ar

Após o deploy no GitHub Pages:

**https://Felipe-Pqd90599.github.io/prainha-rooftop-cardapio/**

## Status atual

- **145/145** itens com foto
- PDF: `output/cardapio-prainha-rooftop.pdf`

## Comandos

```bash
npm run sync-online    # copia JSON para online/data/
npm run screenshot-pdf # gera previews do PDF em assets/referencias/pages/
```

## Orquestração

Ver `.cursor/skills/prainha-menu-orchestrator/SKILL.md`
