import type { Metadata } from "next";

import { StubPage } from "@/components/marketing/stub-page";

export const metadata: Metadata = { title: "Ajustes" };

export default function SettingsPage() {
  return (
    <StubPage
      title="Ajustes"
      description="Perfil, notificaciones, timezone, exportar datos y reducir animaciones — Fase 3."
      phase="Fase 3"
    />
  );
}
