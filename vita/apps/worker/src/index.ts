import { PgBoss } from "pg-boss";
import {
  HEALTHCHECK_QUEUE,
  runHealthcheck,
  type HealthcheckJobData,
} from "./jobs/healthcheck.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL no está definida (ver .env.example)");
}

async function main() {
  const boss = new PgBoss(connectionString!);

  boss.on("error", (error) => console.error("[worker] pg-boss error", error));

  await boss.start();
  await boss.createQueue(HEALTHCHECK_QUEUE);

  await boss.work<HealthcheckJobData>(HEALTHCHECK_QUEUE, async ([job]) => {
    await runHealthcheck(job.data);
  });

  // Smoke test: confirma en el arranque que worker, cola y BD están conectados.
  await boss.send(HEALTHCHECK_QUEUE, { reason: "worker-startup" });

  console.log("[worker] VITA worker en marcha (Fase 0). Esperando jobs…");

  const shutdown = async () => {
    console.log("[worker] cerrando…");
    await boss.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("[worker] error fatal al arrancar", error);
  process.exit(1);
});
