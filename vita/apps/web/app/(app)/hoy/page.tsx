import { sql } from "drizzle-orm";
import { db } from "@vita/db";
import { LogoutButton } from "./logout-button";

// Depende de la sesión y del estado en vivo de la base de datos: nunca
// debe prerenderizarse de forma estática.
export const dynamic = "force-dynamic";

async function checkDatabase(): Promise<boolean> {
  try {
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}

export default async function HoyPage() {
  const dbOk = await checkDatabase();
  const today = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold capitalize">{today}</h1>
          <p className="text-sm text-neutral-400">VITA · Fase 0</p>
        </div>
        <LogoutButton />
      </header>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="mb-2 text-sm font-medium text-neutral-300">
          Estado de la infraestructura
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              dbOk ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <span>
            Base de datos: {dbOk ? "conectada" : "sin conexión"}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-400">
        <p>
          Esta es la pantalla &ldquo;Hoy&rdquo; provisional de la Fase 0. Su
          diseño definitivo lo decidirán los agentes en la Fase 4, a partir
          de <code>docs/metricas.md</code> y <code>docs/cruces.md</code>.
        </p>
      </section>
    </main>
  );
}
