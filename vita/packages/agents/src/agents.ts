import { query, type AgentDefinition, type Options } from "@anthropic-ai/claude-agent-sdk";
import {
  DIRECTOR_PROMPT,
  NUTRICION_PROMPT,
  METRICAS_PROMPT,
  DEPORTE_PROMPT,
  DOCTOR_PROMPT,
} from "./prompts.js";
import { vitaMcpServer } from "./tools.js";

// Herramientas base disponibles para todos los agentes: búsqueda web (para
// investigar su dominio) y lectura de la base de conocimiento versionada
// (`knowledge/<agente>/`). Sin Bash/Edit/Write: estos son agentes de
// análisis, no agentes de codificación.
const BASE_TOOLS = ["WebSearch", "WebFetch", "Read", "Glob"];

// El Director, además, necesita la herramienta Agent para poder invocar a
// los 4 subagentes de dominio. Los subagentes NO la tienen: no pueden
// invocarse recursivamente entre ellos, solo el Director orquesta.
const DIRECTOR_TOOLS = [...BASE_TOOLS, "Agent"];

function subagent(
  description: string,
  prompt: string,
  model: string | undefined,
): AgentDefinition {
  return {
    description,
    prompt,
    tools: BASE_TOOLS,
    model,
  };
}

export const VITA_AGENTS: Record<string, AgentDefinition> = {
  director: {
    description:
      "Orquestador de VITA: decide qué agentes intervienen y consolida sus conclusiones.",
    prompt: DIRECTOR_PROMPT,
    tools: DIRECTOR_TOOLS,
    model: process.env.AGENT_DIRECTOR_MODEL,
  },
  nutricion: subagent(
    "Objetivos de macros, adherencia a la dieta y TDEE adaptativo.",
    NUTRICION_PROMPT,
    process.env.AGENT_NUTRITION_MODEL,
  ),
  metricas: subagent(
    "Composición corporal, tendencias de peso/grasa y proyección hacia el objetivo.",
    METRICAS_PROMPT,
    process.env.AGENT_METRICS_MODEL,
  ),
  deporte: subagent(
    "Análisis de entrenamientos, carga y recuperación.",
    DEPORTE_PROMPT,
    process.env.AGENT_SPORT_MODEL,
  ),
  doctor: subagent(
    "Analíticas, suplementación y medicación, con límites clínicos estrictos.",
    DOCTOR_PROMPT,
    process.env.AGENT_DOCTOR_MODEL,
  ),
};

export type RunAgentResult = {
  ok: boolean;
  result: string;
  sessionId: string | undefined;
  costUsd: number;
  numTurns: number;
};

/**
 * Ejecuta una sesión del agente Director (con acceso a los 4 subagentes de
 * dominio vía la herramienta Agent) sobre un prompt puntual, y devuelve el
 * resultado final ya consolidado. Pensado para invocarse desde jobs del
 * worker (Fase 3+); en la Fase 1 se usa para que los agentes investiguen su
 * dominio y escriban `knowledge/<agente>/`.
 */
export async function runDirector(
  prompt: string,
  opts: { cwd: string; maxBudgetUsd?: number } & Partial<Options> = {
    cwd: process.cwd(),
  },
): Promise<RunAgentResult> {
  const { cwd, maxBudgetUsd, ...rest } = opts;

  const q = query({
    prompt,
    options: {
      agent: "director",
      agents: VITA_AGENTS,
      mcpServers: { vita: vitaMcpServer },
      tools: DIRECTOR_TOOLS,
      permissionMode: "bypassPermissions",
      cwd,
      maxBudgetUsd:
        maxBudgetUsd ??
        Number(process.env.AGENT_MONTHLY_BUDGET_USD ?? "30"),
      ...rest,
    },
  });

  let final: RunAgentResult = {
    ok: false,
    result: "",
    sessionId: undefined,
    costUsd: 0,
    numTurns: 0,
  };

  for await (const message of q) {
    if (message.type === "result") {
      final = {
        ok: message.subtype === "success" && !message.is_error,
        result: message.subtype === "success" ? message.result : "",
        sessionId: message.session_id,
        costUsd: message.total_cost_usd,
        numTurns: message.num_turns,
      };
    }
  }

  return final;
}
