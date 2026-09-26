"use client";

import { useRouter } from "next/navigation";

export function SupplementRowActions({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const router = useRouter();

  async function handleStop() {
    await fetch(`/api/supplements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endDate: new Date().toISOString().slice(0, 10) }),
    });
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este registro?")) return;
    await fetch(`/api/supplements/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      {active && (
        <button
          onClick={handleStop}
          className="text-xs text-neutral-400 underline"
        >
          Dar de baja
        </button>
      )}
      <button onClick={handleDelete} className="text-xs text-red-400 underline">
        Eliminar
      </button>
    </div>
  );
}
