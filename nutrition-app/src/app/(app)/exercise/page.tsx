import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { getDefaultUser } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteEntryButton } from "@/components/DeleteEntryButton";

export default async function ExercisePage() {
  const user = await getDefaultUser();
  const entries = await prisma.exerciseEntry.findMany({
    where: { userId: user.id },
    orderBy: { performedAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Ejercicio</h1>
        <Link href="/exercise/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        </Link>
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">Aún no hay ejercicio registrado.</p>
      )}

      <div className="flex flex-col gap-2">
        {entries.map((e) => (
          <Card key={e.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium capitalize">{e.type}</p>
                <p className="text-xs text-muted-foreground">
                  {e.durationMin ? `${e.durationMin} min · ` : ""}
                  {e.caloriesBurned ? `${e.caloriesBurned} kcal · ` : ""}
                  {e.performedAt.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <DeleteEntryButton endpoint={`/api/exercise/${e.id}`} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
