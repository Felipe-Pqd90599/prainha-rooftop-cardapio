# Copy Guide — Prainha Rooftop

**Fonte:** `cardapio-2025-atualizado.pdf`  
**Gate G2**

## Tom de voz

- **Convidativo e direto** — rooftop na Prainha, vista, brisa, experiência
- **Claro** — ingredientes listados de forma objetiva
- **Regional sem exagero** — sertão, mar, Potiguar com naturalidade
- **Sem inventar** — não adicionar ingredientes que não estão no cardápio oficial

## Padrões de escrita

| Elemento | Regra |
|----------|--------|
| Nome do prato | Como no cardápio (maiúsculas só em categorias na UI) |
| Descrição | Ingredientes principais, separados por vírgula |
| Quantidade | Manter "4 unid", "350ml", "1kg" quando existir |
| Consultar | Manter "consultar" para sabores/feijão variável |
| Preços | Só no JSON — nunca no copy de descrição |

## Chamadas institucionais

- Rooftop em Natal-RN, vista para o mar e Morro do Careca
- WhatsApp e Instagram para pedidos e contato
- Gorjeta 10% e couvert em dias de música ao vivo (texto legal do PDF)

## Para editar no futuro

1. Abra `data/menu-data.json`
2. Altere `name` ou `description` do item
3. Regenere PDF e republice o site (ver `EDIT-GUIDE.md` após Fase 6)
