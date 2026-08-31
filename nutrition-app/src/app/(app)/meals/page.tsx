import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { getDefaultUser } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteEntryButton } from "@/components/DeleteEntryButton";

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Desayuno",
  lunch: "Comida",
  dinner: "Cena",
  snack: "Snack",
};

export default async function MealsPage() {
  const user = await getDefaultUser();
  const entries = await prisma.mealEntry.findMany({
    where: { userId: user.id },
    orderBy: { eatenAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Comidas</h1>
        <Link href="/meals/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nueva
          </Button>
        </Link>
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">Aún no hay comidas registradas.</p>
      )}

      <div className="flex flex-col gap-2">
        {entries.map((e) => (
          <Card key={e.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{e.calories} kcal</p>
                  {e.mealType && <Badge variant="muted">{MEAL_TYPE_LABELS[e.mealType] ?? e.mealType}</Badge>}
                </div>
                {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
                <p className="text-xs text-muted-foreground">
                  P {e.proteinG.toFixed(0)}g · C {e.carbsG.toFixed(0)}g · G {e.fatG.toFixed(0)}g ·{" "}
                  {e.eatenAt.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <DeleteEntryButton endpoint={`/api/meals/${e.id}`} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
