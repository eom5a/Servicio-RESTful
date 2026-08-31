import type { Metadata } from "next";

import { StubPage } from "@/components/marketing/stub-page";

export const metadata: Metadata = { title: "Hoy" };

export default function DashboardPage() {
  return (
    <StubPage
      title="Tus hábitos de hoy"
      description="El dashboard de check-in de un tap, con actualización optimista y animación de recompensa, se construye en la Fase 2."
      phase="Fase 2"
    />
  );
}
