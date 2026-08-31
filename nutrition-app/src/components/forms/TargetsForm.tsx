"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  caloriesTarget: z.coerce.number().positive(),
  proteinTargetG: z.coerce.number().positive(),
  carbsTargetG: z.coerce.number().positive(),
  fatTargetG: z.coerce.number().positive(),
  goalBodyFatPct: z.coerce.number().nullable().optional(),
  goalWeightKg: z.coerce.number().nullable().optional(),
});

type FormValues = z.output<typeof schema>;
type FormInput = z.input<typeof schema>;

export function TargetsForm({ defaultValues }: { defaultValues?: Partial<FormInput> }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema), defaultValues });

  async function onSubmit(values: FormValues) {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Calorías objetivo (kcal)" error={errors.caloriesTarget?.message}>
          <Input type="number" step="1" {...register("caloriesTarget")} />
        </Field>
        <Field label="Proteína objetivo (g)" error={errors.proteinTargetG?.message}>
          <Input type="number" step="1" {...register("proteinTargetG")} />
        </Field>
        <Field label="Carbohidratos objetivo (g)" error={errors.carbsTargetG?.message}>
          <Input type="number" step="1" {...register("carbsTargetG")} />
        </Field>
        <Field label="Grasa objetivo (g)" error={errors.fatTargetG?.message}>
          <Input type="number" step="1" {...register("fatTargetG")} />
        </Field>
        <Field label="Meta % grasa corporal">
          <Input type="number" step="0.1" {...register("goalBodyFatPct")} />
        </Field>
        <Field label="Meta peso (kg)">
          <Input type="number" step="0.1" {...register("goalWeightKg")} />
        </Field>
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Guardando..." : "Guardar objetivos"}
      </Button>
      {saved && <p className="text-center text-sm text-primary">Objetivos actualizados.</p>}
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
