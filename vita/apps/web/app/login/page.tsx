"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "No se ha podido iniciar sesión");
      return;
    }

    router.push("/hoy");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg"
      >
        <h1 className="mb-1 text-xl font-semibold">VITA</h1>
        <p className="mb-6 text-sm text-neutral-400">
          Centro personal de salud, nutrición y rendimiento
        </p>

        <label htmlFor="password" className="mb-1 block text-sm text-neutral-300">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-4 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500"
        />

        {error && (
          <p className="mb-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-neutral-100 px-3 py-2 font-medium text-neutral-900 transition disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
