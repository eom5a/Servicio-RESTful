import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutSessionForm } from "@/components/forms/WorkoutSessionForm";

export default function NewWorkoutPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold">Nueva sesión de gimnasio</h1>
      <Card>
        <CardHeader>
          <CardTitle>Series</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutSessionForm />
        </CardContent>
      </Card>
    </div>
  );
}
