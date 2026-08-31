import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { getDefaultUser } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteEntryButton } from "@/components/DeleteEntryButton";

export default async function BodyMetricsPage() {
  const user = await getDefaultUser();
  const entries = await prisma.bodyMetricEntry.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: "desc" },
    take: 90,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Peso y composición corporal</h1>
        <Link href="/body-metrics/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        </Link>
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">Aún no hay registros. Sube tu primera foto de la báscula.</p>
      )}

      <div className="flex flex-col gap-2">
        {entries.map((e) => (
          <Card key={e.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">
                  {e.weightKg.toFixed(1)} kg
                  {e.bodyFatPercent != null && (
                    <span className="text-muted-foreground"> · {e.bodyFatPercent.toFixed(1)}% grasa</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {e.recordedAt.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <DeleteEntryButton endpoint={`/api/body-metrics/${e.id}`} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
