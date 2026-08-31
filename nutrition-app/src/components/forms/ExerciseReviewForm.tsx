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
  type: z.string().min(1, "Indica el tipo de actividad"),
  durationMin: z.coerce.number().nullable().optional(),
  caloriesBurned: z.coerce.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type ExerciseFormValues = z.output<typeof schema>;
type ExerciseFormInput = z.input<typeof schema>;

export function ExerciseReviewForm({
  defaultValues,
  confidence,
  onSubmit,
  submitting,
}: {
  defaultValues: Partial<ExerciseFormInput>;
  confidence?: number;
  onSubmit: (values: ExerciseFormValues) => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExerciseFormInput, unknown, ExerciseFormValues>({ resolver: zodResolver(schema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {confidence != null && (
        <Badge variant={confidence < 0.7 ? "warning" : "default"} className="w-fit">
          Confianza IA: {Math.round(confidence * 100)}%
        </Badge>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>Tipo de actividad</Label>
        <Input {...register("type")} />
        {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Duración (min)</Label>
          <Input type="number" step="1" {...register("durationMin")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Calorías quemadas</Label>
          <Input type="number" step="1" {...register("caloriesBurned")} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Notas</Label>
        <Textarea rows={2} {...register("notes")} />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Guardando..." : "Guardar ejercicio"}
      </Button>
    </form>
  );
}
