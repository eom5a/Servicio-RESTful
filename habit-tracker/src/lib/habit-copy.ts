import type { Habit } from "@/lib/types";

const DAY_LABELS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

export function describeFrequency(habit: Pick<Habit, "frequency_type" | "frequency_config">) {
  if (habit.frequency_type === "daily") return "Todos los días";

  if (habit.frequency_type === "weekly_n_times") {
    const times = typeof habit.frequency_config.times === "number" ? habit.frequency_config.times : 3;
    return `${times}x por semana`;
  }

  const days = Array.isArray(habit.frequency_config.days) ? (habit.frequency_config.days as number[]) : [];
  if (days.length === 0) return "Días concretos";
  return days
    .slice()
    .sort()
    .map((d) => DAY_LABELS[d])
    .join(", ");
}
