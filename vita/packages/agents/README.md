# @vita/agents

Los 5 agentes de VITA (Director, Nutrición, Métricas, Deporte, Doctor)
construidos con `@anthropic-ai/claude-agent-sdk`:

- `src/prompts.ts` — system prompt de cada agente (responsabilidades y,
  en el caso del Doctor, sus límites clínicos obligatorios).
- `src/tools.ts` — herramientas MCP propias (`vita`) para leer el estado
  real del usuario (perfil, fase, pesajes, actividad) y escribir en la
  memoria compartida (`agent_insights`, `agent_decisions`).
- `src/agents.ts` — las `AgentDefinition` de los 4 subagentes de dominio y
  `runDirector()`, que lanza una sesión del Director (con acceso a los
  subagentes vía la herramienta Agent) y devuelve el resultado final.

Todavía no está conectado a jobs reales del worker (eso llega en fases
posteriores, cuando haya datos reales que procesar); en la Fase 1 se ha
usado para que cada agente investigue su dominio y escriba
`knowledge/<agente>/`.

Requiere `ANTHROPIC_API_KEY` (o sesión de Claude Code autenticada) en el
entorno donde se ejecute, y el modelo de cada agente es configurable por
variable de entorno (ver `.env.example`).
