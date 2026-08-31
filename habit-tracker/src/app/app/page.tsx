import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { describeFrequency } from "@/lib/habit-copy";
import type { Habit } from "@/lib/types";

export const metadata: Metadata = { title: "Hoy" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .is("archived_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<Habit[]>();

  const items = habits ?? [];

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Tus hábitos</h1>
        <Button size="sm" asChild>
          <Link href="/app/habits/new">
            <Plus className="size-4" />
            Nuevo hábito
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Todavía no tienes hábitos. El check-in de un tap llega en la Fase 2 — de
              momento puedes crear y gestionar tus hábitos aquí.
            </p>
            <Button asChild>
              <Link href="/app/habits/new">Crear mi primer hábito</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((habit) => (
            <li key={habit.id}>
              <Card>
                <CardContent className="flex items-center gap-3 py-4">
                  <span className="text-xl">{habit.emoji ?? "✨"}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{habit.name}</p>
                    <p className="text-xs text-muted-foreground">{describeFrequency(habit)}</p>
                  </div>
                  {habit.current_streak > 0 && (
                    <span className="flex items-center gap-1 text-sm font-medium text-accent-foreground">
                      <Flame className="size-4 text-accent" />
                      {habit.current_streak}
                    </span>
                  )}
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/app/habits/${habit.id}/edit`} aria-label="Editar hábito">
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
