import { sql } from "drizzle-orm";
import { db } from "@vita/db";

export const HEALTHCHECK_QUEUE = "infra-healthcheck";

export type HealthcheckJobData = {
  reason: string;
};

/**
 * Job de comprobación de la Fase 0: confirma que el worker puede leer/escribir
 * en la misma base de datos que la web. Los jobs reales de los agentes
 * (Fase 1) sustituirán a este.
 */
export async function runHealthcheck(data: HealthcheckJobData): Promise<void> {
  const result = await db.execute(sql`select now() as ts`);
  console.log(
    `[worker] healthcheck ok (${data.reason}) — hora del servidor: ${result[0]?.ts}`,
  );
}
