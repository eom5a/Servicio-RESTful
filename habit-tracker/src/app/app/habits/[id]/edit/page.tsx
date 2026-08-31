import type { Metadata } from "next";

import { StubPage } from "@/components/marketing/stub-page";

export const metadata: Metadata = { title: "Editar hábito" };

export default async function EditHabitPage(props: PageProps<"/app/habits/[id]/edit">) {
  await props.params;

  return (
    <StubPage
      title="Editar hábito"
      description="Edición y archivado sin perder historial — Fase 1."
      phase="Fase 1"
    />
  );
}
