"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FoodCandidate } from "@vita/integrations";

const MEAL_TYPES = [
  { value: "desayuno", label: "Desayuno" },
  { value: "comida", label: "Comida" },
  { value: "cena", label: "Cena" },
  { value: "snack", label: "Snack" },
] as const;

export function MealLogger() {
  const router = useRouter();
  const [mealType, setMealType] = useState<(typeof MEAL_TYPES)[number]["value"]>("comida");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<FoodCandidate | null>(null);
  const [grams, setGrams] = useState("100");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error buscando alimentos");
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error buscando alimentos");
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd() {
    if (!selected) return;
    const gramsNumber = Number(grams);
    if (!Number.isFinite(gramsNumber) || gramsNumber <= 0) {
      setError("Introduce una cantidad en gramos válida");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType,
          items: [{ candidate: selected, grams: gramsNumber }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error guardando la comida");

      setSelected(null);
      setResults([]);
      setQuery("");
      setGrams("100");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando la comida");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="mb-3 text-sm font-medium text-neutral-300">Registrar comida</h2>

      <div className="mb-3 flex gap-2">
        {MEAL_TYPES.map((mt) => (
          <button
            key={mt.value}
            type="button"
            onClick={() => setMealType(mt.value)}
            className={`rounded-full px-3 py-1 text-xs ${
              mealType === mt.value
                ? "bg-neutral-100 text-neutral-900"
                : "bg-neutral-800 text-neutral-300"
            }`}
          >
            {mt.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="mb-3 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar alimento…"
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-200 disabled:opacity-50"
        >
          {searching ? "…" : "Buscar"}
        </button>
      </form>

      {results.length > 0 && (
        <ul className="mb-3 max-h-48 space-y-1 overflow-y-auto">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setSelected(r)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  selected === r
                    ? "bg-neutral-700 text-neutral-100"
                    : "bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <span className="font-medium">{r.name}</span>
                {r.brand && <span className="text-neutral-400"> — {r.brand}</span>}
                <span className="block text-xs text-neutral-500">
                  {r.kcal} kcal · {r.proteinG} g proteína /100 g
                  {r.origin === "openfoodfacts" ? " · Open Food Facts" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-neutral-800/60 p-3">
          <span className="flex-1 text-sm">{selected.name}</span>
          <input
            type="number"
            min={1}
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="w-20 rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-neutral-100"
          />
          <span className="text-xs text-neutral-400">g</span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Añadir"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
