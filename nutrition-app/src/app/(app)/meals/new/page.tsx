"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoCapture } from "@/components/forms/PhotoCapture";
import { MealReviewForm, type MealFormValues } from "@/components/forms/MealReviewForm";

type AnalyzeResponse = {
  result: MealFormValues & {
    confidence: number;
    items: Array<{ name: string; estimatedGrams?: number | null; calories?: number | null }>;
  };
  photoBase64: string;
};

export default function NewMealPage() {
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
    const res = await fetch("/api/meals/analyze", { method: "POST", body: formData });
    setAnalyzing(false);
    if (res.ok) {
      setAnalysis(await res.json());
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo analizar la foto");
    }
  }

  async function handleSubmit(values: MealFormValues) {
    setSaving(true);
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        photoBase64: analysis?.photoBase64 ?? null,
        rawAiResponse: analysis?.result ?? null,
        aiConfidence: analysis?.result.confidence ?? null,
        isEdited: true,
      }),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/meals");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold">Nueva comida</h1>

      <Card>
        <CardHeader>
          <CardTitle>Foto del plato</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoCapture onAnalyze={handleAnalyze} analyzing={analyzing} label="Foto del plato" />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Revisa las macros antes de guardar</CardTitle>
          </CardHeader>
          <CardContent>
            <MealReviewForm
              defaultValues={analysis.result}
              confidence={analysis.result.confidence}
              items={analysis.result.items}
              onSubmit={handleSubmit}
              submitting={saving}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
