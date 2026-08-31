"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  weightKg: z.coerce.number().positive("Introduce un peso válido"),
  bodyFatPercent: z.coerce.number().nullable().optional(),
  muscleMassKg: z.coerce.number().nullable().optional(),
  waterPercent: z.coerce.number().nullable().optional(),
  visceralFat: z.coerce.number().nullable().optional(),
  boneMassKg: z.coerce.number().nullable().optional(),
  bmr: z.coerce.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type BodyMetricFormValues = z.output<typeof schema>;
type BodyMetricFormInput = z.input<typeof schema>;

export function BodyMetricReviewForm({
  defaultValues,
  confidence,
  onSubmit,
  submitting,
}: {
  defaultValues: Partial<BodyMetricFormInput>;
  confidence?: number;
  onSubmit: (values: BodyMetricFormValues) => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BodyMetricFormInput, unknown, BodyMetricFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {confidence != null && (
        <Badge variant={confidence < 0.7 ? "warning" : "default"} className="w-fit">
          Confianza IA: {Math.round(confidence * 100)}%
        </Badge>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Peso (kg)" error={errors.weightKg?.message}>
          <Input type="number" step="0.1" {...register("weightKg")} />
        </Field>
        <Field label="% Grasa corporal" error={errors.bodyFatPercent?.message}>
          <Input type="number" step="0.1" {...register("bodyFatPercent")} />
        </Field>
        <Field label="Masa muscular (kg)">
          <Input type="number" step="0.1" {...register("muscleMassKg")} />
        </Field>
        <Field label="% Agua">
          <Input type="number" step="0.1" {...register("waterPercent")} />
        </Field>
        <Field label="Grasa visceral">
          <Input type="number" step="0.1" {...register("visceralFat")} />
        </Field>
        <Field label="Masa ósea (kg)">
          <Input type="number" step="0.1" {...register("boneMassKg")} />
        </Field>
        <Field label="Metabolismo basal (kcal)">
          <Input type="number" step="1" {...register("bmr")} />
        </Field>
      </div>

      <Field label="Notas">
        <Textarea rows={2} {...register("notes")} />
      </Field>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Guardando..." : "Guardar registro"}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
