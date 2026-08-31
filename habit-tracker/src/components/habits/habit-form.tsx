"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FrequencyType, Habit } from "@/lib/types";
import type { HabitFormState } from "@/lib/actions/habits";

const EMOJI_OPTIONS = ["✨", "💧", "📖", "🧘", "🏃", "🥗", "😴", "🧹", "💊", "🎨"];
const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

type Action = (state: HabitFormState, formData: FormData) => Promise<HabitFormState>;

export function HabitForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: Action;
  defaultValues?: Partial<Habit>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<HabitFormState, FormData>(action, null);
  const [emoji, setEmoji] = useState(defaultValues?.emoji ?? "✨");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(
    defaultValues?.frequency_type ?? "daily",
  );
  const defaultDays = Array.isArray(defaultValues?.frequency_config?.days)
    ? (defaultValues!.frequency_config!.days as number[])
    : [];
  const defaultTimes =
    typeof defaultValues?.frequency_config?.times === "number"
      ? (defaultValues!.frequency_config!.times as number)
      : 3;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre del hábito</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={60}
          placeholder="Beber agua"
          defaultValue={defaultValues?.name}
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Icono</Label>
        <input type="hidden" name="emoji" value={emoji} />
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setEmoji(option)}
              aria-pressed={emoji === option}
              className={cn(
                "flex size-10 items-center justify-center rounded-lg border text-lg transition-colors",
                emoji === option
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-secondary",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="frequency_type">Frecuencia</Label>
        <select
          id="frequency_type"
          name="frequency_type"
          value={frequencyType}
          onChange={(e) => setFrequencyType(e.target.value as FrequencyType)}
          className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="daily">Todos los días</option>
          <option value="weekly_n_times">N veces por semana</option>
          <option value="specific_days">Días concretos</option>
        </select>
      </div>

      {frequencyType === "weekly_n_times" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="weekly_times">Veces por semana</Label>
          <Input
            id="weekly_times"
            name="weekly_times"
            type="number"
            min={1}
            max={6}
            defaultValue={defaultTimes}
            className="w-24"
          />
        </div>
      )}

      {frequencyType === "specific_days" && (
        <div className="flex flex-col gap-1.5">
          <Label>Días</Label>
          <div className="flex gap-1.5">
            {DAYS.map((label, index) => (
              <label
                key={label}
                className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-xs font-medium has-[:checked]:border-primary has-[:checked]:bg-primary/10"
              >
                <input
                  type="checkbox"
                  name="specific_days"
                  value={index}
                  defaultChecked={defaultDays.includes(index)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
