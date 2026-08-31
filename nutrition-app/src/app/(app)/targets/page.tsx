import { prisma } from "@/lib/db";
import { getDefaultUser } from "@/lib/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TargetsForm } from "@/components/forms/TargetsForm";

export default async function TargetsPage() {
  const user = await getDefaultUser();
  const target = await prisma.nutritionTarget.findFirst({
    where: { userId: user.id, active: true },
    orderBy: { effectiveFrom: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Objetivos nutricionales</h1>
      <Card>
        <CardHeader>
          <CardTitle>Calorías, macros y meta de composición corporal</CardTitle>
        </CardHeader>
        <CardContent>
          <TargetsForm
            defaultValues={
              target
                ? {
                    caloriesTarget: target.caloriesTarget,
                    proteinTargetG: target.proteinTargetG,
                    carbsTargetG: target.carbsTargetG,
                    fatTargetG: target.fatTargetG,
                    goalBodyFatPct: target.goalBodyFatPct,
                    goalWeightKg: target.goalWeightKg,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
