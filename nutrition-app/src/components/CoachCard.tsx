"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CoachCard({
  latestSummary,
  latestHighlights,
  latestDate,
}: {
  latestSummary?: string;
  latestHighlights?: string[];
  latestDate?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/coach", { method: "POST" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo generar el análisis");
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Coach diario</CardTitle>
        <Button size="sm" variant="outline" onClick={generate} disabled={loading}>
          <Sparkles className="h-3.5 w-3.5" />
          {loading ? "Analizando..." : "Analizar"}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!error && latestSummary && (
          <div className="flex flex-col gap-3">
            <p className="text-sm leading-relaxed">{latestSummary}</p>
            {latestHighlights && latestHighlights.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {latestHighlights.map((h, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">•</span>
                    {h}
                  </li>
                ))}
              </ul>
            )}
            {latestDate && (
              <p className="text-xs text-muted-foreground">
                Último análisis: {new Date(latestDate).toLocaleString("es-ES")}
              </p>
            )}
          </div>
        )}
        {!error && !latestSummary && (
          <p className="text-sm text-muted-foreground">
            Pulsa &ldquo;Analizar&rdquo; para que la IA revise tu semana y te dé consejos.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
