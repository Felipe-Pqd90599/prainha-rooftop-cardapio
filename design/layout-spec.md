# Layout Spec — Cardápio Online e PDF

**Referência visual única:** `assets/referencias/cardapio-2025-atualizado.pdf`  
**Gate G3**

## Estrutura de páginas (espelho do PDF)

| Página PDF | Conteúdo | Online |
|------------|----------|--------|
| 1 | Capa — logo Prainha Rooftop, contato | Hero + nav categorias |
| 2 | Caldos, saladas, infantis, entradas, frutos do mar | Seções correspondentes |
| 3 | Carnes, burgers, petiscos, sucos, sobremesas | Seções correspondentes |
| 4 | Drinks, vinhos, cervejas, doses, adicionais | Seções correspondentes |
| 5–6 | Contato / rodapé | Footer fixo |

## Hierarquia visual

1. **Hero** — nome do restaurante, @prainharooftop, telefone, botão WhatsApp
2. **Nav categorias** — sticky, scroll horizontal no celular
3. **Bloco de categoria** — título em faixa (estilo cabeçalho do PDF)
4. **Item** — nome + preço na mesma linha; descrição abaixo em texto menor
5. **Preço duplo** — `R$ 44 · R$ 84` com label "2 pessoas" ou "litro"
6. **Rodapé** — gorjeta, couvert, política de adicionais

## Mobile (WhatsApp)

- Largura mínima: 320px
- Toque fácil: botões ≥ 44px
- Nav por âncoras (`#caldos`, `#drinks-autorais`, etc.)
- Open Graph para preview no WhatsApp

## PDF

- Mesma hierarquia e tokens de `design-tokens.json`
- Quebra de página entre categorias principais
- Formato vertical, legível no celular sem zoom excessivo

## Fotos

- Usar apenas `assets/fotos/` (fotos do restaurante/cardápio)
- Placeholder neutro se foto não existir
- **Não** usar imagens geradas por IA externas

## Tokens

Ver `design/design-tokens.json` — paleta amostrada do PDF oficial.
