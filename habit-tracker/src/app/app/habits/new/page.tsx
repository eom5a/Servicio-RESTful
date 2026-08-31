import type { Metadata } from "next";

import { StubPage } from "@/components/marketing/stub-page";

export const metadata: Metadata = { title: "Nuevo hábito" };

export default function NewHabitPage() {
  return (
    <StubPage
      title="Nuevo hábito"
      description="Alta de hábito en menos de 30s (nombre, emoji, color, frecuencia) — Fase 1."
      phase="Fase 1"
    />
  );
}
