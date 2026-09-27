import Link from "next/link";
import { getStravaStatus } from "@vita/integrations";
import { SyncButton } from "./sync-button";

export const dynamic = "force-dynamic";

export default async function IntegracionesPage({
  searchParams,
}: {
  searchParams: Promise<{ strava?: string; strava_error?: string }>;
}) {
  const [status, params] = await Promise.all([getStravaStatus(), searchParams]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-8">
      <header>
        <Link href="/hoy" className="text-sm text-neutral-400 underline">
          ← Volver a Hoy
        </Link>
        <h1 className="mt-2 text-lg font-semibold">Integraciones</h1>
      </header>

      {params.strava === "ok" && (
        <p className="rounded-lg bg-emerald-950 p-3 text-sm text-emerald-400">
          Strava conectado correctamente.
        </p>
      )}
      {params.strava_error && (
        <p className="rounded-lg bg-red-950 p-3 text-sm text-red-400">
          Error conectando Strava: {params.strava_error}
        </p>
      )}

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-300">Strava</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              status.connected
                ? "bg-emerald-950 text-emerald-400"
                : "bg-neutral-800 text-neutral-400"
            }`}
          >
            {status.connected ? "Conectado" : "Sin conectar"}
          </span>
        </div>

        {status.lastSync && (
          <p className="mb-3 text-xs text-neutral-500">
            Última sincronización:{" "}
            {new Intl.DateTimeFormat("es-ES", {
              dateStyle: "short",
              timeStyle: "short",
            }).format(status.lastSync)}
          </p>
        )}

        {status.connected ? (
          <SyncButton />
        ) : (
          <a
            href="/api/integrations/strava/connect"
            className="inline-block rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white"
          >
            Conectar con Strava
          </a>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-400">
        <h2 className="mb-2 text-sm font-medium text-neutral-300">
          Google Health (Fitbit)
        </h2>
        <p>Pendiente de configurar credenciales OAuth de Google Cloud.</p>
      </section>
    </main>
  );
}
