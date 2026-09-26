# Fase 1 — Agentes y fase de investigación: resumen para validar

Estado: **completa**, pendiente de validación por Enric antes de pasar a
la Fase 2 (objetivos y métricas).

## 1. Código: los 5 agentes (`packages/agents`)

Implementados con `@anthropic-ai/claude-agent-sdk` (el mismo motor que
Claude Code):

- **Director** (`agent: 'director'`, modelo `AGENT_DIRECTOR_MODEL`):
  orquesta a los 4 subagentes vía la herramienta Agent, consolida sus
  conclusiones, mantiene el estado de fase/objetivos y revisa la base de
  conocimiento de los demás.
- **Nutrición, Métricas, Deporte** (modelo `AGENT_*_MODEL`, por defecto
  Sonnet) y **Doctor** (`AGENT_DOCTOR_MODEL`, por defecto Opus): cada uno
  con su system prompt (responsabilidades de la sección 3 del documento
  de arranque; el Doctor incluye sus 4 límites clínicos obligatorios de
  forma literal en el prompt).
- Herramientas MCP propias (`src/tools.ts`): `get_user_context`,
  `get_recent_body_measurements`, `get_recent_daily_activity` (lectura),
  `record_insight` y `record_decision` (escritura en `agent_insights` /
  `agent_decisions`, la memoria compartida). Todos los agentes tienen
  además `WebSearch`, `WebFetch`, `Read` y `Glob`; solo el Director tiene
  la herramienta `Agent` para invocar subagentes.
- Verificado: compila y tipa contra el SDK real (`pnpm --filter
  @vita/agents build`).
- **No conectado todavía a jobs reales del worker** — no hay datos reales
  que procesar hasta la Fase 3 (ingesta). `runDirector()` existe y está
  listo para usarse en cuanto haga falta.

## 2. Cómo se generó `knowledge/` en esta pasada (transparencia de proceso)

Los 4 documentos de investigación **no se generaron ejecutando
`runDirector()` en producción** (eso requeriría el worker desplegado con
`ANTHROPIC_API_KEY` configurada). En su lugar, en esta sesión de
desarrollo se delegó la investigación de cada dominio a un agente de
investigación con acceso a WebSearch/WebFetch, siguiendo exactamente los
subtemas y el formato (afirmación + nivel de evidencia + fuente) que los
prompts de `packages/agents/src/prompts.ts` exigen a los agentes reales.
El Director (quien escribe este resumen) revisó cada documento antes de
aceptarlo, comprobando que las fuentes fueran reales y verificables y que
los niveles de evidencia fueran honestos.

**Implicación práctica:** el contenido de `knowledge/` es correcto para
arrancar la Fase 2, pero no es algo que el sistema regenere solo — en
producción, refrescar esta base de conocimiento (nueva evidencia, nuevos
estudios) requerirá volver a invocar a cada agente explícitamente, no
ocurre automáticamente.

## 3. Resumen por dominio

| Dominio | Archivo | Subtemas cubiertos | Fuentes reales | Puntos con evidencia débil (declarados explícitamente en el propio documento) |
|---|---|---|---|---|
| Nutrición | `knowledge/nutricion/investigacion.md` | 6/6 | 14 | Reverse diet (sin ECA que valide un protocolo específico); extrapolación del estudio MATADOR (obesidad) a atletas de fuerza |
| Métricas | `knowledge/metricas/investigacion.md` | 4/4 | 10 | Ventana óptima de media móvil (7 vs. 14 días, es heurística); umbral numérico exacto de alerta de pérdida de masa magra; "edad metabólica" de básculas de consumo (sin validación publicada) |
| Deporte | `knowledge/deporte/investigacion.md` | 5/5 | 13 | Zonas de FC por Karvonen (sin ECA que las compare directamente con prueba de laboratorio en población recreativa) |
| Doctor | `knowledge/doctor/investigacion.md` | 11/11 | ~20 | CLA como "fat burner" (sin revisión sistemática sólida que citar) |

En los cuatro casos, donde no se encontró una fuente sólida se dijo
explícitamente en el documento en vez de rellenar con una cita
inventada — es el criterio más importante que se pidió a los agentes de
investigación, por encima de parecer exhaustivos.

## 4. Límites clínicos del Doctor: verificación

Revisado línea a línea: los 11 puntos de `knowledge/doctor/` mantienen
tono no diagnóstico ("puede verse afectado por...", nunca "tienes..."),
toda desviación se remite a "comentar con tu médico", y se distingue
evidencia sólida (NIH/MedlinePlus, position stands ISSN, revisiones
sistemáticas) de evidencia más limitada en cada punto. Cumple los 4
límites obligatorios del prompt del Doctor.

## 5. Decisiones abiertas para Enric

- ¿Validas el contenido de los 4 documentos de `knowledge/` tal cual, o
  hay algo que quieras que se investigue distinto/más a fondo antes de
  usarlo como base para la Fase 2 (objetivos y métricas)?
- El modelo por agente en `.env.example` usa valores por defecto
  razonables (Opus para Director/Doctor, Sonnet para el resto, Haiku
  para tareas mecánicas) — ¿los mantienes o prefieres ajustar alguno?
- `AGENT_MONTHLY_BUDGET_USD=30` es un valor de partida arbitrario — no
  hay todavía datos de uso real para calibrarlo.

## Siguiente paso

Fase 2: con este `knowledge/` como base, los agentes (Nutrición,
Métricas, Deporte, Doctor bajo revisión del Director) definirían
`docs/objetivos.md`, `docs/metricas.md`, `docs/cruces.md` y
`docs/informes.md` a partir del punto de partida de Enric (sección 1 del
documento de arranque). Se empieza solo cuando esta fase quede validada.
