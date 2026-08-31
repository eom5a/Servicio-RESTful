"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  notes: z.string().nullable().optional(),
  sets: z
    .array(
      z.object({
        exerciseName: z.string().min(1, "Requerido"),
        weightKg: z.coerce.number().nullable().optional(),
        reps: z.coerce.number().nullable().optional(),
        rpe: z.coerce.number().nullable().optional(),
      }),
    )
    .min(1),
});

type FormValues = z.output<typeof schema>;
type FormInput = z.input<typeof schema>;

export function WorkoutSessionForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { sets: [{ exerciseName: "", weightKg: undefined, reps: undefined, rpe: undefined }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "sets" });

  async function onSubmit(values: FormValues) {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: values.notes || null,
        sets: values.sets.map((s, i) => ({ ...s, setNumber: i + 1 })),
      }),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/workouts");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_4.5rem_3.5rem_3.5rem_auto] items-end gap-2">
            <div className="flex flex-col gap-1">
              {index === 0 && <Label className="text-xs">Ejercicio</Label>}
              <Input placeholder="Press banca" {...register(`sets.${index}.exerciseName`)} />
            </div>
            <div className="flex flex-col gap-1">
              {index === 0 && <Label className="text-xs">Kg</Label>}
              <Input type="number" step="0.5" {...register(`sets.${index}.weightKg`)} />
            </div>
            <div className="flex flex-col gap-1">
              {index === 0 && <Label className="text-xs">Reps</Label>}
              <Input type="number" step="1" {...register(`sets.${index}.reps`)} />
            </div>
            <div className="flex flex-col gap-1">
              {index === 0 && <Label className="text-xs">RPE</Label>}
              <Input type="number" step="0.5" {...register(`sets.${index}.rpe`)} />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        {errors.sets?.root?.message && <p className="text-xs text-destructive">{errors.sets.root.message}</p>}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => append({ exerciseName: "", weightKg: undefined, reps: undefined, rpe: undefined })}
      >
        <Plus className="h-4 w-4" />
        Añadir serie
      </Button>

      <div className="flex flex-col gap-1.5">
        <Label>Notas de la sesión</Label>
        <Textarea rows={2} {...register("notes")} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Guardando..." : "Guardar sesión"}
      </Button>
    </form>
  );
}
