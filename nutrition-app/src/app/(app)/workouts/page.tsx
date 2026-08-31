import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { getDefaultUser } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteEntryButton } from "@/components/DeleteEntryButton";

export default async function WorkoutsPage() {
  const user = await getDefaultUser();
  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 50,
    include: { sets: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Gimnasio</h1>
        <Link href="/workouts/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nueva sesión
          </Button>
        </Link>
      </div>

      {sessions.length === 0 && (
        <p className="text-sm text-muted-foreground">Aún no hay sesiones registradas.</p>
      )}

      <div className="flex flex-col gap-3">
        {sessions.map((s) => {
          const exercises = Array.from(new Set(s.sets.map((set) => set.exerciseName)));
          return (
            <Card key={s.id}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <p className="text-xs text-muted-foreground">
                    {s.date.toLocaleDateString("es-ES", { dateStyle: "medium" })}
                  </p>
                  <DeleteEntryButton endpoint={`/api/workouts/${s.id}`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  {exercises.map((name) => {
                    const setsForExercise = s.sets.filter((set) => set.exerciseName === name);
                    return (
                      <div key={name} className="text-sm">
                        <span className="font-medium">{name}</span>{" "}
                        <span className="text-muted-foreground">
                          {setsForExercise
                            .map((set) => `${set.weightKg ?? "-"}kg×${set.reps ?? "-"}`)
                            .join(", ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {s.notes && <p className="mt-2 text-xs text-muted-foreground">{s.notes}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
