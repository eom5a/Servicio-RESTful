"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PhotoCapture({
  onAnalyze,
  analyzing,
  label = "Hacer foto o subir imagen",
}: {
  onAnalyze: (file: File) => void;
  analyzing?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onAnalyze(file);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Vista previa" className="max-h-64 rounded-lg border border-border object-contain" />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
        >
          <Camera className="h-6 w-6" />
          <span className="text-sm">{label}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      {preview && (
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={analyzing}>
          Cambiar foto
        </Button>
      )}
      {analyzing && <p className="text-sm text-muted-foreground">Analizando con IA...</p>}
    </div>
  );
}
