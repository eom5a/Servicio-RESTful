import type { Metadata } from "next";

import { HabitForm } from "@/components/habits/habit-form";
import { createHabit } from "@/lib/actions/habits";

export const metadata: Metadata = { title: "Nuevo hábito" };

export default function NewHabitPage() {
  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-6 text-xl font-semibold tracking-tight">Nuevo hábito</h1>
        <HabitForm action={createHabit} submitLabel="Crear hábito" />
      </div>
    </div>
  );
}
