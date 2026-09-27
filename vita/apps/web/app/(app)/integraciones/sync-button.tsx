"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/integrations/strava/sync?days=30", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error sincronizando");
      setMessage(`${data.saved} entrenamientos nuevos (${data.fetched} revisados).`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error sincronizando");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={syncing}
        className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 disabled:opacity-50"
      >
        {syncing ? "Sincronizando…" : "Sincronizar ahora (últimos 30 días)"}
      </button>
      {message && <p className="mt-2 text-xs text-neutral-400">{message}</p>}
    </div>
  );
}
