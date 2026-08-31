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
  description: z.string().nullable().optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).nullable().optional(),
  calories: z.coerce.number().nonnegative(),
  proteinG: z.coerce.number().nonnegative(),
  carbsG: z.coerce.number().nonnegative(),
  fatG: z.coerce.number().nonnegative(),
  fiberG: z.coerce.number().nullable().optional(),
});

export type MealFormValues = z.output<typeof schema>;
type MealFormInput = z.input<typeof schema>;

const MEAL_TYPES = [
  { value: "breakfast", label: "Desayuno" },
  { value: "lunch", label: "Comida" },
  { value: "dinner", label: "Cena" },
  { value: "snack", label: "Snack" },
];

export function MealReviewForm({
  defaultValues,
  confidence,
  items,
  onSubmit,
  submitting,
}: {
  defaultValues: Partial<MealFormInput>;
  confidence?: number;
  items?: Array<{ name: string; estimatedGrams?: number | null; calories?: number | null }>;
  onSubmit: (values: MealFormValues) => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MealFormInput, unknown, MealFormValues>({ resolver: zodResolver(schema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {confidence != null && (
        <Badge variant={confidence < 0.7 ? "warning" : "default"} className="w-fit">
          Confianza IA: {Math.round(confidence * 100)}%
        </Badge>
      )}

      {items && items.length > 0 && (
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="mb-1.5 font-medium">Alimentos detectados</p>
          <ul className="flex flex-col gap-0.5 text-muted-foreground">
            {items.map((it, i) => (
              <li key={i}>
                {it.name}
                {it.estimatedGrams ? ` · ${Math.round(it.estimatedGrams)} g` : ""}
                {it.calories ? ` · ${Math.round(it.calories)} kcal` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>Descripción</Label>
        <Textarea rows={2} {...register("description")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Tipo de comida</Label>
        <select
          className="h-10 rounded-md border border-border bg-card px-3 text-sm"
          {...register("mealType")}
        >
          <option value="">—</option>
          {MEAL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Calorías (kcal)" error={errors.calories?.message}>
          <Input type="number" step="1" {...register("calories")} />
        </Field>
        <Field label="Proteína (g)" error={errors.proteinG?.message}>
          <Input type="number" step="0.1" {...register("proteinG")} />
        </Field>
        <Field label="Carbohidratos (g)" error={errors.carbsG?.message}>
          <Input type="number" step="0.1" {...register("carbsG")} />
        </Field>
        <Field label="Grasa (g)" error={errors.fatG?.message}>
          <Input type="number" step="0.1" {...register("fatG")} />
        </Field>
        <Field label="Fibra (g)">
          <Input type="number" step="0.1" {...register("fiberG")} />
        </Field>
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Guardando..." : "Guardar comida"}
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
