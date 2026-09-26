"use client";

import { useState } from "react";
import Link from "next/link";

type ImportResult = {
  parsed: number;
  saved: number;
  warnings: string[];
};

export default function FitdaysImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/integrations/fitdays/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error importando el archivo");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error importando el archivo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-8">
      <header>
        <Link href="/hoy" className="text-sm text-neutral-400 underline">
          ← Volver a Hoy
        </Link>
        <h1 className="mt-2 text-lg font-semibold">Importar pesajes de Fitdays</h1>
        <p className="text-sm text-neutral-400">
          Fitdays no tiene web ni API: exporta desde la app (los tres puntos
          de arriba a la derecha → Exportar) y sube aquí el archivo. Se
          puede volver a subir el mismo export sin duplicar datos.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
      >
        <input
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mb-3 w-full text-sm text-neutral-300"
        />
        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900 disabled:opacity-50"
        >
          {uploading ? "Importando…" : "Importar"}
        </button>
      </form>

      {result && (
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-sm">
          <p className="text-emerald-400">
            {result.saved} pesajes guardados ({result.parsed} filas leídas).
          </p>
          {result.warnings.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-neutral-400">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
