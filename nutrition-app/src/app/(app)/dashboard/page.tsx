import Link from "next/link";
import { Scale, UtensilsCrossed, Bike, TrendingDown, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/db";
import { getDefaultUser } from "@/lib/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WeightTrendChart } from "@/components/charts/WeightTrendChart";
import { MacroProgressBars } from "@/components/charts/MacroProgressBars";
import { CoachCard } from "@/components/CoachCard";

export default async function DashboardPage() {
  const user = await getDefaultUser();

  const since = new Date();
  since.setDate(since.getDate() - 60);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [bodyMetrics, latestMetric, todayMeals, target, latestCoachNote] = await Promise.all([
    prisma.bodyMetricEntry.findMany({
      where: { userId: user.id, recordedAt: { gte: since } },
      orderBy: { recordedAt: "asc" },
    }),
    prisma.bodyMetricEntry.findFirst({ where: { userId: user.id }, orderBy: { recordedAt: "desc" } }),
    prisma.mealEntry.findMany({ where: { userId: user.id, eatenAt: { gte: todayStart } } }),
    prisma.nutritionTarget.findFirst({ where: { userId: user.id, active: true } }),
    prisma.dailyCoachNote.findFirst({ where: { userId: user.id }, orderBy: { date: "desc" } }),
  ]);

  const totals = todayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      proteinG: acc.proteinG + m.proteinG,
      carbsG: acc.carbsG + m.carbsG,
      fatG: acc.fatG + m.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );

  const previousMetric = bodyMetrics.length > 1 ? bodyMetrics[bodyMetrics.length - 2] : null;
  const bodyFatDelta =
    latestMetric?.bodyFatPercent != null && previousMetric?.bodyFatPercent != null
      ? latestMetric.bodyFatPercent - previousMetric.bodyFatPercent
      : null;

  let highlights: string[] = [];
  if (latestCoachNote?.highlights) {
    try {
      highlights = JSON.parse(latestCoachNote.highlights);
    } catch {
      highlights = [];
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle>Peso actual</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-semibold">
              {latestMetric ? `${latestMetric.weightKg.toFixed(1)} kg` : "—"}
            </div>
            {target?.goalWeightKg != null && latestMetric && (
              <p className="mt-1 text-xs text-muted-foreground">
                Objetivo {target.goalWeightKg} kg
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle>% Grasa corporal</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1.5 text-2xl font-semibold">
              {latestMetric?.bodyFatPercent != null ? `${latestMetric.bodyFatPercent.toFixed(1)}%` : "—"}
              {bodyFatDelta != null && (
                <span
                  className={`flex items-center text-xs font-medium ${bodyFatDelta < 0 ? "text-primary" : "text-warning"}`}
                >
                  {bodyFatDelta < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                  {Math.abs(bodyFatDelta).toFixed(1)}
                </span>
              )}
            </div>
            {target?.goalBodyFatPct != null && (
              <p className="mt-1 text-xs text-muted-foreground">Objetivo {target.goalBodyFatPct}%</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Link href="/body-metrics/new">
          <Button variant="outline" className="w-full flex-col gap-1 h-16">
            <Scale className="h-4 w-4" />
            <span className="text-xs">Peso</span>
          </Button>
        </Link>
        <Link href="/meals/new">
          <Button variant="outline" className="w-full flex-col gap-1 h-16">
            <UtensilsCrossed className="h-4 w-4" />
            <span className="text-xs">Comida</span>
          </Button>
        </Link>
        <Link href="/exercise/new">
          <Button variant="outline" className="w-full flex-col gap-1 h-16">
            <Bike className="h-4 w-4" />
            <span className="text-xs">Ejercicio</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendencia % grasa (60 días)</CardTitle>
        </CardHeader>
        <CardContent>
          {bodyMetrics.length > 1 ? (
            <WeightTrendChart
              data={bodyMetrics.map((m) => ({
                date: m.recordedAt.toISOString(),
                weightKg: m.weightKg,
                bodyFatPercent: m.bodyFatPercent,
              }))}
              goalBodyFatPct={target?.goalBodyFatPct}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Registra tu peso unos días seguidos para ver la tendencia.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Macros de hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {target ? (
            <MacroProgressBars
              rows={[
                { label: "Calorías", consumed: totals.calories, target: target.caloriesTarget, unit: "kcal" },
                { label: "Proteína", consumed: totals.proteinG, target: target.proteinTargetG, unit: "g" },
                { label: "Carbohidratos", consumed: totals.carbsG, target: target.carbsTargetG, unit: "g" },
                { label: "Grasa", consumed: totals.fatG, target: target.fatTargetG, unit: "g" },
              ]}
            />
          ) : (
            <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
              <p>Aún no has definido tus objetivos nutricionales.</p>
              <Link href="/targets">
                <Button size="sm" variant="outline">Definir objetivos</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <CoachCard
        latestSummary={latestCoachNote?.summary}
        latestHighlights={highlights}
        latestDate={latestCoachNote?.date.toISOString()}
      />
    </div>
  );
}
