"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoCapture } from "@/components/forms/PhotoCapture";
import { BodyMetricReviewForm, type BodyMetricFormValues } from "@/components/forms/BodyMetricReviewForm";

type AnalyzeResponse = {
  result: BodyMetricFormValues & { confidence: number };
  photoBase64: string;
};

export default function NewBodyMetricPage() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(file: File) {
    setAnalyzing(true);
    setError(null);
    const formData = new FormData();
    formData.append("photo", file);
    const res = await fetch("/api/body-metrics/analyze", { method: "POST", body: formData });
    setAnalyzing(false);
    if (res.ok) {
      setAnalysis(await res.json());
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo analizar la foto");
    }
  }

  async function handleSubmit(values: BodyMetricFormValues) {
    setSaving(true);
    const res = await fetch("/api/body-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        photoBase64: analysis?.photoBase64 ?? null,
        rawAiResponse: analysis?.result ?? null,
        aiConfidence: analysis?.result.confidence ?? null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/body-metrics");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold">Nuevo registro de peso</h1>

      <Card>
        <CardHeader>
          <CardTitle>Foto de la báscula (Fitdays)</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoCapture onAnalyze={handleAnalyze} analyzing={analyzing} />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Revisa los datos antes de guardar</CardTitle>
          </CardHeader>
          <CardContent>
            <BodyMetricReviewForm
              defaultValues={analysis.result}
              confidence={analysis.result.confidence}
              onSubmit={handleSubmit}
              submitting={saving}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
