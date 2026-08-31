"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PhotoCapture } from "@/components/forms/PhotoCapture";
import { ExerciseReviewForm, type ExerciseFormValues } from "@/components/forms/ExerciseReviewForm";

type AnalyzeResponse = { result: ExerciseFormValues & { confidence: number } };

export default function NewExercisePage() {
  const router = useRouter();
  const [reportText, setReportText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis(formData: FormData) {
    setAnalyzing(true);
    setError(null);
    const res = await fetch("/api/exercise/analyze", { method: "POST", body: formData });
    setAnalyzing(false);
    if (res.ok) {
      setAnalysis(await res.json());
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo analizar");
    }
  }

  async function handleAnalyzeText() {
    if (!reportText.trim()) return;
    const formData = new FormData();
    formData.append("text", reportText);
    await runAnalysis(formData);
  }

  async function handleAnalyzePhoto(file: File) {
    const formData = new FormData();
    formData.append("photo", file);
    await runAnalysis(formData);
  }

  async function handleSubmit(values: ExerciseFormValues) {
    setSaving(true);
    const res = await fetch("/api/exercise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        rawReportText: reportText || null,
        rawAiResponse: analysis?.result ?? null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/exercise");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold">Nuevo ejercicio</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pega el informe de Google Health/Fit</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            rows={4}
            placeholder="Pega aquí el texto del informe de actividad..."
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={handleAnalyzeText} disabled={analyzing || !reportText.trim()}>
            {analyzing ? "Analizando..." : "Analizar texto"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">— o —</p>
          <PhotoCapture onAnalyze={handleAnalyzePhoto} analyzing={analyzing} label="Captura del informe" />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Revisa antes de guardar</CardTitle>
          </CardHeader>
          <CardContent>
            <ExerciseReviewForm
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
