import type { Metadata } from "next";

import { StubPage } from "@/components/marketing/stub-page";

export const metadata: Metadata = { title: "Onboarding" };

export default function OnboardingPage() {
  return (
    <StubPage
      title="Bienvenida"
      description="Los 3-4 pasos de onboarding (filosofía sin rachas punitivas + primer hábito) llegan en la Fase 4."
      phase="Fase 4"
    />
  );
}
