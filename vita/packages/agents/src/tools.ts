import { z } from "zod";
import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { desc, eq, gte } from "drizzle-orm";
import {
  db,
  userProfile,
  phases,
  bodyMeasurements,
  dailyActivity,
  agentInsights,
  agentDecisions,
  agentNameEnum,
  insightSeverityEnum,
} from "@vita/db";

const agentName = z.enum(agentNameEnum.enumValues);
const severity = z.enum(insightSeverityEnum.enumValues);

function textResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

const getUserContext = tool(
  "get_user_context",
  "Devuelve el perfil del usuario y la fase actual (tipo, fechas y objetivos vigentes). Llama a esto antes de opinar sobre objetivos.",
  {},
  async () => {
    const [profile] = await db.select().from(userProfile).limit(1);
    if (!profile) {
      return textResult({ profile: null, phase: null });
    }
    const [phase] = profile.currentPhaseId
      ? await db
          .select()
          .from(phases)
          .where(eq(phases.id, profile.currentPhaseId))
          .limit(1)
      : [];
    return textResult({ profile, phase: phase ?? null });
  },
);

const getRecentBodyMeasurements = tool(
  "get_recent_body_measurements",
  "Devuelve los pesajes (peso, % grasa, masa muscular/magra, agua, grasa visceral, TMB) de los últimos N días, ordenados del más reciente al más antiguo.",
  {
    days: z.number().int().min(1).max(365).default(30),
  },
  async ({ days }) => {
    const rows = await db
      .select()
      .from(bodyMeasurements)
      .where(gte(bodyMeasurements.ts, daysAgo(days)))
      .orderBy(desc(bodyMeasurements.ts));
    return textResult(rows);
  },
);

const getRecentDailyActivity = tool(
  "get_recent_daily_activity",
  "Devuelve la actividad diaria (pasos, kcal gastadas, FC en reposo, HRV, sueño) de los últimos N días.",
  {
    days: z.number().int().min(1).max(365).default(30),
  },
  async ({ days }) => {
    const rows = await db
      .select()
      .from(dailyActivity)
      .where(gte(dailyActivity.date, daysAgo(days).toISOString().slice(0, 10)))
      .orderBy(desc(dailyActivity.date));
    return textResult(rows);
  },
);

const recordInsight = tool(
  "record_insight",
  "Registra una conclusión relevante en la memoria compartida de agentes (tabla agent_insights), visible para el Director y el resto de agentes.",
  {
    agent: agentName,
    type: z.string().min(1).describe("Categoría corta, p. ej. 'tendencia-peso', 'adherencia', 'recuperacion'"),
    severity: severity.default("info"),
    text: z.string().min(1),
    dataRef: z
      .record(z.string(), z.unknown())
      .optional()
      .describe("Datos que sustentan la conclusión (se guardan como JSON)"),
  },
  async ({ agent, type, severity: sev, text, dataRef }) => {
    const [row] = await db
      .insert(agentInsights)
      .values({ agent, type, severity: sev, text, dataRef: dataRef ?? null })
      .returning({ id: agentInsights.id });
    return textResult({ ok: true, id: row?.id });
  },
);

const recordDecision = tool(
  "record_decision",
  "Registra un cambio de objetivo propuesto o aprobado (tabla agent_decisions), con su justificación, para dejar un historial auditable.",
  {
    agent: agentName,
    change: z.string().min(1).describe("Qué cambia, en términos concretos (p. ej. 'kcal objetivo: 2150 -> 2050')"),
    justification: z.string().min(1),
    approved: z.boolean().default(false),
  },
  async ({ agent, change, justification, approved }) => {
    const [row] = await db
      .insert(agentDecisions)
      .values({ agent, change, justification, approved })
      .returning({ id: agentDecisions.id });
    return textResult({ ok: true, id: row?.id });
  },
);

export const vitaMcpServer = createSdkMcpServer({
  name: "vita",
  version: "0.1.0",
  instructions:
    "Herramientas de lectura del estado real del usuario y de escritura en la memoria compartida de agentes de VITA.",
  tools: [
    getUserContext,
    getRecentBodyMeasurements,
    getRecentDailyActivity,
    recordInsight,
    recordDecision,
  ],
});
