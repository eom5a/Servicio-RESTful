import type { Metadata } from "next";

import { StubPage } from "@/components/marketing/stub-page";

export const metadata: Metadata = { title: "Detalle de hábito" };

export default async function HabitDetailPage(props: PageProps<"/app/habits/[id]">) {
  await props.params;

  return (
    <StubPage
      title="Detalle del hábito"
      description="Heatmap tipo GitHub, racha actual y freezes disponibles — Fase 4."
      phase="Fase 4"
    />
  );
}
