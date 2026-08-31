import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HabitForm } from "@/components/habits/habit-form";
import { Button } from "@/components/ui/button";
import { archiveHabit, updateHabit } from "@/lib/actions/habits";
import { createClient } from "@/lib/supabase/server";
import type { Habit } from "@/lib/types";

export const metadata: Metadata = { title: "Editar hábito" };

export default async function EditHabitPage(props: PageProps<"/app/habits/[id]/edit">) {
  const { id } = await props.params;

  const supabase = await createClient();
  const { data: habit } = await supabase
    .from("habits")
    .select("*")
    .eq("id", id)
    .is("archived_at", null)
    .single<Habit>();

  if (!habit) notFound();

  const boundUpdate = updateHabit.bind(null, habit.id);
  const boundArchive = archiveHabit.bind(null, habit.id);

  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-6 text-xl font-semibold tracking-tight">Editar hábito</h1>
        <HabitForm action={boundUpdate} defaultValues={habit} submitLabel="Guardar cambios" />

        <form action={boundArchive} className="mt-8 border-t border-border pt-6">
          <Button type="submit" variant="outline" className="text-destructive">
            Archivar hábito
          </Button>
        </form>
      </div>
    </div>
  );
}
