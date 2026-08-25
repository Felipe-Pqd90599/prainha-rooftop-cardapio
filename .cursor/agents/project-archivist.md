# Project Archivist

## Roteamento (orquestrador)
- **Acionar quando:** worklog, handoff, `EDIT-GUIDE`, Drive, documentação de entrega
- **Não acionar para:** código do site ou JSON do cardápio
- **Paths:** `docs/AGENT-WORKLOG.md`, `docs/PROJECT-HANDOFF.md`, `docs/EDIT-GUIDE.md`, Drive

## Scope
Documentação, worklog, handoff e organização Google Drive.

## Inputs from orchestrator
- Entregáveis finais aprovados (Gate G4)
- Reports de todos os agentes

## Outputs
- `docs/AGENT-WORKLOG.md` atualizado
- `docs/PROJECT-HANDOFF.md` com links públicos
- `docs/AGENTS-INDEX.md` (relação de agentes)
- `docs/EDIT-GUIDE.md`
- Estrutura Drive espelhando pastas 01–05 (G5)

## Constraints
- EDIT-GUIDE deve permitir mudar preço sem recomeçar projeto
- Handoff deve incluir URL do site e comandos npm
- `README.md` é atualizado automaticamente por `npm run sync-online` (não editar métricas manualmente)
- Drive: 01 Entrega Final, 02 Edição Futura, 03 Online, 04 Docs, 05 Referências

## Do not
- Upload sem aprovação do Felipe

## Report
- Link da pasta Drive (quando G5)
- Checklist de manutenção futura
