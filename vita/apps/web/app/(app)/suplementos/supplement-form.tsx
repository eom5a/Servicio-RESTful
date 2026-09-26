"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SupplementForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"suplemento" | "medicacion">("suplemento");
  const [dose, setDose] = useState("");
  const [unit, setUnit] = useState("");
  const [schedule, setSchedule] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/supplements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          kind,
          dose: dose ? Number(dose) : undefined,
          unit: unit || undefined,
          schedule: schedule || undefined,
          reason: reason || undefined,
          startDate: new Date().toISOString().slice(0, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error guardando");

      setName("");
      setDose("");
      setUnit("");
      setSchedule("");
      setReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
    >
      <h2 className="mb-3 text-sm font-medium text-neutral-300">
        Añadir suplemento o medicación
      </h2>

      <div className="mb-3 flex gap-2">
        {(["suplemento", "medicacion"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-full px-3 py-1 text-xs ${
              kind === k
                ? "bg-neutral-100 text-neutral-900"
                : "bg-neutral-800 text-neutral-300"
            }`}
          >
            {k === "suplemento" ? "Suplemento" : "Medicación"}
          </button>
        ))}
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre"
        required
        className="mb-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
      />
      <div className="mb-2 flex gap-2">
        <input
          value={dose}
          onChange={(e) => setDose(e.target.value)}
          type="number"
          step="any"
          placeholder="Dosis"
          className="w-1/2 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
        />
        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Unidad (g, mg, UI…)"
          className="w-1/2 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
        />
      </div>
      <input
        value={schedule}
        onChange={(e) => setSchedule(e.target.value)}
        placeholder="Horario (p. ej. con el desayuno)"
        className="mb-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
      />
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motivo"
        className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
      />

      {error && (
        <p className="mb-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900 disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Añadir"}
      </button>
    </form>
  );
}
