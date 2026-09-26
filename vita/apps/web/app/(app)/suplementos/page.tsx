import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, supplements } from "@vita/db";
import { SupplementForm } from "./supplement-form";
import { SupplementRowActions } from "./supplement-row-actions";

export const dynamic = "force-dynamic";

export default async function SuplementosPage() {
  const rows = await db
    .select()
    .from(supplements)
    .orderBy(desc(supplements.startDate));

  const today = new Date().toISOString().slice(0, 10);
  const active = rows.filter((r) => !r.endDate || r.endDate >= today);
  const past = rows.filter((r) => r.endDate && r.endDate < today);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-8">
      <header>
        <Link href="/hoy" className="text-sm text-neutral-400 underline">
          ← Volver a Hoy
        </Link>
        <h1 className="mt-2 text-lg font-semibold">
          Suplementos y medicación
        </h1>
      </header>

      <SupplementForm />

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="mb-3 text-sm font-medium text-neutral-300">Activos</h2>
        {active.length === 0 ? (
          <p className="text-sm text-neutral-500">Ninguno registrado.</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {active.map((s) => (
              <li
                key={s.id}
                className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-neutral-200">
                    {s.name}{" "}
                    <span className="text-xs text-neutral-500">
                      ({s.kind === "medicacion" ? "medicación" : "suplemento"})
                    </span>
                  </p>
                  <p className="text-xs text-neutral-500">
                    {[
                      s.dose && s.unit ? `${s.dose} ${s.unit}` : null,
                      s.schedule,
                      s.reason,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <SupplementRowActions id={s.id} active />
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="mb-3 text-sm font-medium text-neutral-300">
            Histórico
          </h2>
          <ul className="space-y-3 text-sm">
            {past.map((s) => (
              <li
                key={s.id}
                className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-neutral-400">
                    {s.name} ({s.startDate} → {s.endDate})
                  </p>
                </div>
                <SupplementRowActions id={s.id} active={false} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
