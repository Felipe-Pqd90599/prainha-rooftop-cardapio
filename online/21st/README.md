# Cardápio Prainha — versão 21st.dev

Página experimental do cardápio montada com componentes do [21st.dev](https://21st.dev), integrada aos dados reais do projeto (`online/data/`).

## Visualizar localmente

Na raiz do repositório:

```bash
npx serve online
```

Abra: **http://localhost:3000/21st/**

Alternativa com Python:

```bash
cd online && python -m http.server 8080
```

Abra: **http://localhost:8080/21st/**

## Componentes 21st utilizados

| Papel | Componente | ID | Autor | Código |
|-------|-----------|-----|-------|--------|
| Hero | Floating Food Hero | 8435 | ravikatiyar162 | Recuperado via `get_component` |
| Card de item | Menu Item Card | 7794 | ravikatiyar162 | Recuperado via `get_component` |
| Navegação | Animated Navigation Tabs | 575 | ln-dev7 | Metadata only — CSS adaptado |
| Modal | Dialog | 378 | originui | Metadata only — CSS adaptado |

## Adaptação técnica

- Componentes originais são **React + Tailwind + shadcn**; foram convertidos para **HTML/CSS/JS vanilla**, alinhado às convenções do projeto.
- Dados carregados de `../data/menu-data.json`, `restaurant-info.json` e `design-tokens.json`.
- Fotos em `../assets/fotos/`.
- Lógica de porções, combo de burgers e WhatsApp reutilizada do `online/app.js` de referência.

## Limitações

1. **Cota free do 21st**: apenas 2 retrievals de código/dia (`get_component`). Tabs e Dialog não tiveram código recuperado — layout baseado em metadata e previews.
2. **Geração AI bloqueada**: `generate` (sketch) também atingiu limite free; não foi possível gerar variantes adicionais.
3. **Sem tema 21st**: busca por themes dark/gold não retornou resultados aplicáveis; cores vêm dos tokens oficiais Prainha (turquesa + bege).
4. **Página separada**: não substitui `online/index.html`; convive como alternativa em `online/21st/`.

## Visual (tema claro)

- **Paleta**: azul mar (`#7EC8E3`, `#5BB5C9`) + branco, texto escuro (`#1e3a4f`), preços em bege areia (`#8B7049`).
- **Background**: foto `capa-prainha-rooftop.jpg` com overlay em gradiente céu→areia; fallback `#b8dce8` se a imagem não carregar.
- **Tokens**: `applyTokens` em `app.js` usa tema claro local (`LIGHT_21ST_COLORS`), não o tema escuro de `design-tokens.json`.

## Atualizar após mudança no JSON

Edite `online/data/menu-data.json` (ou rode o pipeline de sync do projeto). Recarregue a página — não há build.
