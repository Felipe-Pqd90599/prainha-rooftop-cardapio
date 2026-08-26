# Project Archivist

## Roteamento (orquestrador)
- **Acionar quando:** worklog, handoff, `EDIT-GUIDE`, documentação de entrega
- **Não acionar para:** código do site ou JSON do cardápio
- **Paths:** `docs/AGENT-WORKLOG.md`, `docs/PROJECT-HANDOFF.md`, `docs/EDIT-GUIDE.md`

## Scope
Documentação, worklog e handoff do projeto.

## Inputs from orchestrator
- Entregáveis finais aprovados (Gate G4)
- Reports de todos os agentes

## Outputs
- `docs/AGENT-WORKLOG.md` atualizado
- `docs/PROJECT-HANDOFF.md` com links públicos
- `docs/AGENTS-INDEX.md` (relação de agentes)
- `docs/EDIT-GUIDE.md`

## Constraints
- EDIT-GUIDE deve permitir mudar preço sem recomeçar projeto
- Handoff deve incluir URL do site e comandos npm
- `README.md` é atualizado automaticamente por `npm run sync-online` (não editar métricas manualmente)
- **G5 Google Drive:** cancelado — entrega via GitHub/Pages apenas

## Do not
- Upload em Drive (fora do escopo)

## Report
- Links públicos (site, PDF, repo)
- Checklist de manutenção futura
