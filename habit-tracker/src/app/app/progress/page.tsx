import type { Metadata } from "next";

import { StubPage } from "@/components/marketing/stub-page";

export const metadata: Metadata = { title: "Progreso" };

export default function ProgressPage() {
  return (
    <StubPage
      title="Tu progreso"
      description="Resumen semanal y vista general de rachas — Fase 4."
      phase="Fase 4"
    />
  );
}
